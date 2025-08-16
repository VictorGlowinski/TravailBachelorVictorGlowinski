<?php


namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    // ✅ MÉTHODE CORRIGÉE : Inscription
    public function register(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:6|confirmed',
                'use_date_naissance' => 'required|date|before:today', 
                'use_consentement' => 'required|accepted',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Créer l'utilisateur
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'use_date_naissance' => $request->use_date_naissance,
                'use_consentement' => $request->use_consentement,
                'use_derniere_connexion' => now(),
            ]);

            // Créer un token Sanctum
            $token = $user->createToken('mobile-app')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès',
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'use_date_naissance' => $user->use_date_naissance,
                    'use_consentement' => $user->use_consentement,
                    'created_at' => $user->created_at,
                ],
                'token' => $token
            ], 201);

        } catch (\Exception $e) {
            // AJOUT : Log pour débugger
            \Log::error('Erreur registration:', [
                'message' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du compte',
                'error' => $e->getMessage() // ✅ AJOUT : Détail de l'erreur en dev
            ], 500);
        }
    }

    // ✅ MÉTHODE CORRIGÉE : Connexion
    public function login(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Vérifier les credentials
            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email ou mot de passe incorrect'
                ], 401);
            }

            $user = Auth::user();
            
            // Mettre à jour la dernière connexion
            $user->update(['use_derniere_connexion' => now()]);

            // Créer un token Sanctum
            $token = $user->createToken('mobile-app')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Connexion réussie',
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'use_date_naissance' => $user->use_date_naissance,
                    'use_consentement' => $user->use_consentement,
                    'created_at' => $user->created_at,
                ],
                'token' => $token
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur login:', [
                'message' => $e->getMessage(),
                'request' => $request->only('email')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la connexion'
            ], 500);
        }
    }

    // ✅ MÉTHODE CORRIGÉE : Récupérer l'utilisateur connecté
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $request->user()->id,
                'email' => $request->user()->email,
                'use_date_naissance' => $request->user()->use_date_naissance,
                'use_consentement' => $request->user()->use_consentement,
                'created_at' => $request->user()->created_at,
            ]
        ]);
    }

    // ✅ NOUVELLE MÉTHODE : Déconnexion
    public function logout(Request $request): JsonResponse
    {
        try {
            // Supprimer le token actuel
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Déconnexion réussie'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la déconnexion'
            ], 500);
        }
    }

    // ... reste des méthodes inchangées (store, index, show, destroy, update)
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
            'password' => Hash::make($validated['password']),
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

    public function index(): JsonResponse
    {
        $users = User::select('id', 'email', 'use_date_naissance', 'use_consentement', 'use_derniere_connexion', 'created_at')->get();
        
        return response()->json([
            'users' => $users
        ]);
    }

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
            $user->password = Hash::make($validated['password']);
        }
        $user->use_date_naissance = $validated['use_date_naissance'] ?? $user->use_date_naissance;
        $user->use_consentement = $validated['use_consentement'] ?? $user->use_consentement;
        $user->save();

        return response()->json(['message' => 'Utilisateur mis à jour avec succès']);
    }
}