<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    /**
     * Créer un nouvel utilisateur
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'string', 'min:8'],
            'use_date_naissance' => 'nullable|date|before:today',
            'use_consentement' => 'required|boolean',
        ]);

        $user = User::create([
            'email' => $validated['email'],
            'password' => $validated['password'],
            'use_date_naissance' => $validated['use_date_naissance'] ?? null,
            'use_consentement' => $validated['use_consentement'],
            'use_derniere_connexion' => now(),
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'use_date_naissance' => $user->use_date_naissance,
                'use_consentement' => $user->use_consentement,
                'created_at' => $user->created_at,
            ]
        ], 201);
    }

    /**
     * Récupérer tous les utilisateurs
     */
    public function index(): JsonResponse
    {
        $users = User::select('id', 'email', 'use_date_naissance', 'use_consentement', 'use_derniere_connexion', 'created_at')->get();
        
        return response()->json([
            'users' => $users
        ]);
    }

    /**
     * Récupérer un utilisateur par ID
     */
    public function show($id): JsonResponse
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'use_date_naissance' => $user->use_date_naissance,
                'use_consentement' => $user->use_consentement,
                'use_derniere_connexion' => $user->use_derniere_connexion,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $validated = $request->validate([
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'string', 'min:8'],
            'use_date_naissance' => 'nullable|date|before:today',
            'use_consentement' => 'boolean',
        ]);

        $user->email = $validated['email'];
        if (isset($validated['password'])) {
            $user->password = $validated['password'];
        }
        $user->use_date_naissance = $validated['use_date_naissance'] ?? $user->use_date_naissance;
        $user->use_consentement = $validated['use_consentement'] ?? $user->use_consentement;
        $user->save();

        return response()->json(['message' => 'Utilisateur mis à jour avec succès']);
    }
}