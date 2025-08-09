<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ActiviteRealiseeController extends Controller
{
    // Controller methods for handling activities realized by the user
    // This could include methods for creating, updating, deleting, and retrieving activities
    // For example:
    
    public function index(Request $request)
    {
        // Logic to retrieve and return all realized activities
        $activities = ActiviteRealisee::getAllActivitesRealisees();
        return response()->json($activities);
    }

    public function show($id)
    {
        // Logic to retrieve a specific realized activity by ID
        $activity = ActiviteRealisee::getActiviteRealiseeById($id);
        if ($activity) {
            return response()->json($activity);
        }
        return response()->json(['message' => 'Activity not found'], 404);
    }

    public function store(Request $request)
    {
        $activity = ActiviteRealisee::createActiviteRealisee($request->all());
        return response()->json($activity, 201);
    }

    public function update(Request $request, $id)
    {
        $activity = ActiviteRealisee::updateActiviteRealisee($id, $request->all());
        if ($activity) {
            return response()->json($activity);
        } else {
            return response()->json(['message' => 'Activity not found'], 404);
        }
    }

    public function destroy($id)
    {
        $success = ActiviteRealisee::deleteActiviteRealisee($id);
        if ($success) {
            return response()->json(['message' => 'Activity deleted successfully']);
        } else {
            return response()->json(['message' => 'Activity not found'], 404);
        }
    }

    public function getActivitiesByUserId($userId)
    {
        // Logic to retrieve all activities realized by a specific user
        $activities = ActiviteRealisee::where('rea_user_id', $userId)->get();
        return response()->json($activities);
    }
}
