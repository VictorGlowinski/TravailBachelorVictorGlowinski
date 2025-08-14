<?php

namespace App\Services;

use OpenAI;
use Exception;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    protected $client;

    public function __construct()
    {
        $this->client = OpenAI::client(config('services.openai.api_key'));
    }
    
    /**
     * Générer un plan d'entraînement personnalisé
     */
    public function generateTrainingPlan($anamnese, $evaluationInitiale)
    {
        $prompt = $this->buildTrainingPlanPrompt($anamnese, $evaluationInitiale);
        
        return $this->generateText($prompt, 1500); // spécifier les tokens
    }

    public function generateTrainingDays($plan, $anamnese, $evaluationInitiale)
    {
        $prompt = $this->buildJoursPrompt($plan, $anamnese, $evaluationInitiale);

        return $this->generateText($prompt, 3000); // plus de tokens pour 14 jours
    }

    /**
     * Générer des activités d'entraînement
     */
    public function generateTrainingActivities($plan, $jours, $anamnese, $evaluationInitiale)
    {
        $prompt = $this->buildActivitiesPrompt($plan, $jours, $anamnese, $evaluationInitiale);

        return $this->generateText($prompt, 4000); // beaucoup plus de tokens pour les activités
    }

   /**
 * Nettoyer la réponse OpenAI des backticks markdown
 */
private function cleanOpenAIResponse($response)
{
    // Supprimer les backticks et le mot "json" au début/fin
    $cleaned = trim($response);
    $cleaned = preg_replace('/^```json\s*/', '', $cleaned);
    $cleaned = preg_replace('/\s*```$/', '', $cleaned);
    $cleaned = preg_replace('/^```\s*/', '', $cleaned);
    
    return trim($cleaned);
}

/**
 * Méthode générique pour générer du texte - VERSION CORRIGÉE
 */
