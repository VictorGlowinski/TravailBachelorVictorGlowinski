<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Plan;

class PlanController extends Controller
{
    // Controller methods for handling plans
    // This could include methods for creating, updating, deleting, and retrieving plans
    // For example:

    public function index(Request $request)
    {
        $keyword = $request->query('q');
        return Plan::query()->search($keyword)->get();
    }

    public function show($id)
    {
        // Logic to retrieve a specific plan by ID
        $plan = Plan::getPlanById($id);
        if ($plan) {
            return response()->json($plan);
        }
        return response()->json(['message' => 'Plan not found'], 404);
    }

    public function store(Request $request)
    {   
        $plan = Plan::createPlan($request->all());
        return response()->json($plan, 201);
    }

    public function update(Request $request, $id)
    {
        $plan = Plan::updatePlan($id, $request->all());
        if ($plan) {
            return response()->json($plan);
        } else {
            return response()->json(['message' => 'Plan not found'], 404);
        }
    }

    public function destroy($id)
    {
        $success = Plan::deletePlan($id);
        if ($success) {
            return response()->json(['message' => 'Plan deleted successfully']);
        } else {
            return response()->json(['message' => 'Plan not found'], 404);
        }
    }
}
