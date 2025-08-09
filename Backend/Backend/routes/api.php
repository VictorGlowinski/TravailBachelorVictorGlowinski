<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ActiviteGenereeController;
use App\Http\Controllers\JourController;
use App\Http\Controllers\AnamneseController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\EvaluationInitialeController;
use App\Http\Controllers\ActiviteRealiseeController;

Route::apiResource('activite-generee', ActiviteGenereeController::class);
Route::apiResource('jour', JourController::class);
Route::apiResource('anamnese', AnamneseController::class);
Route::apiResource('plan', PlanController::class);
Route::apiResource('evaluation-initiale', EvaluationInitialeController::class);
Route::apiResource('activite-realisee', ActiviteRealiseeController::class);
Route::get('jour/user/{userId}', [JourController::class, 'getJoursByUserId'])->name('jour.user');
Route::get('anamnese/user/{userId}', [AnamneseController::class, 'getAnamneseByUserId'])->name('anamnese.user');
Route::get('evaluation-initiale/user/{userId}', [EvaluationInitialeController::class, 'getEvaluationsByUserId'])->name('evaluation-initiale.user');
Route::get('activite-realisee/user/{userId}', [ActiviteRealiseeController::class, 'getActivitesRealiseesByUserId'])->name('activite-realisee.user');
Route::get('activite-generee/user/{userId}', [ActiviteGenereeController::class, 'getActivitesGenereesByUserId'])->name('activite-generee.user');
Route::get('plan/user/{userId}', [PlanController::class, 'getPlansByUserId'])->name('plan.user');



