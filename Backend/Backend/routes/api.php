<?php
// routes/api.php - VERSION SÉCURISÉE

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ActiviteGenereeController;
use App\Http\Controllers\JourController;
use App\Http\Controllers\AnamneseController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\EvaluationInitialeController;
use App\Http\Controllers\ActiviteRealiseeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OpenAIController;
use App\Http\Controllers\RetourController;
use Illuminate\Http\Request;

// ✅ ROUTES PUBLIQUES (NON AUTHENTIFIÉES)
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// ✅ ROUTES PROTÉGÉES (AUTHENTIFICATION REQUISE)
Route::middleware('auth:sanctum')->group(function () {
    
    // 🔐 UTILISATEUR AUTHENTIFIÉ
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/me', [UserController::class, 'me']);
    Route::post('/logout', [UserController::class, 'logout']);
    
    // 🔐 GESTION UTILISATEURS (Admin uniquement recommandé)
    Route::apiResource('users', UserController::class)->except(['store']); // store = register
    Route::put('/users/{id}/password', [UserController::class, 'updatePassword']);
    
    // 🔐 ANAMNÈSE (Données sensibles de santé)
    Route::get('/anamnese/user/{userId}', [AnamneseController::class, 'getAnamneseByUserId']);
    Route::apiResource('anamnese', AnamneseController::class);
    
    // 🔐 ÉVALUATION INITIALE (Données sensibles de santé)
    Route::get('/evaluation-initiale/user/{userId}', [EvaluationInitialeController::class, 'getEvaluationInitialeByUserId']);
    Route::apiResource('evaluation-initiale', EvaluationInitialeController::class);
    
    // 🔐 PLANS D'ENTRAÎNEMENT (Données personnelles)
    Route::apiResource('plan', PlanController::class);
    Route::get('/plans/{planId}/jours', [JourController::class, 'getByPlan']);
    Route::get('/plans/user/{userId}', [PlanController::class, 'getPlanByUserID']);
    Route::get('/plans/user/{userId}/complete', [PlanController::class, 'getUserPlanComplete']);
    
    // 🔐 JOURS ET ACTIVITÉS (Données personnelles)
    Route::apiResource('jour', JourController::class);
    Route::get('/jours/user/{userId}', [JourController::class, 'getUserJours']);
    Route::get('/jours/user/{userId}/today', [JourController::class, 'getTodayActivitiesForUser']);
    Route::get('/jours/{jourId}/activites', [ActiviteGenereeController::class, 'getByJour']);
    
    // 🔐 ACTIVITÉS GÉNÉRÉES ET RÉALISÉES
    Route::apiResource('activite-generee', ActiviteGenereeController::class);
    Route::apiResource('activite-realisee', ActiviteRealiseeController::class);
    
    // 🔐 RETOURS/FEEDBACK
    Route::apiResource('retour', RetourController::class);
    
    // 🔐 IA - RESSOURCES COÛTEUSES (Protection contre abus)
    Route::prefix('ai')->group(function () {
    Route::post('/generate-complete-plan', [OpenAIController::class, 'generateCompleteTrainingPlan']);
    Route::post('/generate-training-plan', [OpenAIController::class, 'generateTrainingPlan']);
    Route::post('/generate-training-days', [OpenAIController::class, 'generateTrainingDays']);
    Route::post('/generate-training-activities', [OpenAIController::class, 'generateTrainingActivities']);
    Route::post('/debug-activities', [OpenAIController::class, 'debugTrainingActivities']); 
    });

});
