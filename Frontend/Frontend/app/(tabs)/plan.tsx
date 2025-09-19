// app/(tabs)/plan.tsx - VERSION COMPLÈTE AVEC AUTHENTIFICATION

import React, { useState, useEffect } from 'react';
import { Pressable, Alert, ActivityIndicator, ScrollView, Text, View, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import planStyles from '@/styles/screens/PlanStyles';
import { useTheme } from '@/styles/screens/ThemeStyle';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ActiviteGenereeModal from '@/components/ActiviteGenereeModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiDelete, apiPost, apiPut } from '@/utils/apiHelper'; // ✅ UTILISER les helpers authentifiés

export default function PlanScreen() {
  const theme = useTheme();
  const { user, isAuthenticated, logout, token } = useAuth(); // ✅ UTILISER le contexte d'auth
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Afficher le détail des jours d'entraînement
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
    planData: any;
  }>({
    hasAnamnese: false,
    hasEvaluation: false,
    anamneseData: null,
    evaluationData: null,
    hasPlan: false,
    planData: null
  });

  // ✅ VÉRIFICATION d'authentification au chargement
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🚫 Utilisateur non authentifié - Redirection vers login');
      return;
    }

    // ✅ UTILISER l'utilisateur du contexte d'auth
    if (user) {
      setCurrentUserId(user.id.toString());
      console.log('👤 Utilisateur authentifié:', user.email);
    }
  }, [isAuthenticated, user]);

  // ✅ CHARGEMENT initial et lors du focus
  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = user.id.toString();
      setCurrentUserId(userId);
      checkUserData(userId);
    }
  }, [isAuthenticated, user]);

  // ✅ REFRESH à chaque focus sur la page
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && user) {
        console.log('🎯 Page plan en focus - Refresh des données');
        checkUserData(user.id.toString());
      }
    }, [isAuthenticated, user])
  );

  // ✅ GESTION des dates
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      if (selectedDate && event.type !== 'dismissed') {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        setStartDate(formattedDate);
      }
    } else {
      if (selectedDate && event.type !== 'dismissed') {
        setTempStartDate(selectedDate);
      } else if (event.type === 'dismissed') {
        setShowStartDatePicker(false);
        setTempStartDate(null);
      }
    }
  };

  const confirmStartDate = () => {
    if (tempStartDate) {
      const formattedDate = tempStartDate.toISOString().split('T')[0];
      setStartDate(formattedDate);
    }
    setShowStartDatePicker(false);
    setTempStartDate(null);
  };

  const cancelStartDateSelection = () => {
    setShowStartDatePicker(false);
    setTempStartDate(null);
  };

  // ✅ FONCTIONS du modal
  const openJourModal = (jour: any, dayNumber: number) => {
    console.log('📱 Ouverture modal pour jour:', dayNumber, jour);
    setSelectedJour(jour);
    setSelectedDayNumber(dayNumber);
    setModalVisible(true);
  };

  const closeJourModal = () => {
    setModalVisible(false);
    setSelectedJour(null);
    setSelectedDayNumber(0);
  };

  // ✅ FORMATAGE des dates
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

  const formatDate = (dateString: string) => {
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
      console.error('Erreur formatage date:', error);
      return 'Date invalide';
    }
  };

  // ✅ GÉNÉRATION du plan avec authentification
  const generatePlan = async () => {
    // ✅ VÉRIFICATIONS préliminaires
    if (!isAuthenticated) {
      console.log("🚫 Utilisateur non authentifié - Redirection vers login");
      return;
    }

    if (!currentUserId) {
      console.log("🚫 Utilisateur non identifié");
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
        start_date: startDate,
      };

      // ✅ UTILISER apiPost qui gère l'authentification automatiquement
      const result = await apiPost('/ai/generate-complete-plan', planData);
      console.log('✅ Plan généré:', result);
      
      // ✅ VÉRIFIER le succès selon votre structure API
      if (result.success || result.plan || result.id) {
        // Recharger les données après génération
        if (currentUserId) {
          await checkUserData(currentUserId);
        }
        
        Alert.alert("Succès", "Plan d'entraînement généré avec succès !");
      } else {
        throw new Error(result.message || "Erreur lors de la génération");
      }
    } catch (error) {
      console.error("❌ Erreur génération plan:", error);
      
      // ✅ GESTION D'ERREURS SPÉCIFIQUE
      let errorMessage = "Impossible de générer le plan d'entraînement. Veuillez réessayer.";
      
      if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string' && (error as any).message.includes('Session expirée')) {
        errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        Alert.alert(
          "Session expirée", 
          errorMessage,
          [
            { 
              text: "Se reconnecter", 
              onPress: () => {
                logout();
                router.replace('/(auth)/login');
              }
            }
          ]
        );
        return;
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string' && (error as any).message.includes('403')) {
        errorMessage = "Vous n'avez pas l'autorisation de générer un plan.";
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ SUPPRESSION du plan avec authentification
  const deletePlan = async () => {
    try {
      // ✅ VÉRIFICATIONS préliminaires
      if (!isAuthenticated) {
        Alert.alert("Non authentifié", "Vous devez être connecté pour supprimer un plan");
        return;
      }

      if (!currentUserId) {
        Alert.alert("Erreur", "Utilisateur non identifié");
        return;
      }

      if (!userData.planData || !userData.planData.pla_id) {
        Alert.alert("Erreur", "Aucun plan à supprimer");
        return;
      }

      Alert.alert(
        "Confirmer la suppression",
        "Êtes-vous sûr de vouloir supprimer ce plan d'entraînement ? Cette action est irréversible.",
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
                console.log('🗑️ Suppression plan:', userData.planData.pla_id);

                // ✅ UTILISER apiDelete qui gère l'authentification
                const result = await apiDelete(`/plan/${userData.planData.pla_id}`);
                console.log('✅ Plan supprimé avec succès');
                
                // ✅ VÉRIFIER le succès selon votre structure API
                if (result.success || result.message?.includes('supprimé')) {
                  // Recharger les données après suppression
                  if (currentUserId) {
                    await checkUserData(currentUserId);
                  }
                  
                  Alert.alert("Succès", "Plan d'entraînement supprimé avec succès !");
                } else {
                  throw new Error(result.message || "Erreur lors de la suppression");
                }
              } catch (error) {
                console.error('❌ Erreur suppression plan:', error);
                
                let errorMessage = "Impossible de supprimer le plan d'entraînement.";
                
                if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string' && (error as any).message.includes('Session expirée')) {
                  errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
                  Alert.alert(
                    "Session expirée", 
                    errorMessage,
                    [
                      { 
                        text: "Se reconnecter", 
                        onPress: () => {
                          logout();
                          router.replace('/(auth)/login');
                        }
                      }
                    ]
                  );
                  return;
                }
                
                Alert.alert("Erreur", errorMessage);
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

  // ✅ VÉRIFICATION des données utilisateur avec authentification
  const checkUserData = async (userId: string) => {
    if (!isAuthenticated) {
      console.log('❌ Utilisateur non authentifié');
      return;
    }

    setIsLoading(true);
    console.log('🔍 Début vérification pour userId:', userId);
    
    try {
      // ✅ Vérifier anamnèse avec apiGet
      const checkAnamnese = async () => {
        try {
          console.log('📡 Appel API anamnèse...');
          const data = await apiGet(`/anamnese/user/${userId}`);
          console.log('📡 Données anamnèse reçues:', data);
          
          const anamnese = Array.isArray(data) ? data[0] : 
                         data?.anamnese?.[0] || data?.anamnese || data;
          return anamnese?.ana_id ? { hasData: true, data: anamnese } : { hasData: false, data: null };
        } catch (error) {
          console.log('❌ Erreur anamnèse:', error);
          return { hasData: false, data: null };
        }
      };

      // ✅ Vérifier évaluation avec apiGet
      const checkEvaluation = async () => {
        try {
          console.log('📡 Appel API évaluation...');
          const data = await apiGet(`/evaluation-initiale/user/${userId}`);
          console.log('📡 Données évaluation reçues:', data);
          
          const evaluation = Array.isArray(data) ? data[0] : data;
          return (evaluation?.eva_id || evaluation?.id) ? 
                 { hasData: true, data: evaluation } : 
                 { hasData: false, data: null };
        } catch (error) {
          console.log('❌ Erreur évaluation:', error);
          return { hasData: false, data: null };
        }
      };

      // ✅ Vérifier plan avec apiGet
      const checkPlan = async () => {
        try {
          console.log('📡 Appel API plan complet...');
          const data = await apiGet(`/plans/user/${userId}/complete`);
          console.log('📋 Plan complet reçu:', data);
          
          return data?.pla_id ? 
                { hasData: true, data: data } : 
                { hasData: false, data: null };
        } catch (error) {
          console.log('❌ Erreur plan complet:', error);
          return { hasData: false, data: null };
        }
      };

      // ✅ Exécuter toutes les vérifications en parallèle
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
        planData: planResult.data
      });

    } catch (error) {
      console.error('❌ Erreur vérification données:', error);
      
      // ✅ GESTION D'ERREURS SPÉCIFIQUE
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string' &&
        (error as any).message.includes('Session expirée')
      ) {
        Alert.alert(
          'Session expirée', 
          'Votre session a expiré. Veuillez vous reconnecter.',
          [
            { 
              text: "Se reconnecter", 
              onPress: () => {
                logout();
                router.replace('/(auth)/login');
              }
            }
          ]
        );
        return;
      }
      
      // ✅ RÉINITIALISER en cas d'erreur
      setUserData({
        hasAnamnese: false,
        hasEvaluation: false,
        anamneseData: null,
        evaluationData: null,
        hasPlan: false,
        planData: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ VÉRIFICATION d'authentification au niveau du composant
  if (!isAuthenticated) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: 20
      }}>
        <FontAwesome name="lock" size={50} color="#ccc" style={{ marginBottom: 20 }} />
        <Text style={{ 
          fontSize: 18, 
          textAlign: 'center', 
          marginBottom: 20,
          color: theme.colors.primary 
        }}>
          Vous devez être connecté pour accéder à votre plan d'entraînement
        </Text>
        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          style={{
            backgroundColor: theme.colors.accent,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Se connecter</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[planStyles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={planStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ✅ HEADER avec informations utilisateur */}
      <View style={[planStyles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={{ flex: 1 }}>
          <Text style={[planStyles.mainTitle, { color: theme.colors.primary }]}>
            Mon Plan d'Entraînement
          </Text>
          {/* ✅ AFFICHER l'utilisateur connecté */}
          {user && (
            <Text style={[planStyles.subtitle, { color: theme.colors.accent, fontSize: 12, marginTop: 4 }]}>
              {user.email}
            </Text>
          )}
        </View>
        
        {/* ✅ BOUTON RAFRAÎCHIR */}
        <Pressable
          style={[
            planStyles.refreshButton,
            { 
              backgroundColor: theme.colors.surfaceVariant,
              opacity: isLoading ? 0.5 : 1
            }
          ]}
          onPress={() => {
            if (currentUserId && !isLoading) {
              console.log('🔄 Rafraîchissement des données...');
              checkUserData(currentUserId);
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.accent} />
          ) : (
            <FontAwesome name="refresh" size={18} color={theme.colors.accent} />
          )}
        </Pressable>
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
                  Complétez votre anamnèse et évaluation pour générer votre plan personnalisé {'\n'} Allez sous l'onglet profil pour compléter ces sections.

                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* ✅ AFFICHAGE DU PLAN */}
      {!isLoading && userData.hasPlan && userData.planData && (
        <View style={planStyles.planSection}>
          {/* ✅ BOUTON supprimer avec confirmation */}
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
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.error} size="small" />
              ) : (
                <Text style={[planStyles.deleteButtonText, { color: theme.colors.error }]}>
                  Supprimer le plan
                </Text>
              )}
            </Pressable>
          </View>

          {/* ✅ HEADER du plan */}
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

          {/* ✅ LISTE des jours avec modal */}
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
                    <FontAwesome name="chevron-right" size={16} color={theme.colors.secondary} />
                  </View>

                  {/* ✅ APERÇU des activités */}
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
              <FontAwesome name="calendar-times-o" size={32} color={theme.colors.warning} style={{ marginBottom: 15 }} />
              <Text style={[planStyles.noDaysText, { color: theme.colors.warning }]}>
                Plan créé mais aucun jour trouvé.
              </Text>
              <Text style={[planStyles.noDaysSubtext, { color: theme.colors.secondary }]}>
                Le plan est peut-être en cours de génération. Essayez de rafraîchir.
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

      {/* ✅ ESPACE EN BAS */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}