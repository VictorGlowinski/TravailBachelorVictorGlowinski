<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB; 


class PlanController extends Controller
{
    /**
     * Afficher tous les plans avec recherche optionnelle
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $keyword = $request->query('q');
            $userId = $request->query('user_id');
            
            $query = Plan::query();
            
            // Recherche par mot-clé
            if ($keyword) {
                $query->where('pla_nom', 'like', "%{$keyword}%");
            }
            
            // Filtrer par utilisateur
            if ($userId) {
                $query->where('pla_user_id', $userId);
            }
            
            $plans = $query->get();
            
            return response()->json([
                'success' => true,
                'plans' => $plans,
                'count' => $plans->count()
            ]);
            
        } catch (Exception $e) {
            Log::error('Erreur récupération plans:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des plans'
            ], 500);
        }
    }

    /**
     * Afficher un plan spécifique
     */
    public function show($id): JsonResponse
    {
        try {
            $plan = Plan::find($id);
            
            if (!$plan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan non trouvé'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'plan' => $plan
            ]);
            
        } catch (Exception $e) {
            Log::error('Erreur récupération plan:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du plan'
            ], 500);
        }
    }

    /**
     * Créer un nouveau plan
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // ✅ VALIDATION des données
            $validated = $request->validate([
                'pla_user_id' => 'required|integer|exists:users,id',
                'pla_nom' => 'required|string|max:255',
                'pla_debut' => 'nullable|date',
                'pla_fin' => 'nullable|date|after_or_equal:pla_debut'
            ]);
            
            // ✅ CRÉATION avec les méthodes Eloquent standard
            $plan = Plan::create($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Plan créé avec succès',
                'plan' => $plan // ✅ CORRECTION : Format attendu par OpenAIController
            ], 201);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
            
        } catch (Exception $e) {
            Log::error('Erreur création plan:', ['data' => $request->all(), 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un plan existant
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $plan = Plan::find($id);
            
            if (!$plan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan non trouvé'
                ], 404);
            }
            
            // ✅ VALIDATION des données
            $validated = $request->validate([
                'pla_user_id' => 'sometimes|required|integer|exists:users,id',
                'pla_nom' => 'sometimes|required|string|max:255',
                'pla_debut' => 'nullable|date',
                'pla_fin' => 'nullable|date|after_or_equal:pla_debut'
            ]);
            
            // ✅ MISE À JOUR avec Eloquent
            $plan->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Plan mis à jour avec succès',
                'plan' => $plan->fresh() // Recharger les données
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
            
        } catch (Exception $e) {
            Log::error('Erreur mise à jour plan:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du plan'
            ], 500);
        }
    }

    /**
     * Supprimer un plan
     */
    public function destroy($id): JsonResponse
    {
        try {
            $plan = Plan::find($id);
            
            if (!$plan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan non trouvé'
                ], 404);
            }
            
            // ✅ SUPPRESSION avec Eloquent
            $plan->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Plan supprimé avec succès'
            ]);
            
        } catch (Exception $e) {
            Log::error('Erreur suppression plan:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du plan'
            ], 500);
        }
    }

    /**
     * ✅ AJOUT : Récupérer les plans d'un utilisateur spécifique
     */
    public function getByUser($userId): JsonResponse
    {
        try {
            $user = User::find($userId);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }
            
            $plans = Plan::where('pla_user_id', $userId)->get();
            
            return response()->json([
                'success' => true,
                'user_id' => $userId,
                'plans' => $plans,
                'count' => $plans->count()
            ]);
            
        } catch (Exception $e) {
            Log::error('Erreur récupération plans utilisateur:', ['user_id' => $userId, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des plans'
            ], 500);
        }
    }

    public function getUserPlanComplete($userId): JsonResponse
{
    try {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // ✅ UTILISER Eloquent avec relations
        $plan = Plan::with(['jours.activites'])
                   ->where('pla_user_id', $userId)
                   ->first();

        if (!$plan) {
            return response()->json([], 404);
        }

        // ✅ TRANSFORMER les données pour le frontend
        $planData = [
            'pla_id' => $plan->pla_id,
            'pla_nom' => $plan->pla_nom,
            'pla_date_debut' => $plan->pla_debut,
            'pla_date_fin' => $plan->pla_fin,
            'pla_nb_semaines' => null,
            'jours' => []
        ];

        // ✅ TRANSFORMER les jours
        foreach ($plan->jours as $jour) {
            $jourData = [
                'jou_id' => $jour->jou_id,
                'jou_description' => $jour->jou_description,
                'jou_date' => $jour->jou_date,
                'activites' => []
            ];

            // ✅ TRANSFORMER les activités
            foreach ($jour->activites as $activite) {
                $jourData['activites'][] = [
                    'gen_id' => $activite->gen_id,
                    'gen_nom' => $activite->gen_nom,
                    'gen_type' => $activite->gen_type,
                    'gen_duree' => $activite->gen_duree,
                    'gen_distance' => $activite->gen_distance,
                    'gen_intensite' => $activite->gen_intensite,
                    'gen_commentaire' => $activite->gen_commentaire,
                    'gen_source' => $activite->gen_source
                ];
            }

            $planData['jours'][] = $jourData;
        }

        return response()->json($planData);
        
    } catch (Exception $e) {
        Log::error('Erreur getUserPlanComplete:', [
            'user_id' => $userId, 
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => 'Erreur lors de la récupération du plan'], 500);
    }
}
}