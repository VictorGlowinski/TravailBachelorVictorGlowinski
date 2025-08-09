<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EvaluationInitialeController extends Controller
{
    // Controller methods for handling initial evaluations
    // This could include methods for creating, updating, deleting, and retrieving evaluations
    // For example:

    public function index(Request $request)
    {
        // Logic to retrieve and return all initial evaluations
        $evaluations = EvaluationInitiale::getAllEvaluationsInitiales();
        return response()->json($evaluations);
    }

    public function show($id)
    {
        // Logic to retrieve a specific initial evaluation by ID
        $evaluation = EvaluationInitiale::getEvaluationInitialeById($id);
        if ($evaluation) {
            return response()->json($evaluation);
        }
        return response()->json(['message' => 'Evaluation not found'], 404);
    }

    public function store(Request $request)
    {
        $evaluation = EvaluationInitiale::createEvaluation($request->all());
        return response()->json($evaluation, 201);
    }

    public function update(Request $request, $id)
    {
        $evaluation = EvaluationInitiale::updateEvaluation($id, $request->all());
        if ($evaluation) {
            return response()->json($evaluation);
        } else {
            return response()->json(['message' => 'Evaluation not found'], 404);
        }
    }

    public function destroy($id)
    {
        $success = EvaluationInitiale::deleteEvaluation($id);
        if ($success) {
            return response()->json(['message' => 'Evaluation deleted successfully']);
        } else {
            return response()->json(['message' => 'Evaluation not found'], 404);
        }
    }

    public function getEvaluationsByUserId($userId)
    {
        // Logic to retrieve all initial evaluations for a specific user
        $evaluations = EvaluationInitiale::getEvaluationsByUserId($userId);
        return response()->json($evaluations);
    }
}
