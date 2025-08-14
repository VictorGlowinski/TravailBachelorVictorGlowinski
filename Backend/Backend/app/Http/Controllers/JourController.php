<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Jour;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Support\Facades\Log;

class JourController extends Controller
{
    /**
     * Afficher tous les jours avec recherche optionnelle
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $keyword = $request->query('q');
            $planId = $request->query('plan_id');
            
            $query = Jour::query();
            
            // Recherche par mot-clé
            if ($keyword) {
                $query->search($keyword);
            }
            
            // Filtrer par plan
            if ($planId) {
                $query->where('jou_plan_id', $planId);
            }
            
            $jours = $query->orderBy('jou_date')->get();
            
            return response()->json([
                'success' => true,
                'jours' => $jours,
                'count' => $jours->count()
            ]);
            
        } catch (Exception $e) {
            Log::error('Erreur récupération jours:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des jours'
            ], 500);
        }
    }

    /**
     * Afficher un jour spécifique
     */
    public function show($id): JsonResponse
    {
        try {
            $jour = Jour::find($id);
            
            if (!$jour) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jour non trouvé'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'jour' => $jour
            ]);
            
        } catch (Exception $e) {
            Log::error('Erreur récupération jour:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du jour'
            ], 500);
        }
    }

    /**
     * Créer un nouveau jour
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // ✅ VALIDATION des données
            $validated = $request->validate([
                'jou_plan_id' => 'required|integer|exists:plan,pla_id',
                'jou_date' => 'required|date',
                'jou_description' => 'nullable|string|max:1000'
            ]);
            
            // ✅ CRÉATION avec Eloquent standard
            $jour = Jour::create($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Jour créé avec succès',
                'jour' => $jour // ✅ CORRECTION : Format attendu par OpenAIController
            ], 201);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
            
        } catch (Exception $e) {
            Log::error('Erreur création jour:', ['data' => $request->all(), 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un jour existant
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $jour = Jour::find($id);
            
            if (!$jour) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jour non trouvé'
                ], 404);
            }
            
            // ✅ VALIDATION des données
            $validated = $request->validate([
                'jou_plan_id' => 'sometimes|required|integer|exists:plan,pla_id',
                'jou_date' => 'sometimes|required|date',
                'jou_description' => 'nullable|string|max:1000'
            ]);
            
            // ✅ MISE À JOUR avec Eloquent
            $jour->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Jour mis à jour avec succès',
                'jour' => $jour->fresh()
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
            
        } catch (Exception $e) {
            Log::error('Erreur mise à jour jour:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du jour'
            ], 500);
        }
    }

    /**
     * Supprimer un jour
     */
    public function destroy($id): JsonResponse
    {
        try {
            $jour = Jour::find($id);
            
            if (!$jour) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jour non trouvé'
                ], 404);
            }
            
            $jour->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Jour supprimé avec succès'
            ]);
            
        } catch (Exception $e) {
            Log::error('Erreur suppression jour:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du jour'
            ], 500);
        }
    }

    /**
     * ✅ AJOUT : Récupérer les jours d'un plan spécifique
     */
    public function getByPlan(Request $request, $planId): JsonResponse
    {
        try {
            $plan = Plan::find($planId);
            if (!$plan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan non trouvé'
                ], 404);
            }
            
            $jours = Jour::where('jou_plan_id', $planId)
                         ->orderBy('jou_date')
                         ->get();
            
            return response()->json([
                'success' => true,
                'plan_id' => $planId,
                'jours' => $jours,
                'count' => $jours->count()
            ]);
            
        } catch (Exception $e) {
            Log::error('Erreur récupération jours par plan:', ['plan_id' => $planId, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des jours'
            ], 500);
        }
    }
}