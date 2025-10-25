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
     * NOUVELLE MÉTHODE - Initialiser les données utilisateur
     * Permet de configurer les données avant de générer des prompts
     * @param array $anamnese
     * @param array $evaluationInitiale
     * @return $this
     */
    public function setUserData($anamnese, $evaluationInitiale)
    {
        $this->anamneseData = $anamnese;
        $this->evaluationData = $evaluationInitiale;
        return $this;
    }

    /**
     *  MÉTHODE PRIVÉE - Formater les données utilisateur pour les prompts
     *  Permet de réutiliser le même formatage dans plusieurs prompts
     * @return string
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
     * Générer les jours d'entraînement
     * @param array $plan
     * @return string JSON des jours d'entraînement
     */
    public function generateTrainingDays($plan)
    {
        $prompt = $this->buildJoursPrompt($plan);
        
        // ✅ CALCULER la durée pour ajuster max_tokens
        $startDate = $plan['pla_debut'];
        $endDate = $plan['pla_fin'];
        $totalDays = (new \DateTime($endDate))->diff(new \DateTime($startDate))->days + 1;
        
        // ✅ AJUSTER max_tokens selon la durée (environ 100 tokens par jour)
        $maxTokens = min(4000, max(1500, $totalDays * 100));
        
        return $this->generateText($prompt, $maxTokens);
    }

    /**
     * Méthode générique pour générer les activités d'entraînement qui sont liées aux jours
     * @param string $plan
     * @param array $jours
     * @return string JSON des activités d'entraînement
     */
    public function generateTrainingActivities($plan, $jours)
    {
        $prompt = $this->buildActivitiesPrompt($plan, $jours);
        
        // ✅ CALCULER max_tokens selon le nombre de jours
        $totalJours = is_array($jours) ? count($jours) : (is_object($jours) ? $jours->count() : 14);
        $maxTokens = min(8000, max(3000, $totalJours * 200)); // ~200 tokens par jour d'activités
        
        return $this->generateText($prompt, $maxTokens);
    }

    /**
     * PROMPTS SIMPLIFIÉS - Utilisent formatUserDataForPrompt()
     * Méthode  qui permet de construire le prompt pour générer un plan d'entraînement
     * Accepte une date de début optionnelle, sinon utilise le prochain lundi
     * @return string
     */
    private function buildTrainingPlanPrompt($startDate = null)
{
    $userData = $this->formatUserDataForPrompt();
    
    // UTILISER la date fournie ou calculer le prochain lundi
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

    /**
     * Construire le prompt pour générer les jours d'entraînement
     * @param array $plan
     * @return string
     */
    private function buildJoursPrompt($plan)
    {
        $userData = $this->formatUserDataForPrompt();
        
        $startDate = $plan['pla_debut'];
        $endDate = $plan['pla_fin'];
        
        // ✅ CALCULER le nombre total de jours entre début et fin
        $totalDays = (new \DateTime($endDate))->diff(new \DateTime($startDate))->days + 1;
        
        // ✅ GÉNÉRER toutes les dates du programme
        $jours = [];
        for ($i = 0; $i < $totalDays; $i++) {
            $jours[] = date('Y-m-d', strtotime($startDate . " +{$i} days"));
        }

        // ✅ CRÉER le template JSON pour toutes les dates
        $joursJson = '';
        foreach ($jours as $index => $date) {
            $dayName = date('l', strtotime($date));
            $joursJson .= "            {\n";
            $joursJson .= "                \"jou_plan_id\": {$plan['pla_id']},\n";
            $joursJson .= "                \"jou_date\": \"{$date}\",\n";
            $joursJson .= "                \"jou_description\": \"Séance {$dayName} adaptée au profil\"\n";
            $joursJson .= "            }" . ($index < $totalDays - 1 ? ',' : '') . "\n";
        }

        return "
        Crée un programme d'entraînement triathlon complet de {$totalDays} jours consécutifs basé sur ces données :

        {$userData}

        PLAN GÉNÉRÉ :
        - Nom : {$plan['pla_nom']}
        - Date de début : {$startDate} (OBLIGATOIRE - commence exactement à cette date)
        - Date de fin : {$endDate} (OBLIGATOIRE - termine exactement à cette date)
        - Durée totale : {$totalDays} jours

        DATES À GÉNÉRER (dans l'ordre chronologique) :
        " . implode(', ', array_slice($jours, 0, min(10, count($jours)))) . 
        (count($jours) > 10 ? "... (et " . (count($jours) - 10) . " jours supplémentaires jusqu'au {$endDate})" : "") . "

        INSTRUCTIONS CRITIQUES :
        - Génère EXACTEMENT {$totalDays} jours d'entraînement consécutifs
        - Commence OBLIGATOIREMENT le {$startDate}
        - Termine OBLIGATOIREMENT le {$endDate}
        - Répartis les {$this->evaluationData['eva_nb_heure_dispo']} heures par semaine intelligemment
        - Adapte selon les contraintes, blessures et niveau de l'athlète
        - Planifie une progression logique sur toute la durée
        - Inclus des jours de repos stratégiques (généralement 1-2 par semaine)
        - Varie les types d'entraînement selon les cycles (base, intensité, affûtage)
        - Tiens compte de l'objectif : " . ($this->evaluationData['eva_objectif'] ?? 'Amélioration générale') . "
        - Échéance prévue : {$this->evaluationData['eva_echeance']}

        PÉRIODISATION SUGGÉRÉE pour {$totalDays} jours :
        - Phase de base : premiers 60% du programme
        - Phase d'intensité : 25% suivants
        - Phase d'affûtage : derniers 15%

        Réponds EXCLUSIVEMENT avec ce format JSON exact (tableau de {$totalDays} jours) :
        [{$joursJson}]
        ";
    }

    // MODIFIER les méthodes publiques pour accepter la date de début
    /**
     * Générer un plan d'entraînement
     * @param string|null $startDate Date de début optionnelle (format 'Y-m-d')
     * @return string JSON du plan d'entraînement
     */
    public function generateTrainingPlan($startDate = null)
    {
        $prompt = $this->buildTrainingPlanPrompt($startDate);
        return $this->generateText($prompt, 1500);
    }

    private function buildActivitiesPrompt($plan, $jours)
{
    $userData = $this->formatUserDataForPrompt();
    
    // ✅ GESTION ROBUSTE des jours avec extraction des IDs
    if (is_object($jours) && method_exists($jours, 'toArray')) {
        $joursArray = $jours->toArray();
    } elseif (is_array($jours)) {
        $joursArray = $jours;
    } else {
        $joursArray = [];
    }
    
    // ✅ VALIDATION
    if (empty($joursArray)) {
        throw new \Exception('Aucun jour fourni pour générer les activités');
    }
    
    $totalJours = count($joursArray);
    
    // ✅ EXTRAIRE les informations essentielles de chaque jour
    $joursInfo = [];
    foreach ($joursArray as $jour) {
        $joursInfo[] = [
            'jou_id' => $jour['jou_id'] ?? $jour['id'] ?? null,
            'jou_date' => $jour['jou_date'] ?? $jour['date'] ?? null,
            'jou_description' => $jour['jou_description'] ?? $jour['description'] ?? null
        ];
    }
    
    // ✅ CRÉER la liste des IDs disponibles
    $idsDisponibles = array_column($joursInfo, 'jou_id');
    $idsDisponibles = array_filter($idsDisponibles); // Supprimer les nulls
    
    // ✅ FORMATAGE pour l'IA avec exemples concrets
    $exemplesJours = array_slice($joursInfo, 0, 5); // Prendre les 5 premiers pour exemple
    $exemplesText = '';
    foreach ($exemplesJours as $jour) {
        $exemplesText .= "- ID: {$jour['jou_id']}, Date: {$jour['jou_date']}, Description: {$jour['jou_description']}\n";
    }
    
    // ✅ CALCULER les semaines pour la progression
    $totalSemaines = ceil($totalJours / 7);
    
    return "
    Crée des activités détaillées pour CHAQUE jour d'entraînement du programme complet.
    
    ATTENTION CRITIQUE : Tu dois créer des activités pour TOUS les {$totalJours} jours listés ci-dessous.
    Chaque activité DOIT utiliser le gen_jour_id correspondant au jour exact.

    Données utilisateur : {$userData}

    Plan : {$plan['pla_nom']}
    Durée totale : {$totalJours} jours ({$totalSemaines} semaines)
    
    EXEMPLES DES JOURS À TRAITER :
    {$exemplesText}
    " . ($totalJours > 5 ? "... et " . ($totalJours - 5) . " autres jours jusqu'au " . end($joursInfo)['jou_date'] : "") . "

    IDS VALIDES À UTILISER : " . implode(', ', array_slice($idsDisponibles, 0, 10)) . ($totalJours > 10 ? '...' : '') . "

    INSTRUCTIONS CRITIQUES :
    - Crée 1-3 activités PAR JOUR selon les besoins et le niveau
    - UTILISE EXACTEMENT les gen_jour_id fournis ci-dessus (exemples: {$idsDisponibles[0]}, {$idsDisponibles[1]}, etc.)
    - RÉPARTIS intelligemment sur TOUS les {$totalJours} jours
    - Adapte les intensités aux capacités physiques
    - Évite d'aggraver les blessures : " . ($this->anamneseData['ana_blessures'] ?? 'aucune') . "
    - Respecte les contraintes : pro (" . ($this->anamneseData['ana_contrainte_pro'] ?? 'aucune') . "), familiales (" . ($this->anamneseData['ana_contrainte_fam'] ?? 'aucune') . ")
    - Planifie une progression logique sur {$totalSemaines} semaines
    - Varie les disciplines (natation, cyclisme, course à pied)
    - Pour les jours de repos, crée des activités de récupération légères
    - Objectif : " . ($this->evaluationData['eva_objectif'] ?? 'Amélioration générale') . "

    PÉRIODISATION sur {$totalSemaines} semaines :
    - Semaines 1-" . ceil($totalSemaines * 0.6) . " : Phase de base (volume, endurance)
    - Semaines " . (ceil($totalSemaines * 0.6) + 1) . "-" . ceil($totalSemaines * 0.85) . " : Phase d'intensité (qualité, vitesse)
    - Dernières semaines : Affûtage (récupération, préparation)

    CHARGE D'ENTRAÎNEMENT :
    - Heures disponibles : " . ($this->evaluationData['eva_nb_heure_dispo'] ?? 'non défini') . "h/semaine
    - Niveau VO2 Max : " . ($this->evaluationData['eva_vo2max'] ?? 'non testé') . "
    - FTP Cyclisme : " . ($this->evaluationData['eva_ftp_cyclisme'] ?? 'non testé') . "W
    - VMA : " . ($this->evaluationData['eva_vma'] ?? 'À évaluer') . "

    EXEMPLE DE FORMAT ATTENDU pour les premiers jours :
    [
        {
            \"gen_jour_id\": {$idsDisponibles[0]},
            \"gen_nom\": \"Course à pied endurance\",
            \"gen_type\": \"Course à pied\",
            \"gen_duree\": \"30\",
            \"gen_distance\": \"5.0\",
            \"gen_intensite\": \"Zone 2 - 70-80% FCMax\",
            \"gen_commentaire\": \"Course en endurance fondamentale, privilégier la durée à l'intensité\",
            \"gen_source\": \"OpenAI\"
        },
        {
            \"gen_jour_id\": {$idsDisponibles[1]},
            \"gen_nom\": \"Natation technique\",
            \"gen_type\": \"Natation\", 
            \"gen_duree\": \"45\",
            \"gen_distance\": \"1.5\",
            \"gen_intensite\": \"Allure confortable\",
            \"gen_commentaire\": \"Focus sur la technique de nage, travail de la respiration\",
            \"gen_source\": \"OpenAI\"
        }
    ]

    Réponds EXCLUSIVEMENT avec un tableau JSON d'activités pour TOUS les {$totalJours} jours.
    UTILISE uniquement les gen_jour_id de la liste fournie : " . implode(', ', $idsDisponibles) . "
    ";
}

    /**
     * Méthode qui nettoie la réponse de l'API OpenAI pour extraire le JSON
     * Supprime les backticks markdown et espaces superflus
     * @param string $response
     * @return string JSON propre
     */
    private function cleanOpenAIResponse($response)
    {
        $cleaned = trim($response);
        $cleaned = preg_replace('/^```json\s*/', '', $cleaned);
        $cleaned = preg_replace('/\s*```$/', '', $cleaned);
        $cleaned = preg_replace('/^```\s*/', '', $cleaned);
        
        return trim($cleaned);
    }

    /**
     * Méthode générique pour appeler l'API OpenAI avec un prompt donné
     * Gère les erreurs et nettoie la réponse JSON
     * @param string $prompt
     * @param int $maxTokens
     * @return string JSON propre
     * @throws Exception en cas d'erreur API
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
                        'content' => 'Tu es un expert en entraînement sportif et triathlon. Tu réponds EXCLUSIVEMENT en format JSON valide, sans backticks markdown, sans texte avant ou après. Tes programmes sont entièrement personnalisés selon le profil individuel de chaque athlète.'
                    ],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => $maxTokens,
                'temperature' => 0.2,
                
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