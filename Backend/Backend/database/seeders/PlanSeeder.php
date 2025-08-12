<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Plan;
use Carbon\Carbon;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Utilisateur 1 — Objectif Ironman
        Plan::create([
            'pla_user_id'   => 1,
            'pla_nom'       => 'Préparation Ironman - Reprise progressive',
            'pla_debut'=> Carbon::now()->format('Y-m-d'),
            'pla_fin'  => Carbon::now()->addMonths(6)->format('Y-m-d'),
            
        ]);

        // Utilisateur 2 — Objectif Triathlon olympique
        Plan::create([
            'pla_user_id'   => 2,
            'pla_nom'       => 'Préparation Triathlon Olympique',
            'pla_debut'=> Carbon::now()->format('Y-m-d'),
            'pla_fin'  => Carbon::now()->addWeeks(12)->format('Y-m-d'),
            
        ]);

        // Utilisateur 3 — Objectif Triathlon sprint
        Plan::create([
            'pla_user_id'   => 3,
            'pla_nom'       => 'Préparation Triathlon Sprint - Lombaires',
            'pla_debut'=> Carbon::now()->format('Y-m-d'),
            'pla_fin'  => Carbon::now()->addWeeks(8)->format('Y-m-d'),
            
        ]);
    }
}
