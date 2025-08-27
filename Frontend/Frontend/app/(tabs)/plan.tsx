// app/(tabs)/plan.tsx - AFFICHER le plan directement
import { Pressable, Alert, ActivityIndicator, ScrollView, Text, View, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import planStyles from '@/styles/screens/PlanStyles';
import { useTheme } from '@/styles/screens/ThemeStyle';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ActiviteGenereeModal from '@/components/ActiviteGenereeModal';
import DateTimePicker from '@react-native-community/datetimepicker';


export default function PlanScreen() {
  const theme = useTheme();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  //afficher le detail des jours d'entrainement
  const [selectedJour, setSelectedJour] = useState<any>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);



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

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
  if (Platform.OS === 'android') {
    // ✅ Sur Android, garder le comportement natif
    setShowStartDatePicker(false);
    if (selectedDate && event.type !== 'dismissed') {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setStartDate(formattedDate);
    }
  } else {
    // ✅ Sur iOS, ne pas fermer automatiquement
    if (selectedDate && event.type !== 'dismissed') {
      setTempStartDate(selectedDate);
    } else if (event.type === 'dismissed') {
      setShowStartDatePicker(false);
      setTempStartDate(null);
    }
  }
};

// ✅ FONCTION pour confirmer la date (iOS)
const confirmStartDate = () => {
  if (tempStartDate) {
    const formattedDate = tempStartDate.toISOString().split('T')[0];
    setStartDate(formattedDate);
  }
  setShowStartDatePicker(false);
  setTempStartDate(null);
};

// ✅ FONCTION pour annuler la sélection
const cancelStartDateSelection = () => {
  setShowStartDatePicker(false);
  setTempStartDate(null);
};

  // FONCTION pour ouvrir le modal
  const openJourModal = (jour: any, dayNumber: number) => {
    console.log('📱 Ouverture modal pour jour:', dayNumber, jour);
    setSelectedJour(jour);
    setSelectedDayNumber(dayNumber);
    setModalVisible(true);
  };

  // FONCTION pour fermer le modal
  const closeJourModal = () => {
    setModalVisible(false);
    setSelectedJour(null);
    setSelectedDayNumber(0);
  };

  const formatDateForDisplay = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};


