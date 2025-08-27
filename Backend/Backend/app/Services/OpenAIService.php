<?php

namespace App\Services;

use OpenAI;
use Exception;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    protected $client;
    protected $anamneseData;
    protected $evaluationData;

    public function __construct()
    {
        $this->client = OpenAI::client(config('services.openai.api_key'));
    }

    /**
     * ✅ NOUVELLE MÉTHODE - Initialiser les données utilisateur
     */
    public function setUserData($anamnese, $evaluationInitiale)
    {
        $this->anamneseData = $anamnese;
        $this->evaluationData = $evaluationInitiale;
        return $this;
    }

    /**
     * ✅ MÉTHODE PRIVÉE - Formater les données utilisateur pour les prompts
     */
    private function formatUserDataForPrompt()
    {
        return "
        ANAMNÈSE :
        - IMC : {$this->anamneseData['ana_imc']}
        - Blessures : {$this->anamneseData['ana_blessures']}
        - État actuel : {$this->anamneseData['ana_etat_actuel']}
        - Sexe : {$this->anamneseData['ana_sexe']}
        - Poids : {$this->anamneseData['ana_poids_kg']} kg
        - Taille : {$this->anamneseData['ana_taille_cm']} cm
        - Âge : {$this->anamneseData['ana_age']} ans
        - Contraintes professionnelles : " . ($this->anamneseData['ana_contrainte_pro'] ?? 'Aucune') . "
        - Contraintes familiales : " . ($this->anamneseData['ana_contrainte_fam'] ?? 'Aucune') . "
        - Expérience sportive : " . ($this->anamneseData['ana_exp_sportive'] ?? 'Aucune') . "
        - Commentaire : " . ($this->anamneseData['ana_commentaire'] ?? 'Aucun') . "
        - Traitement : " . ($this->anamneseData['ana_traitement'] ?? 'Aucun') . "
        - Diagnostics : {$this->anamneseData['ana_diagnostics']}

        ÉVALUATION INITIALE :
        - VO2 Max : {$this->evaluationData['eva_vo2max']}
        - Fréquence de repos : {$this->evaluationData['eva_freq_repos']}
        - Fréquence maximale : {$this->evaluationData['eva_freq_max']}
        - FTP Cyclisme : {$this->evaluationData['eva_ftp_cyclisme']}
        - VMA : " . ($this->evaluationData['eva_vma'] ?? 'Non testé') . "
        - Cooper : " . ($this->evaluationData['eva_cooper'] ?? 'Non réalisé') . "
        - Heures disponibles/semaine : {$this->evaluationData['eva_nb_heure_dispo']}
        - Seuil Natation : " . ($this->evaluationData['eva_seuil_natation'] ?? 'Non testé') . "
        - Seuil Cyclisme : " . ($this->evaluationData['eva_seuil_cyclisme'] ?? 'Non testé') . "
        - Seuil Course : " . ($this->evaluationData['eva_seuil_course'] ?? 'Non testé') . "
        - Commentaire : " . ($this->evaluationData['eva_commentaire'] ?? 'RAS') . "
        - Objectif : " . ($this->evaluationData['eva_objectif'] ?? 'Aucun') . "
        - Échéance : {$this->evaluationData['eva_echeance']}
        - Expérience en triathlon : " . ($this->evaluationData['eva_exp_triathlon'] ?? 'Aucune') . "
        ";
    }

    /**
     * ✅ MÉTHODES SIMPLIFIÉES - Plus de paramètres dupliqués
     */
   

    public function generateTrainingDays($plan)
    {
        $prompt = $this->buildJoursPrompt($plan);
        return $this->generateText($prompt, 3000);
    }

    public function generateTrainingActivities($plan, $jours)
    {
        $prompt = $this->buildActivitiesPrompt($plan, $jours);
        return $this->generateText($prompt, 4000);
    }

    /**
     * ✅ PROMPTS SIMPLIFIÉS - Utilisent formatUserDataForPrompt()
     */
    private function buildTrainingPlanPrompt($startDate = null)
{
    $userData = $this->formatUserDataForPrompt();
    
    // ✅ UTILISER la date fournie ou calculer le prochain lundi
    $planStartDate = $startDate ?: date('Y-m-d', strtotime('next Monday'));
    
    return "
    Crée un plan d'entraînement triathlon personnalisé basé sur ces données :

    {$userData}

    Réponds EXCLUSIVEMENT avec ce format JSON exact :
    {
        \"pla_nom\": \"Nom du plan adapté au profil et objectif\",
        \"pla_debut\": \"{$planStartDate}\",
        \"pla_fin\": \"{$this->evaluationData['eva_echeance']}\"
    }
    ";
}

    private function buildJoursPrompt($plan)
{
    $userData = $this->formatUserDataForPrompt();
    
    // ✅ UTILISER la date de début du plan au lieu de calculer
    $startDate = $plan['pla_debut']; // Date déjà fournie dans le plan
    $jours = [];
    for ($i = 0; $i < 14; $i++) {
        $jours[] = date('Y-m-d', strtotime($startDate . " +{$i} days"));
    }

    $joursJson = '';
    foreach ($jours as $index => $date) {
        $dayName = date('l', strtotime($date));
        $joursJson .= "            {\n";
        $joursJson .= "                \"jou_plan_id\": {$plan['pla_id']},\n";
        $joursJson .= "                \"jou_date\": \"{$date}\",\n";
        $joursJson .= "                \"jou_description\": \"Séance {$dayName} adaptée au profil\"\n";
        $joursJson .= "            }" . ($index < 13 ? ',' : '') . "\n";
    }

    return "
    Crée 2 semaines complètes d'entraînement triathlon (14 jours consécutifs) basées sur ces données :

    {$userData}

    PLAN GÉNÉRÉ :
    - Nom : {$plan['pla_nom']}
    - Date de début : {$plan['pla_debut']} (OBLIGATOIRE - commence exactement à cette date)
    - Date de fin : {$plan['pla_fin']}

    INSTRUCTIONS :
    - Crée exactement 14 jours consécutifs d'entraînement à partir du {$plan['pla_debut']}
    - Répartis les {$this->evaluationData['eva_nb_heure_dispo']} heures par semaine intelligemment
    - Adapte selon les contraintes et blessures
    - Progresse entre semaine 1 et semaine 2
    - Inclus des jours de repos stratégiques

    Réponds EXCLUSIVEMENT avec ce format JSON exact (tableau de 14 jours) :
    [{$joursJson}]
    ";
}

    // ✅ MODIFIER les méthodes publiques pour accepter la date de début
    public function generateTrainingPlan($startDate = null)
    {
        $prompt = $this->buildTrainingPlanPrompt($startDate);
        return $this->generateText($prompt, 1500);
    }

    private function buildActivitiesPrompt($plan, $jours)
    {
        $userData = $this->formatUserDataForPrompt();
        
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

        {$userData}

        PLAN : {$plan['pla_nom']}
        JOURS D'ENTRAÎNEMENT (14 jours) : {$joursText}

        INSTRUCTIONS :
        - Crée 1 à 3 activités par jour d'entraînement
        - Adapte les intensités aux capacités (VO2 Max, VMA, FTP)
        - Évite d'aggraver les blessures mentionnées
        - Assure une progression entre semaine 1 et 2
        - Inclus des activités de récupération les jours de repos
        - Utilise des noms d'activités précis et variés
        - Explique les choix d'activités et d'intensités

        Réponds EXCLUSIVEMENT avec ce format JSON exact (tableau d'activités pour 14 jours) :
        [
            {
                \"gen_jour_id\": \"ID_du_jour_correspondant\",
                \"gen_nom\": \"Nom précis de l'activité\",
                \"gen_type\": \"Natation|Cyclisme|Course à pied|Transition|Récupération\",
                \"gen_duree\": \"Durée en minutes\",
                \"gen_distance\": \"Distance en km si applicable\",
                \"gen_intensite\": \"Zone cardiaque ou % FTP/VMA adapté, signification de l'intensité suggérée\",
                \"gen_commentaire\": \"Instructions techniques adaptées au niveau et blessures et explication du choix de l'activité\",
                \"gen_source\": \"OpenAI\"
            }
        ]
        ";
    }

    /**
     * ✅ MÉTHODES UTILITAIRES INCHANGÉES
     */
    private function cleanOpenAIResponse($response)
    {
        $cleaned = trim($response);
        $cleaned = preg_replace('/^```json\s*/', '', $cleaned);
        $cleaned = preg_replace('/\s*```$/', '', $cleaned);
        $cleaned = preg_replace('/^```\s*/', '', $cleaned);
        
        return trim($cleaned);
    }

    public function generateText($prompt, $maxTokens = 1000)
    {
        try {
            $model = 'gpt-4o-mini';
            $result = $this->client->chat()->create([
                'model' => $model,
                'messages' => [
                    [
                        'role' => 'system', 
                        'content' => 'Tu es un expert en entraînement sportif et triathlon. Tu réponds EXCLUSIVEMENT en format JSON valide, sans backticks markdown, sans texte avant ou après. Tes programmes sont entièrement personnalisés selon le profil individuel de chaque athlète.'
                    ],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => $maxTokens,
                'temperature' => 0.7,
            ]);

            $rawResponse = $result->choices[0]->message->content;
            $cleanedResponse = $this->cleanOpenAIResponse($rawResponse);
            
            return $cleanedResponse;
        } catch (Exception $e) {
            Log::error('Erreur OpenAI:', ['error' => $e->getMessage()]);
            throw new Exception('Erreur lors de la génération avec OpenAI: ' . $e->getMessage());
        }
    }
}