// app/(tabs)/profil.tsx
import { Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, View } from 'react-native'; // ✅ Composants natifs pour le thème
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profilStyles from '@/styles/screens/ProfilStyles'; // ✅ Import direct
import { useTheme } from '@/styles/screens/ThemeStyle'; // ✅ Import du thème
import { router } from 'expo-router';
import AnamneseModal from '@/components/AnamneseModal'; 
import EvaluationInitialeModal from '@/components/EvaluationInitialeModal';

// Interface pour les données
interface UserData {
    hasAnamnese: boolean;
    hasEvaluation: boolean;
    anamneseData?: any;
    evaluationData?: any;
}

const API_BASE_URL = "http://192.168.0.112:8000/api";

export default function ProfilScreen() {
    const theme = useTheme(); // ✅ Hook de thème
    const [userData, setUserData] = useState<UserData>({
        hasAnamnese: false,
        hasEvaluation: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showInfo, setShowInfo] = useState(false);
    const { user, logout } = useAuth();
    const [anamneseModalVisible, setAnamneseModalVisible] = useState(false);
    const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const openAnamneseModal = () => {
    setAnamneseModalVisible(true);
    };

    const openEvaluationModal = () => {
        setEvaluationModalVisible(true);
    };

    useEffect(() => {
    const getUserId = async () => {
        const userId = await AsyncStorage.getItem('userId');
        setCurrentUserId(userId);
    };
        getUserId();
    }, []);
    // app/(tabs)/profil.tsx - REMPLACER la fonction checkUserData
    const checkUserData = async () => {
        if (!user?.id) { setIsLoading(false); return; }

        setIsLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                setUserData({ hasAnamnese: false, hasEvaluation: false, anamneseData: null, evaluationData: null });
                return;
            }

            const fetchData = async (endpoint: string, idField: string) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/${endpoint}/user/${userId}`);
                    if (response.status === 200) {
                        const data = await response.json();
                        const item = Array.isArray(data) ? data[0] : data?.anamnese?.[0] || data?.anamnese || data;
                        return item?.[idField] ? { hasData: true, data: item } : { hasData: false, data: null };
                    }
                } catch (error) { console.log(`Erreur ${endpoint}:`, error); }
                return { hasData: false, data: null };
            };

            const [anamneseResult, evaluationResult] = await Promise.all([
                fetchData('anamnese', 'ana_id'),
                fetchData('evaluation-initiale', 'eva_id')
            ]);

            setUserData({
                hasAnamnese: anamneseResult.hasData,
                hasEvaluation: evaluationResult.hasData,
                anamneseData: anamneseResult.data,
                evaluationData: evaluationResult.data
            });

        } catch (error) {
            console.error('Erreur:', error);
            setUserData({ hasAnamnese: false, hasEvaluation: false, anamneseData: null, evaluationData: null });
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Vérifier au chargement du composant
    useEffect(() => {
        checkUserData();
    }, [user?.id]);

    // ✅ Rafraîchir périodiquement
    useEffect(() => {
        if (!user?.id) return;

        const interval = setInterval(() => {
            console.log('🔄 Auto-refresh des données utilisateur');
            checkUserData();
        }, 30000); // Refresh toutes les 30 secondes

        return () => clearInterval(interval);
    }, [user?.id]);

    const handleLogout = async () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Déconnecter', 
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    
    // ✅ AMÉLIORÉ : Fonction pour voir les données existantes
    const viewExistingData = (type: 'anamnese' | 'evaluation') => {
    const data = type === 'anamnese' ? userData.anamneseData : userData.evaluationData;
    const title = type === 'anamnese' ? 'Anamnèse existante' : 'Évaluation existante';
    
    Alert.alert(
        title,
        `Vous avez déjà une ${type} enregistrée.\n\nVoulez-vous la consulter ou la modifier ?`,
        [
            { text: 'Annuler', style: 'cancel' },
            { 
                text: 'Consulter', 
                onPress: () => {
                    console.log(`📖 Consulter ${type}:`, data);
                    // ✅ Navigation en mode consultation
                    if (type === 'anamnese') {
                        router.push('/(tabs)/creationAnamnese?mode=view');
                    } else {
                        router.push('/(tabs)/creationEvaluationInitiale');
                    }
                }
            },
            { 
                text: 'Modifier', 
                onPress: () => {
                    console.log(`✏️ Modifier ${type}`);
                    // ✅ Navigation directe en mode édition
                    if (type === 'anamnese') {
                        router.push('/(tabs)/creationAnamnese?mode=edit');
                    } else {
                        router.push('/(tabs)/creationEvaluationInitiale');
                    }
                }
            }
        ]
    );
};

    return (
        <ScrollView 
            style={[profilStyles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={profilStyles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* ✅ HEADER MODERNISÉ */}
            <View style={[profilStyles.header, { backgroundColor: theme.colors.surface }, theme.shadows]}>
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
                        
                        {/* ✅ BADGES DE PROGRESSION */}
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

            {/* ✅ LOADING STATE AMÉLIORÉ */}
            {isLoading && (
                <View style={[profilStyles.loadingCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
                    <ActivityIndicator size="large" color={theme.colors.accent} />
                    <Text style={[profilStyles.loadingText, { color: theme.colors.secondary }]}>
                        Vérification de vos données...
                    </Text>
                </View>
            )}

            {/* ✅ SECTION ACTIONS MODERNISÉE */}
            {!isLoading && (
                <View style={profilStyles.actionsSection}>
                    <Text style={[profilStyles.sectionTitle, { color: theme.colors.primary }]}>
                        Mes données
                    </Text>
                    
                    <View style={profilStyles.cardsContainer}>
                        {/* ✅ CARTE ANAMNÈSE MODERNISÉE */}
                        {!userData.hasAnamnese ? (
                            <Link href="/(tabs)/creationAnamnese" asChild>
                                <Pressable style={[
                                    profilStyles.actionCard, 
                                    { backgroundColor: theme.colors.surface },
                                    theme.shadows
                                ]}>
                                    {({ pressed }) => (
                                        <View style={[profilStyles.cardContent, { opacity: pressed ? 0.8 : 1 }]}>
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
                                    )}
                                </Pressable>
                            </Link>
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

                        {/* ✅ CARTE ÉVALUATION MODERNISÉE */}
                        {!userData.hasEvaluation ? (
                            <Link href="/(tabs)/creationEvaluationInitiale" asChild>
                                <Pressable style={[
                                    profilStyles.actionCard, 
                                    { backgroundColor: theme.colors.surface },
                                    theme.shadows
                                ]}>
                                    {({ pressed }) => (
                                        <View style={[profilStyles.cardContent, { opacity: pressed ? 0.8 : 1 }]}>
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
                                    )}
                                </Pressable>
                            </Link>
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

                    {/* ✅ BOUTON REFRESH MODERNISÉ */}
                    <Pressable 
                        style={[profilStyles.refreshButton, { backgroundColor: theme.colors.surfaceVariant }]} 
                        onPress={checkUserData}
                    >
                        <FontAwesome name="refresh" size={16} color={theme.colors.accent} />
                        <Text style={[profilStyles.refreshText, { color: theme.colors.accent }]}>
                            Actualiser mes données
                        </Text>
                    </Pressable>
                </View>
            )}

            {/* ✅ SECTION AIDE MODERNISÉE */}
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
                            <View style={[profilStyles.helpBullet, { backgroundColor: '#4A90E2' }]}>
                                <Text style={profilStyles.helpBulletText}>1</Text>
                            </View>
                            <View style={profilStyles.helpTextContainer}>
                                <Text style={[profilStyles.helpItemTitle, { color: theme.colors.primary }]}>
                                    Anamnèse
                                </Text>
                                <Text style={[profilStyles.helpItemText, { color: theme.colors.secondary }]}>
                                    Historique médical, blessures, habitudes de vie
                                </Text>
                            </View>
                        </View>

                        <View style={profilStyles.helpItem}>
                            <View style={[profilStyles.helpBullet, { backgroundColor: '#E74C3C' }]}>
                                <Text style={profilStyles.helpBulletText}>2</Text>
                            </View>
                            <View style={profilStyles.helpTextContainer}>
                                <Text style={[profilStyles.helpItemTitle, { color: theme.colors.primary }]}>
                                    Évaluation physique
                                </Text>
                                <Text style={[profilStyles.helpItemText, { color: theme.colors.secondary }]}>
                                    Tests physiques, objectifs, échéances
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

            {/* ✅ BOUTON DÉCONNEXION MODERNISÉ */}
            <View style={profilStyles.logoutSection}>
                <Pressable 
                    style={[profilStyles.logoutButton, { backgroundColor: theme.colors.error }]} 
                    onPress={handleLogout}
                >
                    <FontAwesome name="sign-out" size={18} color="white" />
                    <Text style={profilStyles.logoutText}>Se déconnecter</Text>
                </Pressable>
            </View>

            {/* ✅ MODALS */}
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
        </ScrollView>
    );
}