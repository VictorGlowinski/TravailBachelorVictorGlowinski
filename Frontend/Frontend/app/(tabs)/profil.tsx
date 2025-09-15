// app/(tabs)/profil.tsx - VERSION COMPLÈTE AVEC AUTHENTIFICATION

import React, { Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profilStyles from '@/styles/screens/ProfilStyles';
import { useTheme } from '@/styles/screens/ThemeStyle';
import { router, useFocusEffect } from 'expo-router';
import AnamneseModal from '@/components/AnamneseModal'; 
import EvaluationInitialeModal from '@/components/EvaluationInitialeModal';
import UserSettingsModal from '@/components/UserSettingsModal';
import { apiGet } from '@/utils/apiHelper'; // UTILISER les helpers authentifiés

// Interface pour les données
interface UserData {
    hasAnamnese: boolean;
    hasEvaluation: boolean;
    anamneseData?: any;
    evaluationData?: any;
}

export default function ProfilScreen() {
    const theme = useTheme();
    const { user, isAuthenticated, logout, token } = useAuth(); // UTILISER le contexte d'auth
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData>({
        hasAnamnese: false,
        hasEvaluation: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showInfo, setShowInfo] = useState(false);
    const [anamneseModalVisible, setAnamneseModalVisible] = useState(false);
    const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);

    // VÉRIFICATION d'authentification au chargement
    useEffect(() => {
        // UTILISER l'utilisateur du contexte d'auth
        if (user) {
            setCurrentUserId(user.id.toString());
            console.log('👤 Utilisateur authentifié:', user.email);
        }
    }, [isAuthenticated, user]);

    // FONCTIONS du modal
    const openAnamneseModal = () => {
        if (!isAuthenticated) {
            return;
        }
        setAnamneseModalVisible(true);
    };

    const openEvaluationModal = () => {
        if (!isAuthenticated) {
            return;
        }
        setEvaluationModalVisible(true);
    };

    const openSettingsModal = () => {
        if (!isAuthenticated) {
            return;
        }
        setSettingsModalVisible(true);
    };

    // ✅ FONCTION pour vérifier les données utilisateur avec authentification
    const checkUserData = async () => {
        if (!isAuthenticated || !user?.id) {
            console.log('❌ Utilisateur non authentifié');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        console.log('🔍 Vérification des données pour userId:', user.id);

        try {
            const userId = user.id.toString();

            // Vérifier anamnèse avec apiGet
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

            // Vérifier évaluation avec apiGet
            const checkEvaluation = async () => {
                try {
                    console.log('📡 Appel API évaluation...');
                    const data = await apiGet(`/evaluation-initiale/user/${userId}`);
                    console.log('📋 Évaluation data:', data);
                    
                    const evaluation = Array.isArray(data) ? data[0] : data;
                    return (evaluation?.eva_id || evaluation?.id) ? 
                           { hasData: true, data: evaluation } : 
                           { hasData: false, data: null };
                } catch (error) {
                    console.log('❌ Erreur évaluation:', error);
                    return { hasData: false, data: null };
                }
            };

            // ✅ Exécuter les vérifications en parallèle
            const [anamneseResult, evaluationResult] = await Promise.all([
                checkAnamnese(),
                checkEvaluation()
            ]);

            console.log('✅ Résultats finaux:');
            console.log('   - Anamnèse:', anamneseResult.hasData);
            console.log('   - Évaluation:', evaluationResult.hasData);

            setUserData({
                hasAnamnese: anamneseResult.hasData,
                hasEvaluation: evaluationResult.hasData,
                anamneseData: anamneseResult.data,
                evaluationData: evaluationResult.data
            });

        } catch (error) {
            console.error('❌ Erreur vérification données:', error);
            
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
                return;
            }

            // RÉINITIALISER en cas d'erreur
            setUserData({ 
                hasAnamnese: false, 
                hasEvaluation: false, 
                anamneseData: null, 
                evaluationData: null 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Vérifier au chargement du composant
    useEffect(() => {
        if (isAuthenticated && user) {
            checkUserData();
        }
    }, [isAuthenticated, user]);

    // REFRESH à chaque focus sur la page
    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated && user) {
                console.log('🎯 Page profil en focus - Refresh des données');
                checkUserData();
            }
        }, [isAuthenticated, user])
    );

    // GESTION de la déconnexion
    const handleLogout = async () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Déconnecter', 
                    style: 'destructive',
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

    

    // VÉRIFICATION d'authentification au niveau du composant
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
                    Vous devez être connecté pour accéder à votre profil
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
            style={[profilStyles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={profilStyles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* HEADER MODERNISÉ avec engrenage */}
            <View style={[profilStyles.header, { backgroundColor: theme.colors.surface }, theme.shadows]}>
                {/* ENGRENAGE EN HAUT À DROITE */}
                <Pressable 
                    style={[profilStyles.settingsButton, { backgroundColor: theme.colors.surfaceVariant }]}
                    onPress={openSettingsModal}
                >
                    <FontAwesome name="cog" size={20} color={theme.colors.secondary} />
                </Pressable>

                <View style={profilStyles.avatarContainer}>
                    <View style={[profilStyles.avatar, { backgroundColor: theme.colors.accent }]}>
                        <FontAwesome name="user" size={32} color="white" />
                    </View>
                </View>
                
                {user && (
                    <View style={profilStyles.userInfo}>
                        <Text style={[profilStyles.welcomeText, { color: theme.colors.primary }]}>
                            Bienvenue !
                        </Text>
                        <Text style={[profilStyles.emailText, { color: theme.colors.secondary }]}>
                            {user.email}
                        </Text>
                        
                        {/* BADGES DE PROGRESSION */}
                        {!isLoading && (
                            <View style={profilStyles.progressBadges}>
                                <View style={[
                                    profilStyles.progressBadge, 
                                    { backgroundColor: userData.hasAnamnese ? theme.colors.success : theme.colors.warning }
                                ]}>
                                    <FontAwesome 
                                        name={userData.hasAnamnese ? "check" : "clock-o"} 
                                        size={12} 
                                        color="white" 
                                    />
                                    <Text style={profilStyles.badgeText}>
                                        Anamnèse {userData.hasAnamnese ? "✓" : "En attente"}
                                    </Text>
                                </View>
                                
                                <View style={[
                                    profilStyles.progressBadge, 
                                    { backgroundColor: userData.hasEvaluation ? theme.colors.success : theme.colors.warning }
                                ]}>
                                    <FontAwesome 
                                        name={userData.hasEvaluation ? "check" : "clock-o"} 
                                        size={12} 
                                        color="white" 
                                    />
                                    <Text style={profilStyles.badgeText}>
                                        Évaluation {userData.hasEvaluation ? "✓" : "En attente"}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* LOADING STATE AMÉLIORÉ */}
            {isLoading && (
                <View style={[profilStyles.loadingCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
                    <ActivityIndicator size="large" color={theme.colors.accent} />
                    <Text style={[profilStyles.loadingText, { color: theme.colors.secondary }]}>
                        Vérification de vos données...
                    </Text>
                </View>
            )}

            {/* SECTION ACTIONS MODERNISÉE */}
            {!isLoading && (
                <View style={profilStyles.actionsSection}>
                    <Text style={[profilStyles.sectionTitle, { color: theme.colors.primary }]}>
                        Mes données
                    </Text>
                    
                    <View style={profilStyles.cardsContainer}>
                        {/* CARTE ANAMNÈSE MODERNISÉE */}
                        {!userData.hasAnamnese ? (
                            <Pressable 
                                style={[
                                    profilStyles.actionCard, 
                                    { backgroundColor: theme.colors.surface },
                                    theme.shadows
                                ]}
                                onPress={() => {
                                    if (isAuthenticated) {
                                        router.push('/(tabs)/creationAnamnese');
                                    } 
                                }}
                            >
                                <View style={profilStyles.cardContent}>
                                    <View style={[profilStyles.cardIcon, { backgroundColor: '#4A90E2' }]}>
                                        <FontAwesome name="file-text-o" size={24} color="white" />
                                    </View>
                                    <View style={profilStyles.cardText}>
                                        <Text style={[profilStyles.cardTitle, { color: theme.colors.primary }]}>
                                            Créer une anamnèse
                                        </Text>
                                        <Text style={[profilStyles.cardSubtitle, { color: theme.colors.secondary }]}>
                                            Questionnaire sur votre état actuel
                                        </Text>
                                    </View>
                                    <View style={profilStyles.cardChevron}>
                                        <FontAwesome name="chevron-right" size={16} color={theme.colors.accent} />
                                    </View>
                                </View>
                            </Pressable>
                        ) : (
                            <Pressable 
                                style={[
                                    profilStyles.actionCard,
                                    profilStyles.completedCard,
                                    { backgroundColor: theme.colors.surface },
                                    theme.shadows
                                ]} 
                                onPress={openAnamneseModal}
                            >
                                <View style={profilStyles.cardContent}>
                                    <View style={[profilStyles.cardIcon, { backgroundColor: theme.colors.success }]}>
                                        <FontAwesome name="check-circle" size={24} color="white" />
                                    </View>
                                    <View style={profilStyles.cardText}>
                                        <Text style={[profilStyles.cardTitle, { color: theme.colors.primary }]}>
                                            Anamnèse complétée
                                        </Text>
                                        <Text style={[profilStyles.cardSubtitle, { color: theme.colors.secondary }]}>
                                            Appuyez pour consulter ou modifier
                                        </Text>
                                    </View>
                                    <View style={profilStyles.cardChevron}>
                                        <FontAwesome name="chevron-right" size={16} color={theme.colors.accent} />
                                    </View>
                                </View>
                            </Pressable>
                        )}

                        {/* CARTE ÉVALUATION MODERNISÉE */}
                        {!userData.hasEvaluation ? (
                            <Pressable 
                                style={[
                                    profilStyles.actionCard, 
                                    { backgroundColor: theme.colors.surface },
                                    theme.shadows
                                ]}
                                onPress={() => {
                                    if (isAuthenticated) {
                                        router.push('/(tabs)/creationEvaluationInitiale');
                                    } 
                                }}
                            >
                                <View style={profilStyles.cardContent}>
                                    <View style={[profilStyles.cardIcon, { backgroundColor: '#E74C3C' }]}>
                                        <FontAwesome name="heartbeat" size={24} color="white" />
                                    </View>
                                    <View style={profilStyles.cardText}>
                                        <Text style={[profilStyles.cardTitle, { color: theme.colors.primary }]}>
                                            Créer une évaluation
                                        </Text>
                                        <Text style={[profilStyles.cardSubtitle, { color: theme.colors.secondary }]}>
                                            Tests de condition physique
                                        </Text>
                                    </View>
                                    <View style={profilStyles.cardChevron}>
                                        <FontAwesome name="chevron-right" size={16} color={theme.colors.accent} />
                                    </View>
                                </View>
                            </Pressable>
                        ) : (
                            <Pressable 
                                style={[
                                    profilStyles.actionCard,
                                    profilStyles.completedCard,
                                    { backgroundColor: theme.colors.surface },
                                    theme.shadows
                                ]} 
                                onPress={openEvaluationModal}
                            >
                                <View style={profilStyles.cardContent}>
                                    <View style={[profilStyles.cardIcon, { backgroundColor: theme.colors.success }]}>
                                        <FontAwesome name="check-circle" size={24} color="white" />
                                    </View>
                                    <View style={profilStyles.cardText}>
                                        <Text style={[profilStyles.cardTitle, { color: theme.colors.primary }]}>
                                            Évaluation complétée
                                        </Text>
                                        <Text style={[profilStyles.cardSubtitle, { color: theme.colors.secondary }]}>
                                            Appuyez pour consulter ou modifier
                                        </Text>
                                    </View>
                                    <View style={profilStyles.cardChevron}>
                                        <FontAwesome name="chevron-right" size={16} color={theme.colors.accent} />
                                    </View>
                                </View>
                            </Pressable>
                        )}
                    </View>

                    {/* BOUTON REFRESH MODERNISÉ */}
                    <Pressable 
                        style={[
                            profilStyles.refreshButton, 
                            { 
                                backgroundColor: theme.colors.surfaceVariant,
                                opacity: isLoading ? 0.5 : 1
                            }
                        ]} 
                        onPress={() => {
                            if (!isLoading && isAuthenticated) {
                                checkUserData();
                            }
                        }}
                        disabled={isLoading || !isAuthenticated}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={theme.colors.accent} />
                        ) : (
                            <FontAwesome name="refresh" size={16} color={theme.colors.accent} />
                        )}
                        <Text style={[profilStyles.refreshText, { color: theme.colors.accent }]}>
                            Actualiser mes données
                        </Text>
                    </Pressable>
                </View>
            )}

            {/* SECTION AIDE MODERNISÉE */}
            <View style={[profilStyles.helpSection, { backgroundColor: theme.colors.surface }, theme.shadows]}>
                <Pressable 
                    style={profilStyles.helpHeader}
                    onPress={() => setShowInfo(!showInfo)}
                >
                    <View style={profilStyles.helpIconContainer}>
                        <FontAwesome name="lightbulb-o" size={20} color="#FFD700" />
                    </View>
                    <Text style={[profilStyles.helpTitle, { color: theme.colors.primary }]}>
                        Besoin d'aide ?
                    </Text>
                    <FontAwesome 
                        name={showInfo ? "chevron-up" : "chevron-down"} 
                        size={16} 
                        color={theme.colors.secondary} 
                    />
                </Pressable>

                {showInfo && (
                    <View style={[profilStyles.helpContent, { backgroundColor: theme.colors.background }]}>
                        <View style={profilStyles.helpItem}>
                            <View style={profilStyles.helpTextContainer}>
                                <Text style={[profilStyles.helpItemTitle, { color: theme.colors.primary }]}>
                                    Pourquoi est-ce nécessaire de fournir des informations médicales et physiques ?
                                </Text>
                                <Text style={[profilStyles.helpItemText, { color: theme.colors.secondary }]}>
                                    L'IA a besoin de ces informations pour personnaliser votre expérience et vous fournir des recommandations adaptées.
                                    Plus les informations sont précises et nombreuses, meilleures seront les suggestions.
                                </Text>
                            </View>
                        </View>
                        <View style={[profilStyles.helpNote, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <FontAwesome name="shield" size={16} color={theme.colors.success} />
                            <Text style={[profilStyles.helpNoteText, { color: theme.colors.secondary }]}>
                                Données anonymes utilisées uniquement à des fins académiques
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* BOUTON DÉCONNEXION MODERNISÉ */}
            <View style={profilStyles.logoutSection}>
                <Pressable 
                    style={[profilStyles.logoutButton, { backgroundColor: theme.colors.error }]} 
                    onPress={handleLogout}
                >
                    <FontAwesome name="sign-out" size={18} color="white" />
                    <Text style={profilStyles.logoutText}>Se déconnecter</Text>
                </Pressable>
            </View>

            {/* MODALS */}
            <AnamneseModal
                visible={anamneseModalVisible}
                onClose={() => setAnamneseModalVisible(false)}
                userId={currentUserId}
            />
            
            <EvaluationInitialeModal
                visible={evaluationModalVisible}
                onClose={() => setEvaluationModalVisible(false)}
                userId={currentUserId}
            />

            {/* NOUVEAU MODAL PARAMÈTRES */}
            <UserSettingsModal
                visible={settingsModalVisible}
                onClose={() => setSettingsModalVisible(false)}
                userId={currentUserId}
            />

            {/* ESPACE EN BAS */}
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}