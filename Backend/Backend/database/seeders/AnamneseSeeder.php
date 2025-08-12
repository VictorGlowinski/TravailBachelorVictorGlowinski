<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Anamnese;
use Illuminate\Support\Facades\DB;


class AnamneseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Utilisateur 1 — profil : tendinite rotulienne, bonne expérience, en reprise
        Anamnese::create([
            'ana_user_id'      => 1,
            'ana_imc'          => 22.5,
            'ana_blessures'    => 'Entorse cheville droite',
            'ana_etat_actuel'  => 'En reprise',
            'ana_sexe'         => 'M',
            'ana_poids_kg'     => 70,
            'ana_taille_cm'    => 175,
            'ana_age'          => 29,
            'ana_contrainte_pro' => 'Travail de bureau',
            'ana_contrainte_fam' => 'Pas de contrainte',
            'ana_exp_sportive' => '5 ans de triathlon amateur',
            'ana_objectif'     => 'Préparer un Ironman',
            'ana_commentaire'  => 'Pas de contre-indication médicale, exercice en fonction de la douleur rotulienne',
            'ana_traitement'   => 'Physiothérapie 2x/semaine',
            'ana_diagnostics'  => 'Tendinite rotulienne'
        ]);

        // Tu peux en mettre plusieurs
        Anamnese::create([
            'ana_user_id'      => 2,
            'ana_imc'          => 24.1,
            'ana_blessures'    => 'Aucune',
            'ana_etat_actuel'  => 'Bonne santé',
            'ana_sexe'         => 'F',
            'ana_poids_kg'     => 60,
            'ana_taille_cm'    => 168,
            'ana_age'          => 34,
            'ana_contrainte_pro' => 'Travail debout',
            'ana_contrainte_fam' => 'Enfants en bas âge',
            'ana_exp_sportive' => 'Course à pied, cyclisme',
            'ana_objectif'     => 'Triathlon olympique',
            'ana_commentaire'  => '',
            'ana_traitement'   => '',
            'ana_diagnostics'  => ''
        ]);
        Anamnese::create([
            'ana_user_id'      => 3,
            'ana_imc'          => 26.3,
            'ana_blessures'    => 'Douleur lombaire occasionnelle',
            'ana_etat_actuel'  => 'En bonne forme',
            'ana_sexe'         => 'M',
            'ana_poids_kg'     => 85,
            'ana_taille_cm'    => 180,
            'ana_age'          => 40,
            'ana_contrainte_pro' => 'Travail sédentaire',
            'ana_contrainte_fam' => 'Pas de contrainte',
            'ana_exp_sportive' => 'Natation, musculation',
            'ana_objectif'     => 'Triathlon sprint',
            'ana_commentaire'  => '',
            'ana_traitement'   => 'Rendez-vous chez le physiothérapeute occasionnel',
            'ana_diagnostics'  => 'Scoliose légère'
        ]);
    }
}
