<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Anamnese;
use Illuminate\Http\Request;

class AnamneseController extends Controller
{
    // Controller methods for handling anamnesis data
    // This could include methods for creating, updating, deleting, and retrieving anamnesis records
    // For example:

    public function index(Request $request)
    {
        $keyword = $request->query('q');
        return Anamnese::query()->search($keyword)->get();
    }


    public function show($id)
    {
        // Logic to retrieve a specific anamnesis record by ID
        $anamnese = Anamnese::getAnamneseById($id);
        if ($anamnese) {
            return response()->json($anamnese);
        }
        return response()->json(['message' => 'Anamnese not found'], 404);
    }

    public function store(Request $request)
    {
        $anamnese = Anamnese::createAnamnese($request->all());
        return response()->json($anamnese, 201);
    }

    public function update(Request $request, $id)
    {
        $anamnese = Anamnese::updateAnamnese($id, $request->all());
        if ($anamnese) {
            return response()->json($anamnese);
        } else {
            return response()->json(['message' => 'Anamnese not found'], 404);
        }
    }

    public function destroy($id)
    {
        $success = Anamnese::deleteAnamnese($id);
        if ($success) {
            return response()->json(['message' => 'Anamnese deleted successfully']);
        } else {
            return response()->json(['message' => 'Anamnese not found'], 404);
        }
    }

    public function getAnamneseByUserId($userId)
    {
        // Logic to retrieve all anamnesis records for a specific user
        $anamneses = Anamnese::getAnamneseByUserId($userId);
        return response()->json($anamneses);
    }
}
