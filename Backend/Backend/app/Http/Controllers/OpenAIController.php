<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\OpenAIService;
use App\Models\Anamnese;
use App\Models\EvaluationInitiale;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\JourController;
use App\Http\Controllers\ActiviteGenereeController;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Support\Facades\Log;

class OpenAIController extends Controller
{
    protected $openAIService;
    protected $planController;
    protected $jourController;
    protected $activiteController;

    public function __construct(
        OpenAIService $openAIService,
        PlanController $planController,
        JourController $jourController,
        ActiviteGenereeController $activiteController
    ) {
        $this->openAIService = $openAIService;
        $this->planController = $planController;
        $this->jourController = $jourController;
        $this->activiteController = $activiteController;
    }

    /**
     * Générer un plan d'entraînement complet avec IA
     */
    public function generateCompleteTrainingPlan(Request $request): JsonResponse
    {
        try {
            // Validation
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id'
            ]);

            $userId = $validated['user_id'];

            // 1. Récupérer les données utilisateur
            $anamnese = Anamnese::where('ana_user_id', $userId)->first();
            if (!$anamnese) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune anamnèse trouvée pour cet utilisateur'
                ], 404);
            }

            $evaluationInitiale = EvaluationInitiale::where('eva_user_id', $userId)->first();
            if (!$evaluationInitiale) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune évaluation initiale trouvée pour cet utilisateur'
                ], 404);
            }

            // 2. ÉTAPE 1 : Générer le plan avec IA
            $planResponse = $this->openAIService->generateTrainingPlan($anamnese->toArray(), $evaluationInitiale->toArray());
            $planData = json_decode($planResponse, true);
            
            if (!$planData) {
                throw new Exception('Erreur de format JSON pour le plan généré');
            }

            // Ajouter l'user_id et créer via PlanController
            $planData['pla_user_id'] = $userId;
            $planRequest = new Request($planData);
            $planResult = $this->planController->store($planRequest);
            
            if ($planResult->getStatusCode() !== 201) {
                throw new Exception('Erreur lors de la création du plan');
            }
            
            $plan = json_decode($planResult->getContent(), true)['plan'];

            // 3. ÉTAPE 2 : Générer les jours avec IA
            $joursResponse = $this->openAIService->generateTrainingDays($plan, $anamnese->toArray(), $evaluationInitiale->toArray());
            $joursData = json_decode($joursResponse, true);
            
            if (!$joursData || !is_array($joursData)) {
                throw new Exception('Erreur de format JSON pour les jours générés');
            }

            $jours = [];
            foreach ($joursData as $jourData) {
                $jourData['jou_plan_id'] = $plan['pla_id'];
                $jourRequest = new Request($jourData);
                $jourResult = $this->jourController->store($jourRequest);
                
                if ($jourResult->getStatusCode() === 201) {
                    $jour = json_decode($jourResult->getContent(), true)['jour'];
                    $jours[] = $jour;
                }
            }

            // 4. ÉTAPE 3 : Générer les activités avec IA
            $activitesResponse = $this->openAIService->generateTrainingActivities(
                $plan, 
                $jours,
                $anamnese->toArray(), 
                $evaluationInitiale->toArray()
            );
            
            $activitesData = json_decode($activitesResponse, true);
            
            $activitesCreees = [];
            if ($activitesData && is_array($activitesData)) {
                // Créer un mapping des jours
                $jourMapping = collect($jours)->keyBy('jou_id');
                
                foreach ($activitesData as $activiteData) {
                    $genJourId = isset($activiteData['gen_jour_id']) ? (int)$activiteData['gen_jour_id'] : null;
                    
                    // Vérifier si le jour existe
                    if (!$genJourId || !$jourMapping->has($genJourId)) {
                        $activiteData['gen_jour_id'] = $jours[0]['jou_id'];
                    } else {
                        $activiteData['gen_jour_id'] = $genJourId;
                    }
                    
                    $activiteRequest = new Request($activiteData);
                    $activiteResult = $this->activiteController->store($activiteRequest);
                    
                    if ($activiteResult->getStatusCode() === 201) {
                        $activite = json_decode($activiteResult->getContent(), true)['activite_generee'];
                        $activitesCreees[] = $activite;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Plan d\'entraînement complet généré avec succès',
                'data' => [
                    'plan' => $plan,
                    'jours_count' => count($jours),
                    'activites_count' => count($activitesCreees)
                ]
            ], 201);

        } catch (Exception $e) {
            Log::error('Erreur génération plan complet IA:', [
                'error' => $e->getMessage(),
                'user_id' => $request->input('user_id')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du plan d\'entraînement complet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Debug des activités
     */
    public function debugTrainingActivities(Request $request)
    {
        try {
            $planId = $request->plan_id ?? 1;
            $userId = $request->user_id ?? 4;
            
            // Récupération via les contrôleurs
            $planRequest = new Request(['id' => $planId]);
            $planResult = $this->planController->show($planRequest, $planId);
            
            if ($planResult->getStatusCode() !== 200) {
                throw new Exception('Plan non trouvé');
            }
            
            $plan = json_decode($planResult->getContent(), true)['plan'];
            
            // Récupérer les jours via JourController (vous devrez créer cette méthode)
            $joursRequest = new Request(['jou_plan_id' => $planId]);
            $joursResult = $this->jourController->getByPlan($joursRequest, $planId);
            $jours = json_decode($joursResult->getContent(), true)['jours'];
            
            $anamnese = Anamnese::where('ana_user_id', $userId)->firstOrFail();
            $evaluationInitiale = EvaluationInitiale::where('eva_user_id', $userId)->firstOrFail();
            
            // Test génération activités
            $activitesResponse = $this->openAIService->generateTrainingActivities(
                $plan, 
                $jours,
                $anamnese->toArray(), 
                $evaluationInitiale->toArray()
            );
            
            $activitesData = json_decode($activitesResponse, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'error' => 'JSON invalide',
                    'json_error' => json_last_error_msg(),
                    'raw_response' => $activitesResponse
                ]);
            }
            
            // Test création via ActiviteGenereeController
            $activitesCreees = [];
            if ($activitesData && is_array($activitesData)) {
                foreach ($activitesData as $activiteData) {
                    $activiteData['gen_jour_id'] = $jours[0]['jou_id'] ?? 1;
                    $activiteRequest = new Request($activiteData);
                    $activiteResult = $this->activiteController->store($activiteRequest);
                    
                    if ($activiteResult->getStatusCode() === 201) {
                        $activite = json_decode($activiteResult->getContent(), true)['activite_generee'];
                        $activitesCreees[] = $activite;
                    }
                }
            }
            
            return response()->json([
                'success' => true,
                'activites_generees' => count($activitesCreees),
                'raw_response' => $activitesResponse,
                'parsed_data' => $activitesData
            ]);
            
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Générer seulement un plan (sans jours ni activités)
     */
    public function generateTrainingPlan(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id'
            ]);

            $userId = $validated['user_id'];
            $anamnese = Anamnese::where('ana_user_id', $userId)->firstOrFail();
            $evaluationInitiale = EvaluationInitiale::where('eva_user_id', $userId)->firstOrFail();

            $planResponse = $this->openAIService->generateTrainingPlan($anamnese->toArray(), $evaluationInitiale->toArray());
            $planData = json_decode($planResponse, true);
            
            if (!$planData) {
                throw new Exception('Erreur de format JSON pour le plan');
            }

            $planData['pla_user_id'] = $userId;
            $planRequest = new Request($planData);
            $planResult = $this->planController->store($planRequest);

            if ($planResult->getStatusCode() !== 201) {
                throw new Exception('Erreur lors de la création du plan');
            }

            return $planResult; // Retourner directement la réponse du PlanController

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