// MODIFIER generatePlan pour inclure la date
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

  if (!startDate) {
    Alert.alert("Date manquante", "Veuillez sélectionner une date de début pour votre plan d'entraînement.");
    return;
  }

  setIsLoading(true);
  try {
    console.log('🚀 Génération du plan pour userId:', currentUserId);

    const planData = {
      user_id: parseInt(currentUserId, 10),
      start_date: startDate, // ✅ INCLURE la date de début
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
              const response = await fetch(`${API_BASE_URL}/plan/${userData.planData.pla_id}`, {
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
              <Text style={[planStyles.prerequisText, { color: theme.colors.primary }]}>
                Anamnèse {userData.hasAnamnese ? 'complétée' : 'à compléter'}
              </Text>
            </View>
            
            <View style={planStyles.prerequisItem}>
              <View style={[planStyles.statusIcon, { backgroundColor: userData.hasEvaluation ? theme.colors.success : theme.colors.error }]}>
                <Text style={planStyles.statusIconText}>{userData.hasEvaluation ? '✓' : '✗'}</Text>
              </View>
              <Text style={[planStyles.prerequisText, { color: theme.colors.primary }]}>
                Évaluation {userData.hasEvaluation ? 'complétée' : 'à compléter'}
              </Text>
            </View>
          </View>

          {/* ✅ SECTION DATE DE DÉBUT - OBLIGATOIRE */}
          {(userData.hasAnamnese && userData.hasEvaluation) && (
            <View style={planStyles.dateSection}>
              <Text style={[planStyles.dateLabel, { color: theme.colors.primary }]}>
                Date de début <Text style={[planStyles.required, { color: theme.colors.error }]}>*</Text>
              </Text>
              <Text style={[planStyles.dateDescription, { color: theme.colors.secondary }]}>
                Sélectionnez la date à laquelle vous souhaitez commencer votre plan d'entraînement
              </Text>
              
              <Pressable
                style={[
                  planStyles.dateInput,
                  { 
                    backgroundColor: theme.colors.background,
                    borderColor: startDate ? theme.colors.border : theme.colors.error,
                    borderWidth: startDate ? 1 : 2,
                  }
                ]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={[
                  planStyles.dateInputText,
                  { 
                    color: startDate ? theme.colors.primary : theme.colors.error
                  }
                ]}>
                  {startDate ? formatDateForDisplay(startDate) : "Sélectionner une date de début *"}
                </Text>
                <FontAwesome 
                  name="calendar" 
                  size={16} 
                  color={startDate ? theme.colors.secondary : theme.colors.error} 
                />
              </Pressable>

              {/* ✅ MESSAGE D'ERREUR si date manquante */}
              {!startDate && (userData.hasAnamnese && userData.hasEvaluation) && (
                <Text style={[planStyles.errorText, { color: theme.colors.error }]}>
                  La date de début est obligatoire pour générer votre plan
                </Text>
              )}
            </View>
          )}

          {/* ✅ BOUTON pour générer le plan */}
          <View style={planStyles.generateButtonContainer}>
            <Pressable
              style={[
                planStyles.generateButton,
                { 
                  backgroundColor: (userData.hasAnamnese && userData.hasEvaluation && startDate) ? 
                                   theme.colors.accent : theme.colors.disabled,
                  opacity: (userData.hasAnamnese && userData.hasEvaluation && startDate) ? 1 : 0.6
                }
              ]}
              onPress={generatePlan}
              disabled={!userData.hasAnamnese || !userData.hasEvaluation || !startDate || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={planStyles.generateButtonText}>
                  Générer mon plan d'entraînement
                </Text>
              )}
            </Pressable>

            {/* ✅ Messages d'aide conditionnels */}
            {(!userData.hasAnamnese || !userData.hasEvaluation) && (
              <Text style={[planStyles.helpText, { color: theme.colors.warning }]}>
                Complétez votre anamnèse et évaluation pour générer votre plan personnalisé
              </Text>
            )}
            
            
          </View>
        </View>
      </View>
    )}

    {/* ✅ AFFICHAGE DU PLAN */}
    {!isLoading && userData.hasPlan && userData.planData && (
      <View style={planStyles.planSection}>
        {/* Bouton supprimer */}
        <View style={{ padding: 20 }}>
          <Pressable 
            style={[
              planStyles.deleteButton,
              { 
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: theme.colors.error,
              }
            ]} 
            onPress={deletePlan}
          >
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

        {/* Liste des jours avec modal */}
        {userData.planData.jours && userData.planData.jours.length > 0 ? (
          <View style={planStyles.daysSection}>
            <Text style={[planStyles.sectionTitle, { color: theme.colors.primary }]}>
              Programme détaillé
            </Text>
            
            {userData.planData.jours.map((jour: any, index: number) => (
              <Pressable 
                key={jour.jou_id || index}
                style={[planStyles.dayCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => openJourModal(jour, index + 1)}
              >
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
                  {/* ✅ Indicateur de clic */}
                  <FontAwesome name="chevron-right" size={16} color={theme.colors.secondary} />
                </View>

                {/* ✅ Aperçu des activités au lieu du détail complet */}
                {jour.activites && jour.activites.length > 0 ? (
                  <View style={[planStyles.activitiesPreview, { backgroundColor: theme.colors.background }]}>
                    <Text style={[planStyles.activitiesCount, { color: theme.colors.accent }]}>
                      {jour.activites.length} activité{jour.activites.length > 1 ? 's' : ''} programmée{jour.activites.length > 1 ? 's' : ''}
                    </Text>
                    <Text style={[planStyles.tapToView, { color: theme.colors.secondary }]}>
                      Appuyez pour voir le détail
                    </Text>
                  </View>
                ) : (
                  <View style={[planStyles.activitiesPreview, { backgroundColor: theme.colors.background }]}>
                    <Text style={[planStyles.restDay, { color: theme.colors.secondary }]}>
                      Jour de repos
                    </Text>
                  </View>
                )}
              </Pressable>
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

    {/* ✅ MODAL pour afficher les détails du jour */}
    <ActiviteGenereeModal
      visible={modalVisible}
      onClose={closeJourModal}
      jour={selectedJour}
      dayNumber={selectedDayNumber}
    />

    {/* ✅ DateTimePicker pour la date de début */}
    {showStartDatePicker && (
  <>
    {Platform.OS === 'ios' && (
      <View style={[planStyles.datePickerContainer, { backgroundColor: theme.colors.surface }]}>
        {/* ✅ Header avec boutons */}
        <View style={[planStyles.datePickerHeader, { borderBottomColor: theme.colors.border }]}>
          <Pressable
            style={[planStyles.datePickerButton, { backgroundColor: 'transparent' }]}
            onPress={cancelStartDateSelection}
          >
            <Text style={[planStyles.datePickerButtonText, { color: theme.colors.error }]}>
              Annuler
            </Text>
          </Pressable>
          
          <Text style={[planStyles.datePickerTitle, { color: theme.colors.primary }]}>
            Date de début
          </Text>
          
          <Pressable
            style={[planStyles.datePickerButton, { backgroundColor: theme.colors.accent }]}
            onPress={confirmStartDate}
          >
            <Text style={[planStyles.datePickerButtonText, { color: 'white' }]}>
              OK
            </Text>
          </Pressable>
        </View>
        
        {/* ✅ DatePicker iOS */}
        <DateTimePicker
          value={tempStartDate || (startDate ? new Date(startDate) : new Date())}
          mode="date"
          display="spinner"
          onChange={handleStartDateChange}
          minimumDate={new Date()}
          maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
          style={planStyles.datePickerIOS}
        />
      </View>
    )}
    
    {Platform.OS === 'android' && (
      <DateTimePicker
        value={startDate ? new Date(startDate) : new Date()}
        mode="date"
        display="default"
        onChange={handleStartDateChange}
        minimumDate={new Date()}
        maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      />
    )}
  </>
)}
  </ScrollView>
);
}