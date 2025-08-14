<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ActiviteGeneree;
use App\Models\Jour;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Support\Facades\Log;

class ActiviteGenereeController extends Controller
{
    /**
     * Afficher toutes les activités avec recherche optionnelle
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $keyword = $request->query('q');
            $jourId = $request->query('jour_id');
            $type = $request->query('type');
            
            $query = ActiviteGeneree::query();
            
            // Recherche par mot-clé
            if ($keyword) {
                $query->search($keyword);
            }
            
            // Filtrer par jour
            if ($jourId) {
                $query->where('gen_jour_id', $jourId);
            }
            
            // Filtrer par type
            if ($type) {
                $query->where('gen_type', $type);
            }
            
            $activites = $query->get();
            
            return response()->json([
                'success' => true,
                'activites' => $activites,
                'count' => $activites->count()
            ]);
            
        } catch (Exception $e) {
            Log::error('Erreur récupération activités:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des activités'
            ], 500);
        }
    }

    /**
     * Afficher une activité spécifique
     */
    public function show($id): JsonResponse
    {
        try {
            $activite = ActiviteGeneree::find($id);
            
            if (!$activite) {
                return response()->json([
                    'success' => false,
                    'message' => 'Activité non trouvée'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'activite_generee' => $activite
            ]);
            
        } catch (Exception $e) {
            Log::error('Erreur récupération activité:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'activité'
            ], 500);
        }
    }

    /**
     * Créer une nouvelle activité
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // ✅ VALIDATION des données
            $validated = $request->validate([
                'gen_jour_id' => 'required|integer|exists:jour,jou_id',
                'gen_nom' => 'nullable|string|max:255',
                'gen_type' => 'required|string|max:100',
                'gen_duree' => 'required|string|max:50', // Gardé string comme dans votre modèle
                'gen_distance' => 'nullable|numeric|min:0',
                'gen_intensite' => 'required|string|max:100',
                'gen_commentaire' => 'nullable|string|max:1000',
                'gen_source' => 'required|string|max:100'
            ]);
            
            // ✅ CRÉATION avec Eloquent standard
            $activite = ActiviteGeneree::create($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Activité créée avec succès',
                'activite_generee' => $activite // ✅ CORRECTION : Format attendu par OpenAIController
            ], 201);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
            
        } catch (Exception $e) {
            Log::error('Erreur création activité:', ['data' => $request->all(), 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'activité',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour une activité existante
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $activite = ActiviteGeneree::find($id);
            
            if (!$activite) {
                return response()->json([
                    'success' => false,
                    'message' => 'Activité non trouvée'
                ], 404);
            }
            
            // ✅ VALIDATION des données
            $validated = $request->validate([
                'gen_jour_id' => 'sometimes|required|integer|exists:jour,jou_id',
                'gen_nom' => 'nullable|string|max:255',
                'gen_type' => 'sometimes|required|string|max:100',
                'gen_duree' => 'sometimes|required|string|max:50',
                'gen_distance' => 'nullable|numeric|min:0',
                'gen_intensite' => 'sometimes|required|string|max:100',
                'gen_commentaire' => 'nullable|string|max:1000',
                'gen_source' => 'sometimes|required|string|max:100'
            ]);
            
            // ✅ MISE À JOUR avec Eloquent
            $activite->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Activité mise à jour avec succès',
                'activite_generee' => $activite->fresh()
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
            
        } catch (Exception $e) {
            Log::error('Erreur mise à jour activité:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'activité'
            ], 500);
        }
    }

    /**
     * Supprimer une activité
     */
    public function destroy($id): JsonResponse
    {
        try {
            $activite = ActiviteGeneree::find($id);
            
            if (!$activite) {
                return response()->json([
                    'success' => false,
                    'message' => 'Activité non trouvée'
                ], 404);
            }
            
            $activite->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Activité supprimée avec succès'
            ]);
            
        } catch (Exception $e) {
            Log::error('Erreur suppression activité:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'activité'
            ], 500);
        }
    }

    /**
     * ✅ AJOUT : Récupérer les activités d'un jour spécifique
     */
    public function getByJour(Request $request, $jourId): JsonResponse
    {
        try {
            $jour = Jour::find($jourId);
            if (!$jour) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jour non trouvé'
                ], 404);
            }
            
            $activites = ActiviteGeneree::where('gen_jour_id', $jourId)->get();
            
            return response()->json([
                'success' => true,
                'jour_id' => $jourId,
                'activites' => $activites,
                'count' => $activites->count()
            ]);
            
        } catch (Exception $e) {
            Log::error('Erreur récupération activités par jour:', ['jour_id' => $jourId, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des activités'
            ], 500);
        }
    }
}