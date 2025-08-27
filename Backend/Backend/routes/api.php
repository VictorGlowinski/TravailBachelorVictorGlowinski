<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ActiviteGenereeController;
use App\Http\Controllers\JourController;
use App\Http\Controllers\AnamneseController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\EvaluationInitialeController;
use App\Http\Controllers\ActiviteRealiseeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OpenAIController;

use Illuminate\Http\Request;

// Routes pour les ressources API
Route::apiResource('jour', JourController::class);
Route::get('/jours/user/{userId}', [JourController::class, 'getUserJours']);
Route::get('/jours/user/{userId}/today', [JourController::class, 'getTodayActivitiesForUser']);

Route::get('/jours/{jourId}/activites', [ActiviteGenereeController::class, 'getByJour']);
Route::apiResource('activite-generee', ActiviteGenereeController::class);


Route::apiResource('activite-realisee', ActiviteRealiseeController::class);

Route::get('/anamnese/user/{userId}', [AnamneseController::class, 'getAnamneseByUserId']);
Route::apiResource('anamnese', AnamneseController::class);

Route::get('/evaluation-initiale/user/{userId}', [EvaluationInitialeController::class, 'getEvaluationInitialeByUserId']);
Route::apiResource('evaluation-initiale', EvaluationInitialeController::class);

Route::apiResource('plan', PlanController::class);
Route::get('/plans/{planId}/jours', [JourController::class, 'getByPlan']);
Route::get('/plans/user/{userId}', [PlanController::class, 'getPlanByUserID']);
Route::get('/plans/user/{userId}/complete', [PlanController::class, 'getUserPlanComplete']);
// Route resource pour les utilisateurs (inclut automatiquement store, index, show, update, destroy)
Route::apiResource('users', UserController::class);


Route::apiResource('retour', RetourController::class);

// Route pour l'utilisateur authentifié
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('ai')->group(function () {
    Route::post('/generate-complete-plan', [OpenAIController::class, 'generateCompleteTrainingPlan']);
    Route::post('/generate-training-plan', [OpenAIController::class, 'generateTrainingPlan']);
    Route::post('/generate-training-days', [OpenAIController::class, 'generateTrainingDays']);
    Route::post('/generate-training-activities', [OpenAIController::class, 'generateTrainingActivities']);
    Route::post('/debug-activities', [OpenAIController::class, 'debugTrainingActivities']); 
});

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/logout', [UserController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [UserController::class, 'me'])->middleware('auth:sanctum');