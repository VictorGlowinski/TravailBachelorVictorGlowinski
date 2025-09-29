<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Retour;
use Illuminate\Http\JsonResponse;

class RetourController extends Controller
{
    /**
     * Liste tous les retours
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $keyword = $request->query('q');
            $retours = Retour::query()->search($keyword)->get();
            
            return response()->json([
                'success' => true,
                'retours' => $retours
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des retours',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau retour
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // VALIDATION avec les bons noms de champs
            $validatedData = $request->validate([
                'ret_commentaire' => 'required|string|max:1000',
                'ret_date' => 'nullable|date',
                'ret_user_id' => 'nullable|exists:users,id'
            ]);

            // AJOUTER l'utilisateur authentifié si non fourni
            if (auth()->check() && !isset($validatedData['ret_user_id'])) {
                $validatedData['ret_user_id'] = auth()->id();
            }

            // AJOUTER la date actuelle si non fournie
            if (!isset($validatedData['ret_date'])) {
                $validatedData['ret_date'] = now()->format('Y-m-d');
            }

            $retour = Retour::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Feedback envoyé avec succès',
                'retour' => $retour
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un retour spécifique
     */
    public function show($id): JsonResponse
    {
        try {
            $retour = Retour::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'retour' => $retour
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Retour non trouvé'
            ], 404);
        }
    }

    /**
     * Mettre à jour un retour
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $retour = Retour::findOrFail($id);
            
            $validatedData = $request->validate([
                'ret_commentaire' => 'sometimes|required|string|max:1000',
                'ret_date' => 'sometimes|date'
            ]);

            $retour->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Retour mis à jour avec succès',
                'retour' => $retour
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Retour non trouvé'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un retour
     */
    public function destroy($id): JsonResponse
    {
        try {
            $retour = Retour::findOrFail($id);
            $retour->delete();

            return response()->json([
                'success' => true,
                'message' => 'Retour supprimé avec succès'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Retour non trouvé'
            ], 404);
        }
    }

    /**
     * Retours par utilisateur
     */
    public function getRetourByUserId($userId): JsonResponse
    {
        try {
            $retours = Retour::where('ret_user_id', $userId)
                           ->orderBy('ret_date', 'desc')
                           ->get();

            return response()->json([
                'success' => true,
                'retours' => $retours
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}