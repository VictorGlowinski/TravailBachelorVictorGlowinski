<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EvaluationInitiale;
use Illuminate\Support\Facades\DB;

class EvaluationInitialeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Utilisateur 1
        EvaluationInitiale::create([
            'eva_user_id'          => 1,
            'eva_vo2max'           => 53.5,               // cohérent avec VMA et test de Cooper
            'eva_freq_repos'       => 55,                  // bpm au repos
            'eva_freq_max'         => 182,                 // bpm max mesuré
            'eva_ftp_cyclisme'     => 210,                 // watts
            'eva_vma'              => 15.5,                // km/h
            'eva_cooper'           => '2900 mètres en 12 min', 
            'eva_seuil_natation'   => '1:45 /100m',         // rythme au seuil
            'eva_seuil_cyclisme'   => '220 W',              // puissance au seuil
            'eva_seuil_course'     => '4:15 /km',           // allure au seuil
            'eva_echeance'         => '2025-12-31',
            'eva_nb_heure_dispo'   => 6,                    // heures d’entraînement hebdo dispo
            'eva_commentaire'      => 'A améliorer en vélo, bonne récupération'
        ]);

        EvaluationInitiale::create([
            'eva_user_id'          => 2,
            'eva_vo2max'           => 50.0,
            'eva_freq_repos'       => 60,
            'eva_freq_max'         => 180,
            'eva_ftp_cyclisme'     => 200,
            'eva_vma'              => 14.0,
            'eva_cooper'           => '2800 mètres en 12 min',
            'eva_seuil_natation'   => '1:50 /100m',
            'eva_seuil_cyclisme'   => '210 W',
            'eva_seuil_course'     => '4:10 /km',
            'eva_echeance'         => '2025-12-31',
            'eva_nb_heure_dispo'   => 5,
            'eva_commentaire'      => 'Bon potentiel, à travailler en endurance'
        ]);

        EvaluationInitiale::create([
            'eva_user_id'          => 3,
            'eva_vo2max'           => 48.0,
            'eva_freq_repos'       => 62,
            'eva_freq_max'         => 178,
            'eva_ftp_cyclisme'     => 190,
            'eva_vma'              => 13.5,
            'eva_cooper'           => '2700 mètres en 12 min',
            'eva_seuil_natation'   => '1:55 /100m',
            'eva_seuil_cyclisme'   => '200 W',
            'eva_seuil_course'     => '4:05 /km',
            'eva_echeance'         => '2025-12-31',
            'eva_nb_heure_dispo'   => 4,
            'eva_commentaire'      => 'Doit progresser en course à pied'
        ]);
    }
}
