// app/(tabs)/index.tsx - VERSION COMPLÈTE AVEC AUTHENTIFICATION

import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, Pressable, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/styles/screens/ThemeStyle';
import accueilStyles from '@/styles/screens/AccueilStyle';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/utils/apiHelper'; // ✅ UTILISER les helpers authentifiés

export default function HomeScreen() { 
  const theme = useTheme();
  const { user, isAuthenticated, logout, token } = useAuth(); // ✅ UTILISER le contexte d'auth
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [todayActivities, setTodayActivities] = useState<any[]>([]);
  const [todayJour, setTodayJour] = useState<any>(null);
  
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
      console.log('❌ Utilisateur non authentifié - redirection vers login');
      router.replace('/(auth)/login');
      return;
    }

    // ✅ UTILISER l'utilisateur du contexte d'auth
    if (user) {
      setCurrentUserId(user.id.toString());
      console.log('👤 Utilisateur authentifié:', user.email);
    }
  }, [isAuthenticated, user]);

  // ✅ DÉPLACER la logique de chargement dans une fonction séparée
  const loadUserData = async () => {
    if (!isAuthenticated || !user) {
      console.log('❌ Pas d\'utilisateur authentifié pour charger les données');
      return;
    }

    try {
      console.log('🔄 Rechargement des données utilisateur...');
      const userId = user.id.toString();
      setCurrentUserId(userId);
      
      // ✅ CHARGER les données en parallèle
      await Promise.all([
        checkUserData(userId),
        fetchTodayActivities(userId)
      ]);
    } catch (error) {
      console.error("❌ Erreur chargement données:", error);
      
      // ✅ GESTION D'ERREURS SPÉCIFIQUE
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string' &&
        (error as { message: string }).message.includes('Session expirée')
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
      }
    }
  };

  // ✅ Chargement initial quand l'utilisateur est authentifié
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  // ✅ AJOUTER le refresh à chaque focus sur la page
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && user) {
        console.log('🎯 Page en focus - Refresh des données');
        loadUserData();
      }
    }, [isAuthenticated, user])
  );

  // ✅ MÉTHODE pour récupérer les données utilisateur avec authentification
  const checkUserData = async (userId: string) => {
    if (!isAuthenticated) {
      console.log('❌ Non authentifié - impossible de récupérer les données');
      return;
    }

    setIsLoading(true);
    console.log(`🔍 Début vérification données pour user ${userId}`);
    
    try {
      // ✅ Vérifier anamnèse avec apiGet
      const checkAnamnese = async () => {
        try {
          console.log('📡 Appel API anamnèse...');
          const data = await apiGet(`/anamnese/user/${userId}`);
          console.log('📋 Anamnèse data:', data);
          
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
          console.log('📋 Évaluation data:', data);
          
          const evaluation = Array.isArray(data) ? data[0] : data;
          return (evaluation?.eval_id || evaluation?.eva_id || evaluation?.id) ? 
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
          console.log('📡 Appel API plan...');
          const data = await apiGet(`/plans/user/${userId}/complete`);
          console.log('📋 Plan data:', data);
          
          return data?.pla_id ? 
                { hasData: true, data: data } : 
                { hasData: false, data: null };
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
      
      // ✅ GESTION D'ERREURS SPÉCIFIQUE
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string' &&
        (error as { message: string }).message.includes('Session expirée')
      ) {
        throw error; // ✅ PROPAGER l'erreur pour gestion au niveau supérieur
      }
      
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

  // ✅ MÉTHODE pour récupérer les activités du jour avec authentification
  const fetchTodayActivities = async (userId: string) => {
    if (!isAuthenticated) {
      console.log('❌ Non authentifié - impossible de récupérer les activités');
      return;
    }

    try {
      console.log(`🔄 Récupération activités pour user ${userId}`);
      
      // ✅ UTILISER apiGet qui gère l'authentification automatiquement
      const data = await apiGet(`/jours/user/${userId}/today`);
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
      
      // ✅ GESTION D'ERREURS SPÉCIFIQUE
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string' &&
        (error as { message: string }).message.includes('Session expirée')
      ) {
        throw error; // ✅ PROPAGER l'erreur pour gestion au niveau supérieur
      }
      
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

  // ✅ GESTION de la déconnexion
  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert("Erreur", "Impossible de se déconnecter. Veuillez réessayer.");
            }
          }
        }
      ]
    );
  };

  // ✅ Rendu de l'activité du jour
  const renderTodayActivity = () => {
    // ✅ DEBUG : Afficher l'état complet
    console.log('🎭 RENDU - État complet:', {
      isAuthenticated,
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
            {'Chargement de vos données...'}
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
              {'Votre programme d\'aujourd\'hui'}
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
            {todayActivities.map((activite, index) => {
    // ✅ VALIDATION des données avant rendu
    const safeActivite = {
      id: activite.gen_id || index,
      nom: String(activite.gen_nom || 'Activité sans nom'),
      type: String(activite.gen_type || 'Type inconnu'),
      duree: activite.gen_duree ? String(activite.gen_duree) : null,
      distance: activite.gen_distance ? String(activite.gen_distance) : null,
      intensite: activite.gen_intensite ? String(activite.gen_intensite) : null,
      commentaire: activite.gen_commentaire ? String(activite.gen_commentaire) : null
    };

    return (
      <View key={safeActivite.id} style={[accueilStyles.activityCard, { backgroundColor: theme.colors.background }]}>
        <View style={accueilStyles.activityHeader}>
          <Text style={[accueilStyles.activityName, { color: theme.colors.primary }]}>
            {safeActivite.nom}
          </Text>
          <View style={[accueilStyles.activityTypeBadge, { backgroundColor: theme.colors.accent }]}>
            <Text style={accueilStyles.activityTypeText}>
              {safeActivite.type}
            </Text>
          </View>
        </View>
        
        <View style={accueilStyles.activityDetails}>
          {safeActivite.duree && (
            <View style={accueilStyles.activityDetail}>
              <FontAwesome name="clock-o" size={14} color={theme.colors.secondary} />
              <Text style={[accueilStyles.activityDetailText, { color: theme.colors.secondary }]}>
                {safeActivite.duree} minutes
              </Text>
            </View>
          )}
          
          {safeActivite.distance && (
            <View style={accueilStyles.activityDetail}>
              <FontAwesome name="road" size={14} color={theme.colors.secondary} />
              <Text style={[accueilStyles.activityDetailText, { color: theme.colors.secondary }]}>
                {safeActivite.distance} km
              </Text>
            </View>
          )}
          
          {safeActivite.intensite && (
            <View style={accueilStyles.activityDetail}>
              <FontAwesome name="tachometer" size={14} color={theme.colors.secondary} />
              <Text style={[accueilStyles.activityDetailText, { color: theme.colors.secondary }]}>
                {safeActivite.intensite}
              </Text>
            </View>
          )}
        </View>
        
        {safeActivite.commentaire && (
          <Text style={[accueilStyles.activityComment, { color: theme.colors.secondary }]}>
            💡 {safeActivite.commentaire}
          </Text>
        )}
      </View>
    );
  })}
        </View>
  </View>
      );
    }

    // ✅ CONDITION 2 : Utilisateur avec plan mais pas d'activité aujourd'hui
    if (userData.hasPlan === true && todayActivities.length === 0) {
      console.log(' RENDU: Plan avec jour de repos');
      return (
        <View style={[accueilStyles.card, { backgroundColor: theme.colors.surface }, theme.shadows]}>
          <View style={accueilStyles.cardHeader}>
            <FontAwesome name="bed" size={24} color={theme.colors.secondary} />
            <Text style={[accueilStyles.cardTitle, { color: theme.colors.primary }]}>
              {'Aujourd\'hui : Repos'}
            </Text>
          </View>
          
          <Text style={[accueilStyles.dateText, { color: theme.colors.secondary }]}>
            {formatDate(new Date().toISOString())}
          </Text>
          
          <View style={accueilStyles.emptyState}>
            <FontAwesome name="heart" size={32} color={theme.colors.accent} />
            <Text style={[accueilStyles.emptyTitle, { color: theme.colors.primary }]}>
              {'Jour de récupération'}
            </Text>
            <Text style={[accueilStyles.emptySubtitle, { color: theme.colors.secondary }]}>
              {'Aucune activité prévue aujourd\'hui. Profitez-en pour récupérer et vous reposer !'}
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
            {'Créez votre plan d\'entraînement'}
          </Text>
        </View>
        
        <View style={accueilStyles.emptyState}>
          <FontAwesome name="rocket" size={32} color={theme.colors.accent} />
          <Text style={[accueilStyles.emptyTitle, { color: theme.colors.primary }]}>
            {'Commencez votre parcours'}
          </Text>
          <Text style={[accueilStyles.emptySubtitle, { color: theme.colors.secondary }]}>
            {'Créez votre plan d\'entraînement personnalisé en quelques étapes.'}
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
                {'Créer mon plan'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
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
          {'Vous devez être connecté pour accéder au tableau de bord'}
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
    <ScrollView style={[accueilStyles.container, { backgroundColor: theme.colors.background }]}>
      {/* ✅ HEADER avec informations utilisateur et déconnexion */}
      <View style={[accueilStyles.header, { backgroundColor: theme.colors.surface }, theme.shadows]}>
        <View style={{ flex: 1 }}>
          <Text style={[accueilStyles.title, { color: theme.colors.primary }]}>
            {'Tableau de bord'}
          </Text>
          <Text style={[accueilStyles.subtitle, { color: theme.colors.secondary }]}>
            {'Votre entraînement triathlon'}
          </Text>
          {/* ✅ AFFICHER l'utilisateur connecté */}
          {user && (
            <Text style={[accueilStyles.subtitle, { color: theme.colors.accent, fontSize: 12, marginTop: 4 }]}>
              {'Connecté en tant que ' + user.email}
            </Text>
          )}
        </View>
        
        {/* ✅ BOUTON de déconnexion */}
        <Pressable
          onPress={handleLogout}
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: theme.colors.error + '20',
          }}
        >
          <FontAwesome name="sign-out" size={20} color={theme.colors.error} />
        </Pressable>
      </View>
      
      {/* ✅ CONTENU PRINCIPAL */}
      {renderTodayActivity()}
      
      {/* ✅ RACCOURCIS RAPIDES si utilisateur a des données */}
      {(userData.hasAnamnese || userData.hasEvaluation || userData.hasPlan) && (
        <View style={[accueilStyles.card, { backgroundColor: theme.colors.surface }, theme.shadows]}>
          <View style={accueilStyles.cardHeader}>
            <FontAwesome name="dashboard" size={24} color={theme.colors.accent} />
            <Text style={[accueilStyles.cardTitle, { color: theme.colors.primary }]}>
              {'Accès rapide'}
            </Text>
          </View>
          
          <View style={accueilStyles.actionButtons}>
            {userData.hasAnamnese && (
              <Pressable
                style={[accueilStyles.actionButton, { backgroundColor: theme.colors.accent + '20' }]}
                onPress={() => router.push('/(tabs)/profil')}
              >
                <FontAwesome name="user-md" size={16} color={theme.colors.accent} />
                <Text style={[accueilStyles.actionButtonText, { color: theme.colors.accent }]}>
                  {'Mon profil'}
                </Text>
              </Pressable>
            )}
            
            {userData.hasPlan && (
              <Pressable
                style={[accueilStyles.actionButton, { backgroundColor: theme.colors.accent + '20' }]}
                onPress={() => router.push('/(tabs)/plan')}
              >
                <FontAwesome name="calendar" size={16} color={theme.colors.accent} />
                <Text style={[accueilStyles.actionButtonText, { color: theme.colors.accent }]}>
                  {'Mon plan'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
      
      {/* ✅ ESPACE EN BAS */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}