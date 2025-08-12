<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActiviteGeneree;
use App\Models\Jour;

class ActiviteGenereeSeeder extends Seeder
{
    public function run(): void
    {
        $jours = Jour::all();

        foreach ($jours as $jour) {
            $desc = strtolower($jour->jou_description);
            $type = $this->detectType($desc);

            ActiviteGeneree::create([
                'gen_jour_id'    => $jour->jou_id,
                'gen_nom'        => $this->generateNom($type),
                'gen_type'       => $type,
                'gen_duree'      => $this->generateDuree($type),
                'gen_distance'   => $this->generateDistance($type),
                'gen_intensite'  => $this->generateIntensite($type),
                'gen_commentaire'=> ucfirst($jour->jou_description),
                'gen_source'     => 'LLM'
            ]);
        }
    }

    private function detectType(string $desc): string
    {
        return match (true) {
            str_contains($desc, 'natation')    => 'Natation',
            str_contains($desc, 'vélo')        => 'Vélo',
            str_contains($desc, 'course')      => 'Course',
            str_contains($desc, 'gainage'),
            str_contains($desc, 'renfo'),
            str_contains($desc, 'tronc')       => 'Renforcement',
            str_contains($desc, 'repos')       => 'Repos',
            default                            => 'Autre',
        };
    }

    private function generateNom(string $type): string
    {
        return match ($type) {
            'Natation'      => 'Séance piscine',
            'Vélo'          => 'Sortie vélo',
            'Course'        => 'Séance course à pied',
            'Renforcement'  => 'Renforcement musculaire',
            'Repos'         => 'Repos / récupération',
            default         => 'Séance libre',
        };
    }

    private function generateDuree(string $type): int
    {
        return match ($type) {
            'Natation'      => 45,
            'Vélo'          => 90,
            'Course'        => 60,
            'Renforcement'  => 30,
            'Repos'         => 0,
            default         => 45,
        };
    }

    private function generateDistance(string $type): ?int
    {
        return match ($type) {
            'Natation'      => 1500,
            'Vélo'          => 40000,
            'Course'        => 10000,
            default         => 0,
        };
    }

    private function generateIntensite(string $type): string
    {
        return match ($type) {
            'Natation'      => 'Modéré',
            'Vélo'          => 'Endurance',
            'Course'        => 'Modéré',
            'Renforcement'  => 'Variable',
            'Repos'         => 'Aucune',
            default         => 'Modéré',
        };
    }
}
