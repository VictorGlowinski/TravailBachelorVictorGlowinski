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
Route::apiResource('activite-generee', ActiviteGenereeController::class);
Route::apiResource('jour', JourController::class);
Route::apiResource('plan', PlanController::class);

Route::get('/plans/{planId}/jours', [JourController::class, 'getByPlan']);
Route::get('/jours/{jourId}/activites', [ActiviteGenereeController::class, 'getByJour']);
Route::apiResource('evaluation-initiale', EvaluationInitialeController::class);
Route::apiResource('activite-realisee', ActiviteRealiseeController::class);
Route::apiResource('anamnese', AnamneseController::class);
// Route resource pour les utilisateurs (inclut automatiquement store, index, show, update, destroy)
Route::apiResource('users', UserController::class);


    
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