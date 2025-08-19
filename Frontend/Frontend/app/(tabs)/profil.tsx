// app/(tabs)/profil.tsx
import { Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profilStyles } from '@/styles';
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

    // app/(tabs)/profil.tsx - RETURN CORRIGÉ
return (
    <ScrollView 
        style={profilStyles.scrollView} 
        contentContainerStyle={profilStyles.container}
        showsVerticalScrollIndicator={false}
    >
        {/* Affichage des infos utilisateur */}
        {user && (
            <View style={profilStyles.userInfoContainer}>
                <Text style={profilStyles.userInfoTitle}>Bienvenue !</Text>
                <Text style={profilStyles.userInfoText}>{user.email}</Text>
                
                {/* Statut des données */}
                {!isLoading && (
                    <View style={profilStyles.statusContainer}>
                        
                    </View>
                )}
            </View>
        )}

        {/* Loading state */}
        {isLoading && (
            <View style={profilStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={profilStyles.loadingText}>Vérification de vos données...</Text>
            </View>
        )}

        {/* Section des boutons d'action */}
        {!isLoading && (
            <View style={profilStyles.buttonsContainer}>
                
                {/* ✅ LOGIQUE CONDITIONNELLE : Bouton Anamnèse */}
                {!userData.hasAnamnese ? (
                    // Afficher le bouton de création si pas d'anamnèse
                    <Link href="/(tabs)/creationAnamnese" asChild>
                        <Pressable style={[profilStyles.button, profilStyles.anamneseButton]}>
                            {({ pressed }) => (
                            <>
                                <FontAwesome 
                                    name="file-text-o" 
                                    size={24} 
                                    color="white"
                                    style={[profilStyles.buttonIcon, { opacity: pressed ? 0.7 : 1 }]}
                                />
                                <Text style={[profilStyles.buttonText, { opacity: pressed ? 0.7 : 1 }]}>
                                    Créer une anamnèse
                                </Text>
                                <Text style={[profilStyles.buttonSubtext, { opacity: pressed ? 0.7 : 1 }]}>
                                    Questionnaire sur votre état actuel
                                </Text>
                            </>
                            )}
                        </Pressable>
                    </Link>
                ) : (
                    // ✅ BOUTON UNIQUE pour anamnèse complétée
                    <Pressable 
                        style={[profilStyles.button, profilStyles.completedButton]} 
                        onPress={openAnamneseModal}
                    >
                        <FontAwesome 
                            name="check-circle" 
                            size={24} 
                            color="white" 
                            style={profilStyles.buttonIcon} 
                        />
                        <Text style={profilStyles.buttonText}>Anamnèse complétée</Text>
                        <Text style={profilStyles.buttonSubtext}>
                            Appuyez pour consulter ou modifier
                        </Text>
                    </Pressable>
                )}

                {/* ✅ LOGIQUE CONDITIONNELLE : Bouton Évaluation */}
                {!userData.hasEvaluation ? (
                    // Afficher le bouton de création si pas d'évaluation
                    <Link href="/(tabs)/creationEvaluationInitiale" asChild>
                        <Pressable style={[profilStyles.button, profilStyles.evaluationButton]}>
                            {({ pressed }) => (
                            <>
                                <FontAwesome 
                                    name="heartbeat" 
                                    size={24} 
                                    color="white"
                                    style={[profilStyles.buttonIcon, { opacity: pressed ? 0.7 : 1 }]}
                                />
                                <Text style={[profilStyles.buttonText, { opacity: pressed ? 0.7 : 1 }]}>
                                    Créer une évaluation physique
                                </Text>
                                <Text style={[profilStyles.buttonSubtext, { opacity: pressed ? 0.7 : 1 }]}>
                                    Tests de condition physique
                                </Text>
                            </>
                            )}
                        </Pressable>
                    </Link>
                ) : (
                    // ✅ BOUTON UNIQUE pour évaluation complétée
                    <Pressable 
                        style={[profilStyles.button, profilStyles.completedButton]} 
                        onPress={openEvaluationModal}
                    >
                        <FontAwesome 
                            name="check-circle" 
                            size={24} 
                            color="white" 
                            style={profilStyles.buttonIcon} 
                        />
                        <Text style={profilStyles.buttonText}>Évaluation complétée</Text>
                        <Text style={profilStyles.buttonSubtext}>
                            Appuyez pour consulter ou modifier
                        </Text>
                    </Pressable>
                )}

                {/* Bouton refresh manuel */}
                <Pressable style={profilStyles.refreshButton} onPress={checkUserData}>
                    <FontAwesome name="refresh" size={16} color="#007AFF" />
                    <Text style={profilStyles.refreshText}>Actualiser</Text>
                </Pressable>
            </View>
        )}

        {/* Bouton ampoule avec toggle du texte */}
        <View style={profilStyles.helpContainer}>
            <Pressable 
                style={profilStyles.helpButton}
                onPress={() => setShowInfo(!showInfo)}
            >
                {({ pressed }) => (
                    <FontAwesome 
                        name="lightbulb-o" 
                        size={24} 
                        color="#FFD700"
                        style={{ opacity: pressed ? 0.7 : 1 }}
                    />
                )}
            </Pressable>

            {/* Texte qui apparaît/disparaît */}
            {showInfo && (
                <View style={profilStyles.infoContainer}>
                    <Text style={profilStyles.infoText}>
                        💡 Complétez d'abord votre anamnèse, puis votre évaluation initiale 
                        pour générer des plans d'entraînement personnalisés.
                        {'\n\n'}
                        <Text style={profilStyles.boldText}>Anamnèse :</Text> Historique médical, blessures, habitudes
                        {'\n'}
                        <Text style={profilStyles.boldText}>Évaluation :</Text> Tests physiques, objectifs, échéances
                        {'\n\n'}
                        <Text style={profilStyles.boldText}>Pourquoi est-ce important ?</Text>
                        {'\n'}Ces informations permettent à l'IA de créer un programme adapté à votre profil !
                        {'\n\n'}Ces informations sont anonymes et ne sont utilisées qu'à des fins académiques.
                    </Text>
                </View>
            )}
        </View>

        {/* Bouton déconnexion */}
        <View style={profilStyles.logoutContainer}>
            <Pressable style={profilStyles.logoutButton} onPress={handleLogout}>
                <FontAwesome name="sign-out" size={20} color="white" style={profilStyles.logoutIcon} />
                <Text style={profilStyles.logoutButtonText}>Se déconnecter</Text>
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