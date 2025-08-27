<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RetourController extends Controller
{
    public function index(Request $request)
    {
        $keyword = $request->query('q');
        return Retour::query()->search($keyword)->get();
    }


    public function show($id)
    {
        // Logic to retrieve a specific retour record by ID
        $retour = Retour::getRetourById($id);
        if ($retour) {
            return response()->json($retour);
        }
        return response()->json(['message' => 'Retour not found'], 404);
    }

    public function store(Request $request)
    {
        $retour = Retour::createRetour($request->all());
        return response()->json($retour, 201);
    }

    public function update(Request $request, $id)
    {
        $retour = Retour::updateRetour($id, $request->all());
        if ($retour) {
            return response()->json($retour);
        } else {
            return response()->json(['message' => 'Retour not found'], 404);
        }
    }

    public function destroy($id)
    {
        $success = Retour::deleteRetour($id);
        if ($success) {
            return response()->json(['message' => 'Retour deleted successfully']);
        } else {
            return response()->json(['message' => 'Retour not found'], 404);
        }
    }

    public function getRetourByUserId($userId)
    {
        // Logic to retrieve all retour records for a specific user
        $retours = Retour::where('ret_user_id', $userId)->get();
        return response()->json($retours);
    }
}