public function generateText($prompt, $maxTokens = 1000)
{
    try {
        $model = 'gpt-4o-mini';
        $result = $this->client->chat()->create([
            'model' => $model,
            'messages' => [
                [
                    'role' => 'system', 
                    'content' => 'Tu es un expert en entraînement sportif et triathlon avec 15 ans d\'expérience. Tu réponds EXCLUSIVEMENT en format JSON valide, sans backticks markdown, sans texte avant ou après. Tes programmes sont entièrement personnalisés selon le profil individuel de chaque athlète.'
                ],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => $maxTokens,
            'temperature' => 0.7,
        ]);

        $rawResponse = $result->choices[0]->message->content;
        
        // Nettoyer la réponse
        $cleanedResponse = $this->cleanOpenAIResponse($rawResponse);
        
        return $cleanedResponse;
    } catch (Exception $e) {
        Log::error('Erreur OpenAI:', ['error' => $e->getMessage()]);
        throw new Exception('Erreur lors de la génération avec OpenAI: ' . $e->getMessage());
    }
}

    /**
     * Construire le prompt pour un plan d'entraînement
     */
    private function buildTrainingPlanPrompt($anamnese, $evaluationInitiale)
    {
        return "
        Crée un plan d'entraînement triathlon personnalisé basé sur ces données :

        ANAMNÈSE :
        - IMC : {$anamnese['ana_imc']}
        - Blessures : {$anamnese['ana_blessures']}
        - État actuel : {$anamnese['ana_etat_actuel']}
        - Sexe : {$anamnese['ana_sexe']}
        - Poids : {$anamnese['ana_poids_kg']} kg
        - Taille : {$anamnese['ana_taille_cm']} cm
        - Âge : {$anamnese['ana_age']} ans
        - Contraintes professionnelles : " . ($anamnese['ana_contrainte_pro'] ?? 'Aucune') . "
        - Contraintes familiales : " . ($anamnese['ana_contrainte_fam'] ?? 'Aucune') . "
        - Expérience sportive : " . ($anamnese['ana_exp_sportive'] ?? 'Débutant') . "
        - Objectif : " . ($anamnese['ana_objectif'] ?? 'Remise en forme') . "
        - Commentaire : " . ($anamnese['ana_commentaire'] ?? 'Aucun') . "
        - Traitement : " . ($anamnese['ana_traitement'] ?? 'Aucun') . "
        - Diagnostics : {$anamnese['ana_diagnostics']}

        ÉVALUATION INITIALE :
        - VO2 Max : {$evaluationInitiale['eva_vo2max']}
        - Fréquence de repos : {$evaluationInitiale['eva_freq_repos']}
        - Fréquence maximale : {$evaluationInitiale['eva_freq_max']}
        - FTP Cyclisme : {$evaluationInitiale['eva_ftp_cyclisme']}
        - VMA : " . ($evaluationInitiale['eva_vma'] ?? 'Non testé') . "
        - Cooper : " . ($evaluationInitiale['eva_cooper'] ?? 'Non réalisé') . "
        - Seuil Natation : " . ($evaluationInitiale['eva_seuil_natation'] ?? 'Non testé') . "
        - Seuil Cyclisme : " . ($evaluationInitiale['eva_seuil_cyclisme'] ?? 'Non testé') . "
        - Seuil Course : " . ($evaluationInitiale['eva_seuil_course'] ?? 'Non testé') . "
        - Échéance : {$evaluationInitiale['eva_echeance']}
        - Heures disponibles/semaine : {$evaluationInitiale['eva_nb_heure_dispo']}
        - Commentaire : " . ($evaluationInitiale['eva_commentaire'] ?? 'RAS') . "

        Réponds EXCLUSIVEMENT avec ce format JSON exact :
        {
            \"pla_nom\": \"Nom du plan adapté au profil et objectif\",
            \"pla_debut\": \"" . date('Y-m-d') . "\",
            \"pla_fin\": \"{$evaluationInitiale['eva_echeance']}\"
        }
        ";
    }

    private function buildJoursPrompt($plan, $anamnese, $evaluationInitiale)
    {
        // Générer 14 jours consécutifs
        $startDate = date('Y-m-d', strtotime('next Monday'));
        $jours = [];
        for ($i = 0; $i < 14; $i++) {
            $jours[] = date('Y-m-d', strtotime($startDate . " +{$i} days"));
        }

        $joursJson = '';
        foreach ($jours as $index => $date) {
            $dayName = date('l', strtotime($date)); // Lundi, Mardi, etc.
            $joursJson .= "            {\n";
            $joursJson .= "                \"jou_plan_id\": {$plan['pla_id']},\n";
            $joursJson .= "                \"jou_date\": \"{$date}\",\n";
            $joursJson .= "                \"jou_description\": \"Séance {$dayName} adaptée au profil\"\n";
            $joursJson .= "            }" . ($index < 13 ? ',' : '') . "\n";
        }

        return "
        Crée 2 semaines complètes d'entraînement triathlon (14 jours consécutifs) basées sur ces données complètes :

        ANAMNÈSE :
        - IMC : {$anamnese['ana_imc']}
        - Blessures : {$anamnese['ana_blessures']}
        - État actuel : {$anamnese['ana_etat_actuel']}
        - Sexe : {$anamnese['ana_sexe']}
        - Poids : {$anamnese['ana_poids_kg']} kg
        - Taille : {$anamnese['ana_taille_cm']} cm
        - Âge : {$anamnese['ana_age']} ans
        - Contraintes professionnelles : " . ($anamnese['ana_contrainte_pro'] ?? 'Aucune') . "
        - Contraintes familiales : " . ($anamnese['ana_contrainte_fam'] ?? 'Aucune') . "
        - Expérience sportive : " . ($anamnese['ana_exp_sportive'] ?? 'Débutant') . "
        - Objectif : " . ($anamnese['ana_objectif'] ?? 'Remise en forme') . "
        - Commentaire : " . ($anamnese['ana_commentaire'] ?? 'Aucun') . "
        - Traitement : " . ($anamnese['ana_traitement'] ?? 'Aucun') . "
        - Diagnostics : {$anamnese['ana_diagnostics']}

        ÉVALUATION INITIALE :
        - VO2 Max : {$evaluationInitiale['eva_vo2max']}
        - Fréquence de repos : {$evaluationInitiale['eva_freq_repos']}
        - Fréquence maximale : {$evaluationInitiale['eva_freq_max']}
        - FTP Cyclisme : {$evaluationInitiale['eva_ftp_cyclisme']}
        - VMA : " . ($evaluationInitiale['eva_vma'] ?? 'Non testé') . "
        - Cooper : " . ($evaluationInitiale['eva_cooper'] ?? 'Non réalisé') . "
        - Seuil Natation : " . ($evaluationInitiale['eva_seuil_natation'] ?? 'Non testé') . "
        - Seuil Cyclisme : " . ($evaluationInitiale['eva_seuil_cyclisme'] ?? 'Non testé') . "
        - Seuil Course : " . ($evaluationInitiale['eva_seuil_course'] ?? 'Non testé') . "
        - Échéance : {$evaluationInitiale['eva_echeance']}
        - Heures disponibles/semaine : {$evaluationInitiale['eva_nb_heure_dispo']}
        - Commentaire : " . ($evaluationInitiale['eva_commentaire'] ?? 'RAS') . "

        PLAN GÉNÉRÉ :
        - Nom : {$plan['pla_nom']}
        - Date de début : {$plan['pla_debut']}
        - Date de fin : {$plan['pla_fin']}

        INSTRUCTIONS :
        - Crée exactement 14 jours consécutifs d'entraînement
        - Répartis les {$evaluationInitiale['eva_nb_heure_dispo']} heures par semaine intelligemment
        - Adapte selon les contraintes et blessures
        - Progresse entre semaine 1 et semaine 2
        - Inclus des jours de repos stratégiques

        Réponds EXCLUSIVEMENT avec ce format JSON exact (tableau de 14 jours) :
        [{$joursJson}]
        ";
    }

    /**
     * Construire le prompt pour générer des activités
     */
    private function buildActivitiesPrompt($plan, $jours, $anamnese, $evaluationInitiale)
    {
        if (is_object($jours) && method_exists($jours, 'toArray')) {
            $joursArray = $jours->toArray();
        } elseif (is_array($jours)) {
            $joursArray = $jours;
        } else {
            $joursArray = [];
        }
        
        $joursText = json_encode($joursArray, JSON_UNESCAPED_UNICODE);
        
        
        return "
        Crée des activités détaillées pour CHAQUE jour d'entraînement des 2 semaines :

        ANAMNÈSE :
        - IMC : {$anamnese['ana_imc']}
        - Blessures : {$anamnese['ana_blessures']}
        - État actuel : {$anamnese['ana_etat_actuel']}
        - Sexe : {$anamnese['ana_sexe']}
        - Poids : {$anamnese['ana_poids_kg']} kg
        - Taille : {$anamnese['ana_taille_cm']} cm
        - Âge : {$anamnese['ana_age']} ans
        - Contraintes professionnelles : " . ($anamnese['ana_contrainte_pro'] ?? 'Aucune') . "
        - Contraintes familiales : " . ($anamnese['ana_contrainte_fam'] ?? 'Aucune') . "
        - Expérience sportive : " . ($anamnese['ana_exp_sportive'] ?? 'Débutant') . "
        - Objectif : " . ($anamnese['ana_objectif'] ?? 'Remise en forme') . "
        - Commentaire : " . ($anamnese['ana_commentaire'] ?? 'Aucun') . "
        - Traitement : " . ($anamnese['ana_traitement'] ?? 'Aucun') . "
        - Diagnostics : {$anamnese['ana_diagnostics']}

        ÉVALUATION INITIALE :
        - VO2 Max : {$evaluationInitiale['eva_vo2max']}
        - Fréquence de repos : {$evaluationInitiale['eva_freq_repos']}
        - Fréquence maximale : {$evaluationInitiale['eva_freq_max']}
        - FTP Cyclisme : {$evaluationInitiale['eva_ftp_cyclisme']}
        - VMA : " . ($evaluationInitiale['eva_vma'] ?? 'Non testé') . "
        - Cooper : " . ($evaluationInitiale['eva_cooper'] ?? 'Non réalisé') . "
        - Seuil Natation : " . ($evaluationInitiale['eva_seuil_natation'] ?? 'Non testé') . "
        - Seuil Cyclisme : " . ($evaluationInitiale['eva_seuil_cyclisme'] ?? 'Non testé') . "
        - Seuil Course : " . ($evaluationInitiale['eva_seuil_course'] ?? 'Non testé') . "
        - Échéance : {$evaluationInitiale['eva_echeance']}
        - Heures disponibles/semaine : {$evaluationInitiale['eva_nb_heure_dispo']}
        - Commentaire : " . ($evaluationInitiale['eva_commentaire'] ?? 'RAS') . "

        PLAN : {$plan['pla_nom']}
        JOURS D'ENTRAÎNEMENT (14 jours) : {$joursText}

        INSTRUCTIONS :
        - Crée 1 à 3 activités par jour d'entraînement
        - Adapte les intensités aux capacités (VO2 Max, VMA, FTP)
        - Évite d'aggraver les blessures mentionnées
        - Assure une progression entre semaine 1 et 2
        - Inclus des activités de récupération les jours de repos

        Réponds EXCLUSIVEMENT avec ce format JSON exact (tableau d'activités pour 14 jours) :
        [
            {
                \"gen_jour_id\": \"ID_du_jour_correspondant\",
                \"gen_nom\": \"Nom précis de l'activité\",
                \"gen_type\": \"Natation|Cyclisme|Course à pied|Transition|Récupération\",
                \"gen_duree\": \"Durée en minutes\",
                \"gen_distance\": \"Distance en km si applicable\",
                \"gen_intensite\": \"Zone cardiaque ou % FTP/VMA adapté\",
                \"gen_commentaire\": \"Instructions techniques adaptées au niveau et blessures\",
                \"gen_source\": \"OpenAI\"
            }
        ]
        ";
    }
}
