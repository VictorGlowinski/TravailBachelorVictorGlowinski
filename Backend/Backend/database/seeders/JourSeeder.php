<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Jour;
use App\Models\Plan;
use Database\Seeders\PlanSeeder;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class JourSeeder extends Seeder
{
    public function run(): void
    {
        Jour::create([
            'jou_plan_id'     => 1,
            'jou_date'        => Carbon::now()->format('Y-m-d'),
            'jou_description' => 'Natation technique + gainage (reprise genou)',
        ]);
        Jour::create([
            'jou_plan_id'     => 2,
            'jou_date'        => Carbon::now()->addDays(1)->format('Y-m-d'),
            'jou_description' => 'Course footing Z2',
        ]);

        Jour::create([
            'jou_plan_id'     => 3,
            'jou_date'        => Carbon::now()->addDays(2)->format('Y-m-d'),
            'jou_description' => 'Vélo Z2 – endurance fondamentale',
        ]);

        Jour::create([
            'jou_plan_id'     => 1,
            'jou_date'        => Carbon::now()->addDays(3)->format('Y-m-d'),
            'jou_description' => 'Natation endurance',
        ]);
        Jour::create([
            'jou_plan_id'     => 2,
            'jou_date'        => Carbon::now()->addDays(4)->format('Y-m-d'),
            'jou_description' => 'Vélo tempo 3x8 min',
        ]);

        Jour::create([
            'jou_plan_id'     => 3,
            'jou_date'        => Carbon::now()->addDays(5)->format('Y-m-d'),
            'jou_description' => 'Brick court (attention posture)',
        ]);

        Jour::create([
            'jou_plan_id'     => 1,
            'jou_date'        => Carbon::now()->addDays(6)->format('Y-m-d'),
            'jou_description' => 'Natation récupération',
        ]);

        Jour::create([
            'jou_plan_id'     => 2,
            'jou_date'        => Carbon::now()->addDays(7)->format('Y-m-d'),
            'jou_description' => 'Course footing Z2',
        ]);

        Jour::create([
            'jou_plan_id'     => 3,
            'jou_date'        => Carbon::now()->addDays(8)->format('Y-m-d'),
            'jou_description' => 'Vélo Z2 – endurance fondamentale',
        ]);

        Jour::create([
            'jou_plan_id'     => 1,
            'jou_date'        => Carbon::now()->addDays(9)->format('Y-m-d'),
            'jou_description' => 'Natation récupération',
        ]);

    }


}
