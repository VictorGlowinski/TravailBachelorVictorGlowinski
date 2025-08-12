<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActiviteRealisee;
use App\Models\Jour;

class ActiviteRealiseeSeeder extends Seeder
{
    public function run(): void
    {
        ActiviteRealisee::create(
            [
                'rea_user_id'    => 1,
                'rea_nom'        => 'Séance natation technique',
                'rea_type'       => 'Natation',
                'rea_duree'      => '50:00',
                'rea_date'      => '2023-10-01',
                'rea_distance'   => 1600,
                'rea_intensite'  => 'Modéré',
                'rea_commentaire'=> 'Bonne sensation, pas de douleur au genou',
            ]
        );

        ActiviteRealisee::create(
            [
                'rea_user_id'    => 1,
                'rea_nom'        => 'Séance vélo endurance',
                'rea_type'       => 'Vélo',
                'rea_duree'      => '60:00',
                'rea_date'      => '2023-10-02',
                'rea_distance'   => 25,
                'rea_intensite'  => 'Modéré',
                'rea_commentaire'=> 'Bonne sensation, pas de douleur au genou',
            ]
        );

        ActiviteRealisee::create(
            [
                'rea_user_id'    => 2,
                'rea_nom'        => 'Course footing Z2',
                'rea_type'       => 'Course',
                'rea_duree'      => '40:00',
                'rea_date'      => '2023-10-03',
                'rea_distance'   => 8,
                'rea_intensite'  => 'Modéré',
                'rea_commentaire'=> 'Sensation correcte, genou ok',
            ]
        );

        ActiviteRealisee::create(
            [
                'rea_user_id'    => 2,
                'rea_nom'        => 'Séance natation technique',
                'rea_type'       => 'Natation',
                'rea_duree'      => '50:00',
                'rea_date'      => '2023-10-01',
                'rea_distance'   => 1600,
                'rea_intensite'  => 'Modéré',
                'rea_commentaire'=> 'Bonne sensation, pas de douleur au genou',
            ]
        );

        ActiviteRealisee::create(
            [
                'rea_user_id'    => 3,
                'rea_nom'        => 'Séance course endurance',
                'rea_type'       => 'Course',
                'rea_duree'      => '60:00',
                'rea_date'      => '2025-08-01',
                'rea_distance'   => 25,
                'rea_intensite'  => 'Modéré',
                'rea_commentaire'=> 'Bonne sensation, pas de douleur au genou',
            ]
        );

    }
}
