<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JourController extends Controller
{
    public function index(Request $request)
    {
        // Logic to retrieve and return all "jour" records
        $jours = Jour::getAllJours();
        return response()->json($jours);
    }

    public function show($id)
    {
        // Logic to retrieve a specific "jour" record by ID
        $jour = Jour::getJourById($id);
        if ($jour) {
            return response()->json($jour);
        }
        return response()->json(['message' => 'Jour not found'], 404);
    }

    public function store(Request $request)
    {
        $jour = Jour::createJour($request->all());
        return response()->json($jour, 201);
    }

    public function update(Request $request, $id)
    {
        $jour = Jour::updateJour($id, $request->all());
        if ($jour) {
            return response()->json($jour);
        } else {
            return response()->json(['message' => 'Jour not found'], 404);
        }
    }

    public function destroy($id)
    {
        $success = Jour::deleteJour($id);
        if ($success) {
            return response()->json(['message' => 'Jour deleted successfully']);
        } else {
            return response()->json(['message' => 'Jour not found'], 404);
        }
    }

    public function getJoursByUserId($userId)
    {
        // Logic to retrieve all "jour" records for a specific user
        $jours = Jour::getJoursByUserId($userId);
        return response()->json($jours);
    }
}
