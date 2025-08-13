<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EvaluationInitiale;

class EvaluationInitialeController extends Controller
{
    // Controller methods for handling initial evaluations
    // This could include methods for creating, updating, deleting, and retrieving evaluations
    // For example:

    public function index(Request $request)
    {
        $keyword = $request->query('q');
        return EvaluationInitiale::query()->search($keyword)->get();
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
        $evaluation = EvaluationInitiale::createEvaluationInitiale($request->all());
        return response()->json($evaluation, 201);
    }

    public function update(Request $request, $id)
    {
        $evaluation = EvaluationInitiale::updateEvaluationInitiale($id, $request->all());
        if ($evaluation) {
            return response()->json($evaluation);
        } else {
            return response()->json(['message' => 'Evaluation not found'], 404);
        }
    }

    public function destroy($id)
    {
        $success = EvaluationInitiale::deleteEvaluationInitiale($id);
        if ($success) {
            return response()->json(['message' => 'Evaluation deleted successfully']);
        } else {
            return response()->json(['message' => 'Evaluation not found'], 404);
        }
    }

    public function getEvaluationInitialeByUserId($userId)
    {
        // Logic to retrieve all initial evaluations for a specific user
        $evaluations = EvaluationInitiale::getEvaluationInitialeByUserId($userId);
        return response()->json($evaluations);
    }
}
