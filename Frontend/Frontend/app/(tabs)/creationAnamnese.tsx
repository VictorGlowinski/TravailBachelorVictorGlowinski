// app/(tabs)/creationAnamnese.tsx - VERSION COMPLÈTE AVEC AUTHENTIFICATION

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import anamneseStyles from "@/styles/screens/AnamneseStyles";
import { useTheme } from '@/styles/screens/ThemeStyle';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/utils/apiHelper'; // ✅ UTILISER les helpers authentifiés

// ✅ CHAMPS REQUIS (sans age car calculé automatiquement)
const REQUIRED_KEYS = ["sexe", "poids_kg", "taille_cm", "etat_actuel"];

export default function CreationAnamneseScreen() {
  const theme = useTheme();
  const { user, isAuthenticated, token } = useAuth(); // ✅ UTILISER le contexte d'auth
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userBirthDate, setUserBirthDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // ✅ FORM DATA sans age (calculé automatiquement)
  const [formData, setFormData] = useState({
    blessures: "",
    etat_actuel: "",
    sexe: "",
    poids_kg: "",
    taille_cm: "",
    imc: "",
    contrainte_pro: "",
    contrainte_fam: "",
    exp_sportive: "",
    commentaire: "",
    traitement: "",
    diagnostics: "",
  });

  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  const draftKey = useMemo(() => 
    currentUserId ? `anamnese_draft_${currentUserId}` : null, 
    [currentUserId]
  );

  // ✅ CALCUL AUTOMATIQUE DE L'ÂGE
  const calculatedAge = useMemo(() => {
    if (!userBirthDate) return null;
    
    try {
      const birthDate = new Date(userBirthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Erreur calcul âge:', error);
      return null;
    }
  }, [userBirthDate]);

  // ✅ CALCUL des champs remplis (incluant l'âge calculé)
  const filledCount = useMemo(() => {
    const baseCount = Object.values(formData).filter(value => value.trim() !== "").length;
    return calculatedAge ? baseCount + 1 : baseCount;
  }, [formData, calculatedAge]);

  // ✅ VALIDATION des champs requis + âge calculé
  const isValid = useMemo(() => {
    return REQUIRED_KEYS.every(key => formData[key as keyof typeof formData]?.trim() !== "") && calculatedAge;
  }, [formData, calculatedAge]);

  // ✅ VÉRIFICATION d'authentification au chargement
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        "Non authentifié", 
        "Vous devez être connecté pour créer une anamnèse",
        [
          { 
            text: "Se connecter", 
            onPress: () => router.replace('/(auth)/login') 
          }
        ]
      );
      return;
    }

    // ✅ UTILISER l'utilisateur du contexte d'auth
    if (user) {
      setCurrentUserId(user.id.toString());
      console.log('👤 Utilisateur authentifié:', user.email);
    }
  }, [isAuthenticated, user]);

  // ✅ GESTION du clavier
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  // ✅ RÉCUPÉRER la date de naissance avec authentification
  useEffect(() => {
    const getUserData = async () => {
      if (!currentUserId || !isAuthenticated) return;
      
      try {
        console.log('📡 Récupération données utilisateur...');
        
        // ✅ UTILISER apiGet qui gère l'authentification automatiquement
        const userData = await apiGet(`/users/${currentUserId}`);
        console.log('👤 Données utilisateur reçues:', userData);
        
        // ✅ ADAPTER selon la structure de votre réponse API
        const birthDate = userData.user?.use_date_naissance || 
                         userData.use_date_naissance || 
                         userData.date_naissance;
                         
        if (birthDate) {
          setUserBirthDate(birthDate);
          console.log('📅 Date de naissance récupérée:', birthDate);
        } else {
          console.warn('⚠️ Aucune date de naissance trouvée');
          Alert.alert(
            "Date de naissance manquante",
            "Votre date de naissance n'est pas renseignée dans votre profil. Cela est nécessaire pour calculer votre âge.",
            [{ text: "OK" }]
          );
        }
        
        // ✅ CHARGER le brouillon après avoir récupéré les données utilisateur
        loadDraft();
        
      } catch (error) {
        console.error("❌ Erreur récupération données utilisateur:", error);
        
        // ✅ GESTION D'ERREURS SPÉCIFIQUE
        if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string' && (error as any).message.includes('Session expirée')) {
          Alert.alert(
            'Session expirée', 
            'Veuillez vous reconnecter',
            [
              { 
                text: "Se reconnecter", 
                onPress: () => router.replace('/(auth)/login') 
              }
            ]
          );
        } else {
          Alert.alert("Erreur", "Impossible de récupérer vos données utilisateur");
        }
      }
    };

    if (currentUserId && isAuthenticated) {
      getUserData();
    }
  }, [currentUserId, isAuthenticated]);

  // ✅ CHARGER le brouillon quand l'utilisateur est défini
  useEffect(() => {
    if (currentUserId && draftKey) {
      loadDraft();
    }
  }, [currentUserId, draftKey]);

  // ✅ SAUVEGARDER automatiquement le brouillon
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData, draftKey]);

  // ✅ CALCULER l'IMC
  const calculateBMI = () => {
    const poids = parseFloat(formData.poids_kg.replace(',', '.'));
    const taille = parseFloat(formData.taille_cm.replace(',', '.')) / 100;
    
    if (poids && taille) {
      const bmi = poids / (taille * taille);
      return bmi.toFixed(1);
    }
    return "";
  };

  // ✅ MISE À JOUR automatique de l'IMC
  useEffect(() => {
    const newIMC = calculateBMI();
    if (newIMC !== formData.imc) {
      setFormData(prev => ({ ...prev, imc: newIMC }));
    }
  }, [formData.poids_kg, formData.taille_cm]);

  // ✅ CHARGER le brouillon sauvegardé
  const loadDraft = async () => {
    if (!draftKey) return;
    
    try {
      const savedDraft = await AsyncStorage.getItem(draftKey);
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsedDraft }));
        console.log('📝 Brouillon anamnèse chargé');
      }
    } catch (error) {
      console.error('Erreur chargement brouillon:', error);
    }
  };

  // ✅ SAUVEGARDER le brouillon
  const saveDraft = async () => {
    if (!draftKey) return;
    
    try {
      await AsyncStorage.setItem(draftKey, JSON.stringify(formData));
    } catch (error) {
      console.error('Erreur sauvegarde brouillon:', error);
    }
  };

  // ✅ FONCTIONS de navigation entre les champs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const focusNextInput = (nextKey: string) => {
    const nextInput = inputRefs.current[nextKey];
    if (nextInput) {
      nextInput.focus();
    }
  };

  // ✅ HANDLE SUBMIT avec authentification
  const handleSubmit = async () => {
    // ✅ VÉRIFICATIONS préliminaires
    if (!isAuthenticated) {
      Alert.alert("Non authentifié", "Vous devez être connecté pour créer une anamnèse");
      return;
    }

    if (!isValid) {
      Alert.alert("Champs requis", "Veuillez compléter les champs obligatoires.");
      return;
    }

    if (!currentUserId) {
      Alert.alert("Erreur", "Utilisateur non identifié");
      return;
    }

    if (!calculatedAge) {
      Alert.alert(
        "Erreur", 
        "Impossible de calculer votre âge. Veuillez vérifier votre date de naissance dans votre profil."
      );
      return;
    }

    setIsLoading(true);
    try {
      const anamneseData = {
        ana_user_id: parseInt(currentUserId, 10),
        ana_age: calculatedAge, // ✅ ÂGE CALCULÉ AUTOMATIQUEMENT
        ana_imc: calculateBMI(),
        ana_blessures: formData.blessures,
        ana_etat_actuel: formData.etat_actuel,
        ana_sexe: formData.sexe,
        ana_poids_kg: parseFloat(formData.poids_kg.replace(',', '.')) || 0,
        ana_taille_cm: parseFloat(formData.taille_cm.replace(',', '.')) || 0,
        ana_contrainte_pro: formData.contrainte_pro,
        ana_contrainte_fam: formData.contrainte_fam,
        ana_exp_sportive: formData.exp_sportive,
        ana_commentaire: formData.commentaire,
        ana_traitement: formData.traitement,
        ana_diagnostics: formData.diagnostics
      };

      console.log('📤 Envoi anamnèse avec âge calculé:', calculatedAge);

      // ✅ UTILISER apiPost qui gère l'authentification automatiquement
      const result = await apiPost('/anamnese', anamneseData);
      console.log('✅ Anamnèse créée:', result);

      // ✅ VÉRIFIER le succès selon votre structure API
      if (result.success || result.anamnese || result.id) {
        // ✅ SUPPRIMER le brouillon en cas de succès
        if (draftKey) {
          await AsyncStorage.removeItem(draftKey);
        }
        
        Alert.alert(
          "Succès", 
          "Anamnèse créée avec succès !",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        throw new Error(result.message || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("❌ Erreur création anamnèse:", error);
      
      // ✅ GESTION D'ERREURS PLUS PRÉCISE
      let errorMessage = "Impossible de créer l'anamnèse. Veuillez réessayer.";
      let errorMsg: string | undefined = undefined;
      if (error instanceof Error) {
        errorMsg = error.message;
      }

      if (errorMsg?.includes('Session expirée')) {
        errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        Alert.alert(
          "Session expirée", 
          errorMessage,
          [
            { 
              text: "Se reconnecter", 
              onPress: () => router.replace('/(auth)/login') 
            }
          ]
        );
        return;
      } else if (errorMsg?.includes('validation')) {
        errorMessage = "Données invalides. Vérifiez vos informations.";
      } else if (errorMsg?.includes('403')) {
        errorMessage = "Vous n'avez pas l'autorisation de créer une anamnèse.";
      }
      
      Alert.alert("Erreur", errorMessage);
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
          Vous devez être connecté pour créer une anamnèse
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
      style={[anamneseStyles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={anamneseStyles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ✅ HEADER avec état de connexion */}
      <View style={[anamneseStyles.header, { backgroundColor: theme.colors.surface }, theme.shadows]}>
        <View style={anamneseStyles.headerContent}>
          <Pressable
            onPress={() => router.replace('/(tabs)/profil')}
            style={[anamneseStyles.backButton, { backgroundColor: theme.colors.accent }]}
          >
            <FontAwesome name="arrow-left" size={20} color="white" />
          </Pressable>

          <View style={anamneseStyles.titleContainer}>
            <Text style={[anamneseStyles.mainTitle, { color: theme.colors.primary }]}>
              Anamnèse
            </Text>
            <Text style={[anamneseStyles.subtitle, { color: theme.colors.secondary }]}>
              Informations personnelles et médicales
            </Text>
            {/* ✅ AFFICHER l'utilisateur connecté */}
            {user && (
              <Text style={[anamneseStyles.subtitle, { color: theme.colors.accent, fontSize: 12 }]}>
                {user.email}
              </Text>
            )}
          </View>

          {isKeyboardVisible && (
            <Pressable
              onPress={dismissKeyboard}
              style={[anamneseStyles.keyboardButton, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              <FontAwesome name="keyboard-o" size={16} color={theme.colors.accent} />
            </Pressable>
          )}
        </View>

        {/* ✅ BARRE DE PROGRESSION (13 champs) */}
        <View style={anamneseStyles.progressSection}>
          <View style={[anamneseStyles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View 
              style={[
                anamneseStyles.progressFill, 
                { 
                  width: `${(filledCount / 13) * 100}%`,
                  backgroundColor: theme.colors.accent
                }
              ]} 
            />
          </View>
          <Text style={[anamneseStyles.progressText, { color: theme.colors.secondary }]}>
            {filledCount}/13 champs complétés
            {calculatedAge && ` • Âge: ${calculatedAge} ans`}
          </Text>
        </View>
      </View>

      {/* ✅ LOADING STATE */}
      {isLoading && (
        <View style={[anamneseStyles.loadingCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[anamneseStyles.loadingText, { color: theme.colors.secondary }]}>
            Création de votre anamnèse...
          </Text>
        </View>
      )}

      {/* ✅ FORMULAIRE MODERNISÉ */}
      <View style={anamneseStyles.formSection}>
        
        {/* ✅ INFORMATIONS PERSONNELLES */}
        <View style={[anamneseStyles.fieldCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
          <Text style={[anamneseStyles.fieldTitle, { color: theme.colors.primary }]}>
            Informations personnelles
          </Text>
          <Text style={[anamneseStyles.fieldDescription, { color: theme.colors.secondary }]}>
            Données de base nécessaires pour votre profil
          </Text>
          
          {/* Sexe */}
          <View style={anamneseStyles.inputGroup}>
            <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
              Sexe <Text style={[anamneseStyles.required, { color: theme.colors.error }]}>*</Text>
            </Text>
            <View style={anamneseStyles.chipsContainer}>
              {["Masculin", "Féminin", "Autre"].map((option) => {
                const selected = formData.sexe === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setFormData(prev => ({ 
                      ...prev, 
                      sexe: formData.sexe === option ? "" : option 
                    }))}
                    style={[
                      anamneseStyles.chip,
                      { 
                        backgroundColor: selected ? theme.colors.accent : theme.colors.surfaceVariant,
                        borderColor: selected ? theme.colors.accent : theme.colors.border
                      }
                    ]}
                  >
                    <Text style={[
                      anamneseStyles.chipText,
                      { color: selected ? 'white' : theme.colors.primary }
                    ]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ✅ ALERTE si pas de date de naissance */}
          {!userBirthDate && (
            <View style={[
              anamneseStyles.warningContainer, 
              { 
                backgroundColor: theme.colors.warning + '20', 
                borderColor: theme.colors.warning 
              }
            ]}>
              <FontAwesome name="exclamation-triangle" size={16} color={theme.colors.warning} />
              <Text style={[anamneseStyles.warningText, { color: theme.colors.warning }]}>
                Date de naissance manquante dans votre profil. L'âge ne peut pas être calculé.
              </Text>
            </View>
          )}
          
          {/* Poids et Taille */}
          <View style={anamneseStyles.row}>
            <View style={[anamneseStyles.inputContainer, { marginRight: 10 }]}>
              <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
                Poids (kg) <Text style={[anamneseStyles.required, { color: theme.colors.error }]}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => { inputRefs.current["poids_kg"] = ref; }}
                style={[
                  anamneseStyles.input, 
                  { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.primary,
                    borderColor: theme.colors.border
                  }
                ]}
                value={formData.poids_kg}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  poids_kg: text.replace(/[^\d.,]/g, "") 
                }))}
                placeholder="Ex: 70.5"
                placeholderTextColor="#666666"
                keyboardType="decimal-pad"
                onSubmitEditing={() => focusNextInput("taille_cm")}
              />
            </View>
            
            <View style={anamneseStyles.inputContainer}>
              <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
                Taille (cm) <Text style={[anamneseStyles.required, { color: theme.colors.error }]}>*</Text>
              </Text>
              <TextInput
                ref={(ref) => { inputRefs.current["taille_cm"] = ref; }}
                style={[
                  anamneseStyles.input, 
                  { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.primary,
                    borderColor: theme.colors.border
                  }
                ]}
                value={formData.taille_cm}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  taille_cm: text.replace(/[^\d.,]/g, "") 
                }))}
                placeholder="Ex: 175"
                placeholderTextColor="#666666"
                keyboardType="decimal-pad"
                onSubmitEditing={() => focusNextInput("diagnostics")}
              />
            </View>
          </View>

          {/* IMC */}
          {formData.imc && (
            <View style={[
              anamneseStyles.imcContainer, 
              { 
                backgroundColor: parseFloat(formData.imc) < 18.5 ? '#e3f2fd' :
                               parseFloat(formData.imc) < 25 ? '#e8f5e8' :
                               parseFloat(formData.imc) < 30 ? '#fff3e0' : '#ffebee'
              }
            ]}>
              <Text style={[anamneseStyles.imcText, { color: theme.colors.primary }]}>
                IMC calculé: {formData.imc}
              </Text>
              <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                {parseFloat(formData.imc) < 18.5 ? 'Insuffisance pondérale' :
                 parseFloat(formData.imc) < 25 ? 'Poids normal' :
                 parseFloat(formData.imc) < 30 ? 'Surpoids' : 'Obésité'}
              </Text>
            </View>
          )}
        </View>

        {/* ✅ INFORMATIONS MÉDICALES */}
        <View style={[anamneseStyles.fieldCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
          <Text style={[anamneseStyles.fieldTitle, { color: theme.colors.primary }]}>
            Informations médicales
          </Text>

          {/* Antécédents médicaux */}
          <View style={anamneseStyles.inputContainer}>
            <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
              Antécédents médicaux et/ou diagnostics
            </Text>
            <Text style={[anamneseStyles.helperText, { color: theme.colors.secondary }]}>
              Maladies, opérations, diagnostics médicaux importants
            </Text>
            <TextInput
              ref={(ref) => { inputRefs.current["diagnostics"] = ref; }}
              style={[
                anamneseStyles.input,
                { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.primary,
                  borderColor: theme.colors.border,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }
              ]}
              value={formData.diagnostics}
              onChangeText={(text) => setFormData({ ...formData, diagnostics: text })}
              placeholder="Ex: diabète, scoliose, opération, etc."
              placeholderTextColor="#666666"
              multiline
              numberOfLines={3}
              onSubmitEditing={() => focusNextInput("blessures")}
              blurOnSubmit={false}
            />
          </View>

          {/* Blessures actuelles */}
          <View style={anamneseStyles.inputContainer}>
            <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
              Blessures actuelles
            </Text>
            <Text style={[anamneseStyles.helperText, { color: theme.colors.secondary }]}>
              Douleurs, blessures en cours, limitations physiques
            </Text>
            <TextInput
              ref={(ref) => { inputRefs.current["blessures"] = ref; }}
              style={[
                anamneseStyles.input,
                { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.primary,
                  borderColor: theme.colors.border,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }
              ]}
              value={formData.blessures}
              onChangeText={(text) => setFormData({ ...formData, blessures: text })}
              placeholder="Ex: entorse, fracture, tendinite, etc."
              placeholderTextColor="#666666"
              multiline
              numberOfLines={3}
              onSubmitEditing={() => focusNextInput("traitement")}
              blurOnSubmit={false}
            />
          </View>

          {/* Traitements en cours */}
          <View style={anamneseStyles.inputContainer}>
            <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
              Traitements en cours
            </Text>
            <Text style={[anamneseStyles.helperText, { color: theme.colors.secondary }]}>
              Médicaments, thérapies en cours
            </Text>
            <TextInput
              ref={(ref) => { inputRefs.current["traitement"] = ref; }}
              style={[
                anamneseStyles.input,
                { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.primary,
                  borderColor: theme.colors.border,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }
              ]}
              value={formData.traitement}
              onChangeText={(text) => setFormData({ ...formData, traitement: text })}
              placeholder="Ex: anti-inflammatoires, physiothérapie, etc."
              placeholderTextColor="#666666"
              multiline
              numberOfLines={3}
              onSubmitEditing={() => focusNextInput("exp_sportive")}
              blurOnSubmit={false}
            />
          </View>
        </View>

        {/* ✅ ACTIVITÉ SPORTIVE */}
        <View style={[anamneseStyles.fieldCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
          <Text style={[anamneseStyles.fieldTitle, { color: theme.colors.primary }]}>
            Activité sportive
          </Text>

          {/* Expérience sportive */}
          <View style={anamneseStyles.inputContainer}>
            <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
              Expérience sportive
            </Text>
            <Text style={[anamneseStyles.helperText, { color: theme.colors.secondary }]}>
              Sports pratiqués (passés ou actuels), niveau, fréquence d'entraînement
            </Text>
            <TextInput
              ref={(ref) => { inputRefs.current["exp_sportive"] = ref; }}
              style={[
                anamneseStyles.input,
                { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.primary,
                  borderColor: theme.colors.border,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }
              ]}
              value={formData.exp_sportive}
              onChangeText={(text) => setFormData({ ...formData, exp_sportive: text })}
              placeholder="Ex: Course à pied en amateur depuis 1 an à environ 3 sorties par semaine"
              placeholderTextColor="#666666"
              multiline
              numberOfLines={3}
              onSubmitEditing={() => focusNextInput("etat_actuel")}
              blurOnSubmit={false}
            />
          </View>

          {/* État actuel */}
          <View style={anamneseStyles.inputContainer}>
            <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
              État actuel <Text style={[anamneseStyles.required, { color: theme.colors.error }]}>*</Text>
            </Text>
            <Text style={[anamneseStyles.helperText, { color: theme.colors.secondary }]}>
              Santé globale, niveau de fatigue, stress, forme physique actuelle
            </Text>
            <TextInput
              ref={(ref) => { inputRefs.current["etat_actuel"] = ref; }}
              style={[
                anamneseStyles.input,
                { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.primary,
                  borderColor: theme.colors.border,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }
              ]}
              value={formData.etat_actuel}
              onChangeText={(text) => setFormData({ ...formData, etat_actuel: text })}
              placeholder="Comment vous sentez-vous actuellement ?"
              placeholderTextColor="#666666"
              multiline
              numberOfLines={3}
              onSubmitEditing={() => focusNextInput("contrainte_pro")}
              blurOnSubmit={false}
            />
          </View>
        </View>

        {/* ✅ CONTRAINTES */}
        <View style={[anamneseStyles.fieldCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
          <Text style={[anamneseStyles.fieldTitle, { color: theme.colors.primary }]}>
            Contraintes et commentaires
          </Text>
          <Text style={[anamneseStyles.fieldDescription, { color: theme.colors.secondary }]}>
            Facteurs pouvant influencer votre entraînement
          </Text>
          
          {/* Contraintes professionnelles */}
          <View style={anamneseStyles.inputContainer}>
            <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
              Contraintes professionnelles
            </Text>
            <TextInput
              ref={(ref) => { inputRefs.current["contrainte_pro"] = ref; }}
              style={[
                anamneseStyles.input,
                { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.primary,
                  borderColor: theme.colors.border,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }
              ]}
              value={formData.contrainte_pro}
              onChangeText={(text) => setFormData({ ...formData, contrainte_pro: text })}
              placeholder="Horaires, stress, voyages, sédentarité..."
              placeholderTextColor="#666666"
              multiline
              numberOfLines={3}
              onSubmitEditing={() => focusNextInput("contrainte_fam")}
              blurOnSubmit={false}
            />
          </View>

          {/* Contraintes familiales */}
          <View style={anamneseStyles.inputContainer}>
            <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
              Contraintes familiales
            </Text>
            <TextInput
              ref={(ref) => { inputRefs.current["contrainte_fam"] = ref; }}
              style={[
                anamneseStyles.input,
                { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.primary,
                  borderColor: theme.colors.border,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }
              ]}
              value={formData.contrainte_fam}
              onChangeText={(text) => setFormData({ ...formData, contrainte_fam: text })}
              placeholder="Temps disponible, garde d'enfants, obligations familiales..."
              placeholderTextColor="#666666"
              multiline
              numberOfLines={3}
              onSubmitEditing={() => focusNextInput("commentaire")}
              blurOnSubmit={false}
            />
          </View>

          {/* Commentaire libre */}
          <View style={anamneseStyles.inputContainer}>
            <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
              Commentaire libre
            </Text>
            <TextInput
              ref={(ref) => { inputRefs.current["commentaire"] = ref; }}
              style={[
                anamneseStyles.input,
                { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.primary,
                  borderColor: theme.colors.border,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }
              ]}
              value={formData.commentaire}
              onChangeText={(text) => setFormData({ ...formData, commentaire: text })}
              placeholder="Autres informations importantes..."
              placeholderTextColor="#666666"
              multiline
              numberOfLines={3}
              blurOnSubmit={false}
            />
          </View>
        </View>
      </View>

      {/* ✅ BOUTONS D'ACTION */}
      <View style={anamneseStyles.actionsSection}>
        <Pressable
          style={[
            anamneseStyles.submitButton,
            { 
              backgroundColor: isValid ? theme.colors.accent : theme.colors.disabled,
              opacity: (!isValid || isLoading) ? 0.6 : 1
            }
          ]}
          onPress={handleSubmit}
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <FontAwesome name="check" size={18} color="white" />
              <Text style={anamneseStyles.submitButtonText}>
                Créer l'anamnèse
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[
            anamneseStyles.cancelButton, 
            { 
              backgroundColor: 'transparent', 
              borderColor: theme.colors.error 
            }
          ]}
          onPress={() => router.replace('/(tabs)/profil')}
        >
          <FontAwesome name="times" size={18} color={theme.colors.error} />
          <Text style={[anamneseStyles.cancelButtonText, { color: theme.colors.error }]}>
            Annuler
          </Text>
        </Pressable>
      </View>

      {/* ✅ ESPACE EN BAS pour éviter que le contenu soit coupé */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}