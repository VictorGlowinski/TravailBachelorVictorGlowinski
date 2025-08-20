// app/(tabs)/plan.tsx - AFFICHER le plan directement
import { Pressable, Alert, ActivityIndicator, ScrollView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import planStyles from '@/styles/screens/PlanStyles';
import { useTheme } from '@/styles/screens/ThemeStyle';

export default function PlanScreen() {
  const theme = useTheme();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{
    hasAnamnese: boolean;
    hasEvaluation: boolean;
    anamneseData: any;
    evaluationData: any;
    hasPlan: boolean;
    planData: any; // ✅ AJOUTER les données complètes du plan
  }>({
    hasAnamnese: false,
    hasEvaluation: false,
    anamneseData: null,
    evaluationData: null,
    hasPlan: false,
    planData: null // ✅ INITIALISER
  });

  const API_BASE_URL = "http://192.168.0.112:8000/api";

  // Récupérer l'ID utilisateur (reste identique)
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        setCurrentUserId(userId);
        if (userId) {
          checkUserData(userId);
        }
      } catch (error) {
        console.error("Erreur récupération userId:", error);
      }
    };
    getUserId();
  }, []);

  // ✅ MODIFIER pour récupérer le plan COMPLET avec jours et activités
  const checkUserData = async (userId: string) => {
    setIsLoading(true);
    console.log('🔍 Début vérification pour userId:', userId);
    
    try {
      // Vérifier anamnèse (reste identique)
      const checkAnamnese = async () => {
        try {
          console.log('📡 Appel API anamnèse...');
          const response = await fetch(`${API_BASE_URL}/anamnese/user/${userId}`);
          console.log('📡 Anamnèse response status:', response.status);
          
          if (response.status === 200) {
            const data = await response.json();
            const anamnese = Array.isArray(data) ? data[0] : 
                           data?.anamnese?.[0] || data?.anamnese || data;
            return anamnese?.ana_id ? { hasData: true, data: anamnese } : { hasData: false, data: null };
          }
          return { hasData: false, data: null };
        } catch (error) {
          console.log('❌ Erreur anamnèse:', error);
          return { hasData: false, data: null };
        }
      };

      // Vérifier évaluation (reste identique)
      const checkEvaluation = async () => {
        try {
          console.log('📡 Appel API évaluation...');
          const response = await fetch(`${API_BASE_URL}/evaluation-initiale/user/${userId}`);
          console.log('📡 Évaluation response status:', response.status);
          
          if (response.status === 200) {
            const data = await response.json();
            const evaluation = Array.isArray(data) ? data[0] : data;
            return (evaluation?.eva_id || evaluation?.id) ? 
                   { hasData: true, data: evaluation } : 
                   { hasData: false, data: null };
          }
          return { hasData: false, data: null };
        } catch (error) {
          console.log('❌ Erreur évaluation:', error);
          return { hasData: false, data: null };
        }
      };

      // ✅ MODIFIER pour récupérer le plan COMPLET
      const checkPlan = async () => {
      try {
        console.log('📡 Appel API plan complet...');
        // ✅ CHANGER cette ligne pour utiliser l'endpoint /complete
        const response = await fetch(`${API_BASE_URL}/plans/user/${userId}/complete`);
        console.log('📡 Plan complete response status:', response.status);
        
        if (response.status === 200) {
          const data = await response.json();
          console.log('📋 Plan complet reçu:', data);
          
          // ✅ Les données arrivent déjà structurées depuis le backend
          // Pas besoin d'adaptation, juste vérifier la structure
          return data?.pla_id ? 
                { hasData: true, data: data } : 
                { hasData: false, data: null };
        }
        console.log('❌ Plan complete response pas 200');
        return { hasData: false, data: null };
      } catch (error) {
        console.log('❌ Erreur plan complet:', error);
        return { hasData: false, data: null };
      }
    };
      const [anamneseResult, evaluationResult, planResult] = await Promise.all([
        checkAnamnese(),
        checkEvaluation(),
        checkPlan()
      ]);

      console.log('✅ Résultats finaux:');
      console.log('   - Anamnèse:', anamneseResult.hasData);
      console.log('   - Évaluation:', evaluationResult.hasData);
      console.log('   - Plan:', planResult.hasData);

      setUserData({
        hasAnamnese: anamneseResult.hasData,
        hasEvaluation: evaluationResult.hasData,
        anamneseData: anamneseResult.data,
        evaluationData: evaluationResult.data,
        hasPlan: planResult.hasData,
        planData: planResult.data // ✅ STOCKER les données complètes du plan
      });

    } catch (error) {
      console.error('❌ Erreur vérification données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // generatePlan reste identique
  const generatePlan = async () => {
    if (!currentUserId) {
      Alert.alert("Erreur", "Utilisateur non identifié");
      return;
    }

    if (!userData.hasAnamnese || !userData.hasEvaluation) {
      Alert.alert(
        "Données manquantes", 
        "Vous devez compléter votre anamnèse ET votre évaluation initiale avant de générer un plan d'entraînement.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Génération du plan pour userId:', currentUserId);

      const planData = {
        user_id: parseInt(currentUserId, 10),
        anamnese: userData.anamneseData,
        evaluation: userData.evaluationData,
      };

      const response = await fetch(`${API_BASE_URL}/ai/generate-complete-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(planData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Plan généré:', result);
        
        // Recharger les données après génération
        if (currentUserId) {
          await checkUserData(currentUserId);
        }
        
        Alert.alert("Succès", "Plan d'entraînement généré avec succès !");
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur API:', errorData);
        throw new Error(errorData.message || "Erreur lors de la génération du plan");
      }
    } catch (error) {
      console.error("❌ Erreur génération plan:", error);
      Alert.alert("Erreur", "Impossible de générer le plan d'entraînement. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FONCTION pour formater la date
  const formatDate = (dateString: string) => {
  if (!dateString) return ''; // ✅ OK - chaîne vide
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  } catch (error) {
    console.error('Erreur formatage date:', error);
    return 'Date invalide'; // ✅ AJOUTER un message d'erreur
  }
};

const deletePlan = async () => {
  try {
    if (!currentUserId) {
      Alert.alert("Erreur", "Utilisateur non identifié");
      return;
    }

    // ✅ VÉRIFIER que le plan existe
    if (!userData.planData || !userData.planData.pla_id) {
      Alert.alert("Erreur", "Aucun plan à supprimer");
      return;
    }

    // ✅ DEMANDER CONFIRMATION avant suppression
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer ce plan d'entraînement ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            
            try {
              // ✅ CORRIGER l'URL et la méthode
              const response = await fetch(`${API_BASE_URL}/plans/${userData.planData.pla_id}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                // ✅ SUPPRIMER le body - pas nécessaire pour DELETE
              });

              if (response.ok) {
                console.log('✅ Plan supprimé avec succès');
                
                // ✅ RECHARGER les données après suppression
                if (currentUserId) {
                  await checkUserData(currentUserId);
                }
                
                Alert.alert("Succès", "Plan d'entraînement supprimé avec succès !");
              } else {
                const errorData = await response.json();
                console.error('❌ Erreur API suppression:', errorData);
                throw new Error(errorData.message || "Erreur lors de la suppression du plan");
              }
            } catch (error) {
              console.error('❌ Erreur suppression plan:', error);
              Alert.alert("Erreur", "Impossible de supprimer le plan d'entraînement. Veuillez réessayer.");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  } catch (error) {
    console.error('❌ Erreur suppression plan:', error);
    Alert.alert("Erreur", "Une erreur est survenue lors de la suppression.");
  }
};


return (
  <ScrollView 
    style={[planStyles.container, { backgroundColor: theme.colors.background }]}
    contentContainerStyle={planStyles.scrollContent}
    showsVerticalScrollIndicator={false}
  >
    {/* ✅ HEADER avec thème adaptatif */}
    <View style={[planStyles.header, { backgroundColor: theme.colors.surface }]}>
      <Text style={[planStyles.mainTitle, { color: theme.colors.primary }]}>
        Mon Plan d'Entraînement
      </Text>
      
    </View>

    {/* ✅ LOADING STATE */}
    {isLoading && (
      <View style={planStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={[planStyles.loadingText, { color: theme.colors.secondary }]}>
          Chargement de votre plan...
        </Text>
      </View>
    )}

    {/* ✅ SECTION GÉNÉRATION DE PLAN */}
    {!isLoading && !userData.hasPlan && (
      <View style={planStyles.generateSection}>
        <View style={[planStyles.prerequisCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[planStyles.cardTitle, { color: theme.colors.primary }]}>Prérequis</Text>
          <View style={planStyles.prerequisList}>
            <View style={planStyles.prerequisItem}>
              <View style={[planStyles.statusIcon, { backgroundColor: userData.hasAnamnese ? theme.colors.success : theme.colors.error }]}>
                <Text style={planStyles.statusIconText}>{userData.hasAnamnese ? '✓' : '✗'}</Text>
              </View>
              <Text style={[planStyles.prerequisText, { color: theme.colors.primary }]}>Anamnèse complétée</Text>
            </View>
            
            <View style={planStyles.prerequisItem}>
              <View style={[planStyles.statusIcon, { backgroundColor: userData.hasEvaluation ? theme.colors.success : theme.colors.error }]}>
                <Text style={planStyles.statusIconText}>{userData.hasEvaluation ? '✓' : '✗'}</Text>
              </View>
              <Text style={[planStyles.prerequisText, { color: theme.colors.primary }]}>Évaluation complétée</Text>
            </View>
          </View>
        </View>

        <Pressable 
          style={[
            planStyles.generateButton,
            {
              opacity: (!userData.hasAnamnese || !userData.hasEvaluation) ? 0.6 : 1,
              backgroundColor: (!userData.hasAnamnese || !userData.hasEvaluation) ? theme.colors.disabled : theme.colors.accent
            }
          ]} 
          onPress={generatePlan}
          disabled={!userData.hasAnamnese || !userData.hasEvaluation}
        >
          <Text style={[
            planStyles.generateButtonText,
            { color: (!userData.hasAnamnese || !userData.hasEvaluation) ? theme.colors.secondary : 'white' }
          ]}>
            {(!userData.hasAnamnese || !userData.hasEvaluation) ? 
             "Complétez vos données d'abord" : 
             "Générer mon plan d'entraînement"}
          </Text>
        </Pressable>
      </View>
    )}

    {/* ✅ AFFICHAGE DU PLAN */}
    {!isLoading && userData.hasPlan && userData.planData && (
      <View style={planStyles.planSection}>
        {/* Bouton supprimer */}
        <View style={{ padding: 20 }}>
          <Pressable style={[
            planStyles.deleteButton,
            { 
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: theme.colors.error,
            }
          ]} onPress={deletePlan}>
            <Text style={[planStyles.deleteButtonText, { color: theme.colors.error }]}>
              Supprimer le plan
            </Text>
          </Pressable>
        </View>
        {/* Header du plan */}
        <View style={[planStyles.planHeader, { backgroundColor: theme.colors.surface }]}>
          <View style={planStyles.planTitleContainer}>
            <Text style={[planStyles.planTitle, { color: theme.colors.primary }]}>
              {userData.planData.pla_nom || 'Plan d\'entraînement'}
            </Text>
            <View style={planStyles.planInfoRow}>
              <View style={planStyles.planInfoItem}>
                <Text style={[planStyles.planInfoLabel, { color: theme.colors.secondary }]}>Début</Text>
                <Text style={[planStyles.planInfoValue, { color: theme.colors.primary }]}>
                  {userData.planData.pla_date_debut ? 
                   formatDate(userData.planData.pla_date_debut) : 
                   'Non défini'}
                </Text>
              </View>
              <View style={[planStyles.planInfoDivider, { backgroundColor: theme.colors.border }]} />
              <View style={planStyles.planInfoItem}>
                <Text style={[planStyles.planInfoLabel, { color: theme.colors.secondary }]}>Fin</Text>
                <Text style={[planStyles.planInfoValue, { color: theme.colors.primary }]}>
                  {userData.planData.pla_date_fin ? 
                   formatDate(userData.planData.pla_date_fin) : 
                   'Non défini'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        

        {/* Liste des jours */}
        {userData.planData.jours && userData.planData.jours.length > 0 ? (
          <View style={planStyles.daysSection}>
            <Text style={[planStyles.sectionTitle, { color: theme.colors.primary }]}>
              Programme détaillé
            </Text>
            
            {userData.planData.jours.map((jour: any, index: number) => (
              <View key={jour.jou_id || index} style={[planStyles.dayCard, { backgroundColor: theme.colors.surface }]}>
                <View style={planStyles.dayHeader}>
                  <View style={[planStyles.dayNumberBadge, { backgroundColor: theme.colors.accent }]}>
                    <Text style={planStyles.dayNumberText}>{index + 1}</Text>
                  </View>
                  <View style={planStyles.dayInfo}>
                    <Text style={[planStyles.dayTitle, { color: theme.colors.primary }]}>
                      Jour {index + 1}
                    </Text>
                    {jour.jou_date && (
                      <Text style={[planStyles.dayDate, { color: theme.colors.secondary }]}>
                        {formatDate(jour.jou_date)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Description du jour */}
                {jour.jou_description && (
                  <View style={[planStyles.dayDescriptionContainer, { backgroundColor: theme.colors.background }]}>
                    <Text style={[planStyles.dayDescription, { color: theme.colors.secondary }]}>
                      {String(jour.jou_description)}
                    </Text>
                  </View>
                )}

                {/* Activités */}
                {jour.activites && jour.activites.length > 0 ? (
                  <View style={planStyles.activitiesContainer}>
                    {jour.activites.map((activite: any, actIndex: number) => (
                      <View key={activite.gen_id || actIndex} style={[planStyles.activityCard, { backgroundColor: theme.colors.background }]}>
                        <Text style={[planStyles.activityName, { color: theme.colors.primary }]}>
                          {activite.gen_nom || 'Activité'}
                        </Text>
                        
                        <View style={planStyles.tagsContainer}>
                          {activite.gen_type && String(activite.gen_type).trim() !== '' && (
                            <View style={[planStyles.tag, planStyles.typeTag]}>
                              <Text style={planStyles.tagText}>
                                {String(activite.gen_type)}
                              </Text>
                            </View>
                          )}
                          
                          {activite.gen_duree_minutes && (
                            <View style={[planStyles.tag, planStyles.durationTag]}>
                              <Text style={planStyles.tagText}>
                                {String(activite.gen_duree_minutes)} min
                              </Text>
                            </View>
                          )}
                          
                          {activite.gen_intensite && String(activite.gen_intensite).trim() !== '' && (
                            <View style={[planStyles.tag, planStyles.intensityTag]}>
                              <Text style={planStyles.tagText}>
                                {String(activite.gen_intensite)}
                              </Text>
                            </View>
                          )}
                        </View>

                        {activite.gen_description && String(activite.gen_description).trim() !== '' && (
                          <Text style={[planStyles.activityDescription, { color: theme.colors.secondary }]}>
                            {String(activite.gen_description)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={planStyles.noActivityContainer}>
                    <Text style={[planStyles.noActivityText, { color: theme.colors.secondary }]}>
                      Aucune activité programmée
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={[planStyles.noDaysContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[planStyles.noDaysText, { color: theme.colors.warning }]}>
              Plan créé mais aucun jour trouvé.
            </Text>
            <Text style={[planStyles.noDaysSubtext, { color: theme.colors.secondary }]}>
              Le plan est peut-être en cours de génération.
            </Text>
          </View>
        )}
      </View>
    )}
  </ScrollView>
);
}