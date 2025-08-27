// app/(tabs)/index.tsx - VERSION COMPLÈTE CORRIGÉE
import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router'; // ✅ AJOUTER useFocusEffect
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/styles/screens/ThemeStyle';
import accueilStyles from '@/styles/screens/AccueilStyle';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = "http://192.168.0.112:8000/api";

export default function HomeScreen() { 
  const theme = useTheme();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [todayActivities, setTodayActivities] = useState<any[]>([]);
  const [todayJour, setTodayJour] = useState<any>(null);
  const { user, logout } = useAuth();
  
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

  // ✅ DÉPLACER la logique de chargement dans une fonction séparée
  const loadUserData = async () => {
    try {
      console.log('🔄 Rechargement des données utilisateur...');
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);
      if (userId) {
        checkUserData(userId);
        fetchTodayActivities(userId);
      }
    } catch (error) {
      console.error("Erreur récupération userId:", error);
    }
  };

  // ✅ Chargement initial
  useEffect(() => {
    loadUserData();
  }, []);

  // ✅ AJOUTER le refresh à chaque focus sur la page
  useFocusEffect(
    React.useCallback(() => {
      console.log('🎯 Page en focus - Refresh des données');
      loadUserData();
    }, [])
  );

  // ✅ MÉTHODE pour récupérer les données utilisateur
  const checkUserData = async (userId: string) => {
    setIsLoading(true);
    console.log(`🔍 Début vérification données pour user ${userId}`);
    
    try {
      // ✅ Vérifier anamnèse (comme dans plan.tsx)
      const checkAnamnese = async () => {
        try {
          console.log('📡 Appel API anamnèse...');
          const response = await fetch(`${API_BASE_URL}/anamnese/user/${userId}`);
          console.log('📡 Anamnèse response status:', response.status);
          
          if (response.status === 200) {
            const data = await response.json();
            console.log('📋 Anamnèse data:', data);
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

      // ✅ Vérifier évaluation (comme dans plan.tsx)
      const checkEvaluation = async () => {
        try {
          console.log('📡 Appel API évaluation...');
          const response = await fetch(`${API_BASE_URL}/evaluation-initiale/user/${userId}`);
          console.log('📡 Évaluation response status:', response.status);
          
          if (response.status === 200) {
            const data = await response.json();
            console.log('📋 Évaluation data:', data);
            const evaluation = Array.isArray(data) ? data[0] : data;
            return (evaluation?.eval_id || evaluation?.eva_id || evaluation?.id) ? 
                   { hasData: true, data: evaluation } : 
                   { hasData: false, data: null };
          }
          return { hasData: false, data: null };
        } catch (error) {
          console.log('❌ Erreur évaluation:', error);
          return { hasData: false, data: null };
        }
      };

      // ✅ Vérifier plan (comme dans plan.tsx)
      const checkPlan = async () => {
        try {
          console.log('📡 Appel API plan...');
          const response = await fetch(`${API_BASE_URL}/plans/user/${userId}/complete`);
          console.log('📡 Plan response status:', response.status);
          
          if (response.status === 200) {
            const data = await response.json();
            console.log('📋 Plan data:', data);
            return data?.pla_id ? 
                  { hasData: true, data: data } : 
                  { hasData: false, data: null };
          }
          return { hasData: false, data: null };
        } catch (error) {
          console.log('❌ Erreur plan:', error);
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

      const newUserData = {
        hasAnamnese: anamneseResult.hasData,
        hasEvaluation: evaluationResult.hasData,
        anamneseData: anamneseResult.data,
        evaluationData: evaluationResult.data,
        hasPlan: planResult.hasData,
        planData: planResult.data
      };

      console.log('📊 RÉSUMÉ FINAL des données utilisateur:', newUserData);
      setUserData(newUserData);

    } catch (error) {
      console.error('❌ Erreur checkUserData:', error);
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

  // ✅ MÉTHODE pour récupérer les activités du jour (correcte)
  const fetchTodayActivities = async (userId: string) => {
    try {
      console.log(`🔄 Récupération activités pour user ${userId}`);
      const response = await fetch(`${API_BASE_URL}/jours/user/${userId}/today`);
      
      console.log(`📋 Response status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status}`);
        setTodayJour(null);
        setTodayActivities([]);
        return;
      }
      
      const data = await response.json();
      console.log('✅ Données activités COMPLÈTES:', JSON.stringify(data, null, 2));
      
      if (data?.success && data?.jour) {
        console.log('📅 Jour trouvé:', data.jour);
        console.log('🏃 Activités trouvées:', data.activites?.length || 0);
        setTodayJour(data.jour);
        setTodayActivities(data.activites || []);
      } else if (data?.success && !data?.jour) {
        console.log('ℹ️ Succès mais aucun jour trouvé');
        setTodayJour(null);
        setTodayActivities([]);
      } else {
        console.log('ℹ️ Pas de succès dans la réponse');
        setTodayJour(null);
        setTodayActivities([]);
      }
    } catch (error) {
      console.error('❌ Erreur récupération activités du jour:', error);
      setTodayJour(null);
      setTodayActivities([]);
    }
  };

  // ✅ Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ✅ Rendu de l'activité du jour
  const renderTodayActivity = () => {
    // ✅ DEBUG : Afficher l'état complet
    console.log('🎭 RENDU - État complet:', {
      isLoading,
      'userData.hasPlan': userData.hasPlan,
      'userData.hasAnamnese': userData.hasAnamnese,
      'userData.hasEvaluation': userData.hasEvaluation,
      'todayJour': !!todayJour,
      'todayActivities.length': todayActivities.length,
      userData
    });

    if (isLoading) {
      console.log('🔄 RENDU: Loading state');
      return (
        <View style={[accueilStyles.card, { backgroundColor: theme.colors.surface }, theme.shadows]}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[accueilStyles.loadingText, { color: theme.colors.secondary }]}>
            Chargement...
          </Text>
        </View>
      );
    }

    // ✅ CONDITION 1 : Utilisateur avec plan + activités
    if (userData.hasPlan === true && todayJour && todayActivities.length > 0) {
      console.log('✅ RENDU: Plan avec activités du jour');
      return (
        <View style={[accueilStyles.card, { backgroundColor: theme.colors.surface }, theme.shadows]}>
          <View style={accueilStyles.cardHeader}>
            <FontAwesome name="calendar-check-o" size={24} color={theme.colors.accent} />
            <Text style={[accueilStyles.cardTitle, { color: theme.colors.primary }]}>
              Votre programme d'aujourd'hui
            </Text>
          </View>
          
          <Text style={[accueilStyles.dateText, { color: theme.colors.secondary }]}>
            {formatDate(todayJour.jou_date)}
          </Text>
          
          {todayJour.jou_description && (
            <Text style={[accueilStyles.descriptionText, { color: theme.colors.secondary }]}>
              {todayJour.jou_description}
            </Text>
          )}
          
          <View style={accueilStyles.activitiesContainer}>
            {todayActivities.map((activite, index) => (
              <View key={activite.gen_id || index} style={[accueilStyles.activityCard, { backgroundColor: theme.colors.background }]}>
                <View style={accueilStyles.activityHeader}>
                  <Text style={[accueilStyles.activityName, { color: theme.colors.primary }]}>
                    {activite.gen_nom}
                  </Text>
                  <View style={[accueilStyles.activityTypeBadge, { backgroundColor: theme.colors.accent }]}>
                    <Text style={accueilStyles.activityTypeText}>
                      {activite.gen_type}
                    </Text>
                  </View>
                </View>
                
                <View style={accueilStyles.activityDetails}>
                  {activite.gen_duree && (
                    <View style={accueilStyles.activityDetail}>
                      <FontAwesome name="clock-o" size={14} color={theme.colors.secondary} />
                      <Text style={[accueilStyles.activityDetailText, { color: theme.colors.secondary }]}>
                        {activite.gen_duree} minutes
                      </Text>
                    </View>
                  )}
                  
                  {activite.gen_distance && (
                    <View style={accueilStyles.activityDetail}>
                      <FontAwesome name="road" size={14} color={theme.colors.secondary} />
                      <Text style={[accueilStyles.activityDetailText, { color: theme.colors.secondary }]}>
                        {activite.gen_distance} km
                      </Text>
                    </View>
                  )}
                  
                  {activite.gen_intensite && (
                    <View style={accueilStyles.activityDetail}>
                      <FontAwesome name="tachometer" size={14} color={theme.colors.secondary} />
                      <Text style={[accueilStyles.activityDetailText, { color: theme.colors.secondary }]}>
                        {activite.gen_intensite}
                      </Text>
                    </View>
                  )}
                </View>
                
                {activite.gen_commentaire && (
                  <Text style={[accueilStyles.activityComment, { color: theme.colors.secondary }]}>
                    💡 {activite.gen_commentaire}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      );
    }

    // ✅ CONDITION 2 : Utilisateur avec plan mais pas d'activité aujourd'hui
    if (userData.hasPlan === true && todayActivities.length === 0) {
      console.log('✅ RENDU: Plan avec jour de repos');
      return (
        <View style={[accueilStyles.card, { backgroundColor: theme.colors.surface }, theme.shadows]}>
          <View style={accueilStyles.cardHeader}>
            <FontAwesome name="bed" size={24} color={theme.colors.secondary} />
            <Text style={[accueilStyles.cardTitle, { color: theme.colors.primary }]}>
              Aujourd'hui : Repos
            </Text>
          </View>
          
          <Text style={[accueilStyles.dateText, { color: theme.colors.secondary }]}>
            {formatDate(new Date().toISOString())}
          </Text>
          
          <View style={accueilStyles.emptyState}>
            <FontAwesome name="heart" size={32} color={theme.colors.accent} />
            <Text style={[accueilStyles.emptyTitle, { color: theme.colors.primary }]}>
              Jour de récupération
            </Text>
            <Text style={[accueilStyles.emptySubtitle, { color: theme.colors.secondary }]}>
              Aucune activité prévue aujourd'hui. Profitez-en pour récupérer et vous reposer !
            </Text>
          </View>
        </View>
      );
    }

    // ✅ CONDITION 3 : Pas de plan
    console.log('✅ RENDU: Pas de plan - redirection');
    return (
      <View style={[accueilStyles.card, { backgroundColor: theme.colors.surface }, theme.shadows]}>
        <View style={accueilStyles.cardHeader}>
          <FontAwesome name="plus-circle" size={24} color={theme.colors.accent} />
          <Text style={[accueilStyles.cardTitle, { color: theme.colors.primary }]}>
            Créez votre plan d'entraînement
          </Text>
        </View>
        
        <View style={accueilStyles.emptyState}>
          <FontAwesome name="rocket" size={32} color={theme.colors.accent} />
          <Text style={[accueilStyles.emptyTitle, { color: theme.colors.primary }]}>
            Commencez votre parcours
          </Text>
          <Text style={[accueilStyles.emptySubtitle, { color: theme.colors.secondary }]}>
            Créez votre plan d'entraînement personnalisé en quelques étapes.
          </Text>
          
          <View style={accueilStyles.actionButtons}>
            <Pressable
              style={[accueilStyles.actionButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => {
                console.log('🔘 Redirection vers plan');
                router.push('/(tabs)/plan');
              }}
            >
              <FontAwesome name="calendar-plus-o" size={16} color="white" />
              <Text style={accueilStyles.actionButtonText}>
                Créer mon plan
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[accueilStyles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[accueilStyles.header, { backgroundColor: theme.colors.surface }, theme.shadows]}>
        <Text style={[accueilStyles.title, { color: theme.colors.primary }]}>
          Tableau de bord
        </Text>
        <Text style={[accueilStyles.subtitle, { color: theme.colors.secondary }]}>
          Votre entraînement triathlon
        </Text>
      </View>
      
      {renderTodayActivity()}
    </ScrollView>
  );
}