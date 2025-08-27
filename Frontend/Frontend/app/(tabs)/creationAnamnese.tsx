// app/(tabs)/creationAnamnese.tsx - VERSION COMPLÈTE AVEC ÂGE CALCULÉ

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

const API_BASE_URL = "http://192.168.0.112:8000/api";

// ✅ RETIRER "age" des champs requis car il sera calculé automatiquement
const REQUIRED_KEYS = ["sexe", "poids_kg", "taille_cm", "etat_actuel"];

export default function CreationAnamneseScreen() {
  const theme = useTheme();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userBirthDate, setUserBirthDate] = useState<string | null>(null); // ✅ NOUVEAU
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // ✅ RETIRER "age" du formData car il sera calculé
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
      
      // Ajuster si l'anniversaire n'est pas encore passé cette année
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Erreur calcul âge:', error);
      return null;
    }
  }, [userBirthDate]);

  // ✅ Calcul du nombre de champs remplis (incluant l'âge calculé)
  const filledCount = useMemo(() => {
    const baseCount = Object.values(formData).filter(value => value.trim() !== "").length;
    // Ajouter 1 si l'âge est calculé
    return calculatedAge ? baseCount + 1 : baseCount;
  }, [formData, calculatedAge]);

  // ✅ Validation des champs requis
  const isValid = useMemo(() => {
    return REQUIRED_KEYS.every(key => formData[key as keyof typeof formData]?.trim() !== "") && calculatedAge;
  }, [formData, calculatedAge]);

  // Gestion du clavier
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

  // ✅ RÉCUPÉRER l'ID utilisateur ET sa date de naissance
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        setCurrentUserId(userId);
        
        if (userId) {
          // Récupérer la date de naissance depuis l'API
          const response = await fetch(`${API_BASE_URL}/users/${userId}`);
          if (response.ok) {
            const userData = await response.json();
            if (userData.user?.use_date_naissance) {
              setUserBirthDate(userData.user.use_date_naissance);
              console.log('📅 Date de naissance récupérée:', userData.user.use_date_naissance);
            } else {
              console.warn('⚠️ Aucune date de naissance trouvée pour cet utilisateur');
            }
          }
          loadDraft();
        }
      } catch (error) {
        console.error("Erreur récupération données utilisateur:", error);
      }
    };
    getUserData();
  }, []);

  // Charger le brouillon quand l'utilisateur est chargé
  useEffect(() => {
    if (currentUserId) {
      loadDraft();
    }
  }, [currentUserId, draftKey]);

  // Sauvegarder automatiquement le brouillon
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData, draftKey]);

  // Calculer l'IMC
  const calculateBMI = () => {
    const poids = parseFloat(formData.poids_kg.replace(',', '.'));
    const taille = parseFloat(formData.taille_cm.replace(',', '.')) / 100;
    
    if (poids && taille) {
      const bmi = poids / (taille * taille);
      return bmi.toFixed(1);
    }
    return "";
  };

  // Mise à jour automatique de l'IMC
  useEffect(() => {
    const newIMC = calculateBMI();
    if (newIMC !== formData.imc) {
      setFormData(prev => ({ ...prev, imc: newIMC }));
    }
  }, [formData.poids_kg, formData.taille_cm]);

  // Charger le brouillon sauvegardé
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

  // Sauvegarder le brouillon
  const saveDraft = async () => {
    if (!draftKey) return;
    
    try {
      await AsyncStorage.setItem(draftKey, JSON.stringify(formData));
    } catch (error) {
      console.error('Erreur sauvegarde brouillon:', error);
    }
  };

  // Fonctions de navigation entre les champs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const focusNextInput = (nextKey: string) => {
    const nextInput = inputRefs.current[nextKey];
    if (nextInput) {
      nextInput.focus();
    }
  };

  // ✅ MODIFIER le handleSubmit pour inclure l'âge calculé
  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert("Champs requis", "Veuillez compléter les champs obligatoires.");
      return;
    }
    if (!currentUserId) {
      Alert.alert("Erreur", "Utilisateur non identifié");
      return;
    }
    if (!calculatedAge) {
      Alert.alert("Erreur", "Impossible de calculer votre âge. Veuillez vérifier votre date de naissance dans votre profil.");
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
        ana_poids_kg: formData.poids_kg,
        ana_taille_cm: formData.taille_cm,
        ana_contrainte_pro: formData.contrainte_pro,
        ana_contrainte_fam: formData.contrainte_fam,
        ana_exp_sportive: formData.exp_sportive,
        ana_commentaire: formData.commentaire,
        ana_traitement: formData.traitement,
        ana_diagnostics: formData.diagnostics
      };

      console.log('📤 Envoi anamnèse avec âge calculé:', calculatedAge);

      const response = await fetch(`${API_BASE_URL}/anamnese`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(anamneseData),
      });

      if (response.ok) {
        // Supprimer le brouillon
        if (draftKey) await AsyncStorage.removeItem(draftKey);
        
        Alert.alert(
          "Succès", 
          "Anamnèse créée avec succès !",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur création anamnèse:", error);
      Alert.alert("Erreur", "Impossible de créer l'anamnèse. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[anamneseStyles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={anamneseStyles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ✅ HEADER MODERNISÉ */}
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

        {/* ✅ BARRE DE PROGRESSION MODERNE - 13 champs au lieu de 14 */}
        <View style={anamneseStyles.progressSection}>
          <View style={[anamneseStyles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View 
              style={[
                anamneseStyles.progressFill, 
                { 
                  width: `${(filledCount / 13) * 100}%`, // ✅ 13 au lieu de 14
                  backgroundColor: theme.colors.accent
                }
              ]} 
            />
          </View>
          <Text style={[anamneseStyles.progressText, { color: theme.colors.secondary }]}>
            {filledCount}/13 champs complétés
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
        {/* Informations personnelles */}
        // app/(tabs)/creationAnamnese.tsx - CORRIGER les zones de texte

{/* Informations personnelles */}
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

  {/* ✅ RETIRER COMPLÈTEMENT l'affichage de l'âge calculé */}
  
  {/* ✅ GARDER l'alerte si pas de date de naissance (mais sans mentionner l'âge) */}
  {!userBirthDate && (
    <View style={[anamneseStyles.warningContainer, { backgroundColor: theme.colors.warning + '20', borderColor: theme.colors.warning }]}>
      <FontAwesome name="exclamation-triangle" size={16} color={theme.colors.warning} />
      <Text style={[anamneseStyles.warningText, { color: theme.colors.warning }]}>
        Date de naissance manquante dans votre profil.
      </Text>
    </View>
  )}
  
  {/* Poids et Taille - GARDER le style existant */}
  <View style={anamneseStyles.row}>
    <View style={[anamneseStyles.inputContainer, { marginRight: 10 }]}>
      <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
        Poids (kg) <Text style={[anamneseStyles.required, { color: theme.colors.error }]}>*</Text>
      </Text>
      <TextInput
        ref={(ref) => {
          inputRefs.current["poids_kg"] = ref;
        }}
        style={[
          anamneseStyles.input, 
          { 
            backgroundColor: theme.colors.background,
            color: theme.colors.primary,
            borderColor: theme.colors.border
          }
        ]}
        value={formData.poids_kg}
        onChangeText={(text) => setFormData(prev => ({ ...prev, poids_kg: text.replace(/[^\d.,]/g, "") }))}
        placeholder="Poids"
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
        ref={(ref) => {
          inputRefs.current["taille_cm"] = ref;
        }}
        style={[
          anamneseStyles.input, 
          { 
            backgroundColor: theme.colors.background,
            color: theme.colors.primary,
            borderColor: theme.colors.border
          }
        ]}
        value={formData.taille_cm}
        onChangeText={(text) => setFormData(prev => ({ ...prev, taille_cm: text.replace(/[^\d.,]/g, "") }))}
        placeholder="Taille"
        placeholderTextColor="#666666"
        keyboardType="decimal-pad"
        onSubmitEditing={() => focusNextInput("diagnostics")}
      />
    </View>
  </View>

  {/* IMC */}
  {formData.imc && (
    <View style={[anamneseStyles.imcContainer, { backgroundColor: theme.colors.background }]}>
      <Text style={[anamneseStyles.imcText, { color: theme.colors.primary }]}>
        IMC calculé: {formData.imc}
      </Text>
    </View>
  )}
</View>

{/* ✅ CORRIGER toutes les autres zones de texte avec le même style que poids/taille */}

{/* Informations médicales */}
<View style={[anamneseStyles.fieldCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
  <Text style={[anamneseStyles.fieldTitle, { color: theme.colors.primary }]}>
    {'Informations médicales'}
  </Text>

  {/* ✅ APPLIQUER le même style que poids/taille */}
  <View style={anamneseStyles.inputContainer}>
    <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
      {'Antécédents médicaux et/ou diagnostics'}
    </Text>
    <Text style={[anamneseStyles.helperText, { color: theme.colors.secondary }]}>
      {'Maladies, opérations, diagnostics médicaux importants'}
    </Text>
    <TextInput
      ref={(ref) => {
        inputRefs.current["diagnostics"] = ref;
      }}
      style={[
        anamneseStyles.input, // ✅ UTILISER input au lieu de textArea
        { 
          backgroundColor: theme.colors.background,
          color: theme.colors.primary,
          borderColor: theme.colors.border,
          minHeight: 80, // ✅ AJOUTER une hauteur minimum pour multiline
        }
      ]}
      value={formData.diagnostics}
      onChangeText={(text) => setFormData({ ...formData, diagnostics: text })}
      placeholder="Ex: diabète, scoliose, opération, etc."
      placeholderTextColor="#666666"
      multiline
      numberOfLines={3}
      textAlignVertical="top"
      onSubmitEditing={() => focusNextInput("blessures")}
    />
  </View>

  <View style={anamneseStyles.inputContainer}>
    <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
      {'Blessures actuelles'}
    </Text>
    <Text style={[anamneseStyles.helperText, { color: theme.colors.secondary }]}>
      {'Douleurs, blessures en cours, limitations physiques'}
    </Text>
    <TextInput
      ref={(ref) => {
        inputRefs.current["blessures"] = ref;
      }}
      style={[
        anamneseStyles.input, // UTILISER input au lieu de textArea
        { 
          backgroundColor: theme.colors.background,
          color: theme.colors.primary,
          borderColor: theme.colors.border,
          minHeight: 80,
        }
      ]}
      value={formData.blessures}
      onChangeText={(text) => setFormData({ ...formData, blessures: text })}
      placeholder="Ex: entorse, fracture, tendinite, etc."
      placeholderTextColor="#666666"
      multiline
      numberOfLines={3}
      textAlignVertical="top"
      onSubmitEditing={() => focusNextInput("traitement")}
    />
  </View>

  <View style={anamneseStyles.inputContainer}>
    <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
      {'Traitements en cours'}
    </Text>
    <Text style={[anamneseStyles.helperText, { color: theme.colors.secondary }]}>
      {'Médicaments, thérapies en cours'}
    </Text>
    <TextInput
      ref={(ref) => {
        inputRefs.current["traitement"] = ref;
      }}
      style={[
        anamneseStyles.input, // UTILISER input au lieu de textArea
        { 
          backgroundColor: theme.colors.background,
          color: theme.colors.primary,
          borderColor: theme.colors.border,
          minHeight: 80,
        }
      ]}
      value={formData.traitement}
      onChangeText={(text) => setFormData({ ...formData, traitement: text })}
      placeholder={"Ex: anti-inflammatoires, physiothérapie,\netc."}
      placeholderTextColor="#666666"
      multiline
      numberOfLines={3}
      textAlignVertical="top"
      onSubmitEditing={() => focusNextInput("exp_sportive")}
    />
  </View>
</View>

{/* Activité sportive */}
<View style={[anamneseStyles.fieldCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
  <Text style={[anamneseStyles.fieldTitle, { color: theme.colors.primary }]}>
    {'Activité sportive'}
  </Text>
  

  <View style={anamneseStyles.inputContainer}>
    <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
      {'Expérience sportive'}
    </Text>
    <Text style={[anamneseStyles.helperText, { color: theme.colors.secondary }]}>
      {'Sports pratiqués (passés ou actuels), niveau, fréquence d\'entraînement'}
    </Text>
    <TextInput
      ref={(ref) => {
        inputRefs.current["exp_sportive"] = ref;
      }}
      style={[
        anamneseStyles.input, // ✅ UTILISER input au lieu de textArea
        { 
          backgroundColor: theme.colors.background,
          color: theme.colors.primary,
          borderColor: theme.colors.border,
          minHeight: 80,
        }
      ]}
      value={formData.exp_sportive}
      onChangeText={(text) => setFormData({ ...formData, exp_sportive: text })}
      placeholder={"Ex: Course à pied en amateur depuis \n1 an à environ 3 sorties par semaine"}
      placeholderTextColor="#666666"
      multiline
      numberOfLines={3}
      textAlignVertical="top"
      onSubmitEditing={() => focusNextInput("etat_actuel")}
    />
  </View>

  <View style={anamneseStyles.inputContainer}>
    <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
      État actuel <Text style={[anamneseStyles.required, { color: theme.colors.error }]}>*</Text>
    </Text>
    <Text style={[anamneseStyles.helperText, { color: theme.colors.secondary }]}>
      {'Santé globale, niveau de fatigue, stress, forme physique actuelle'}
    </Text>
    <TextInput
      ref={(ref) => {
        inputRefs.current["etat_actuel"] = ref;
      }}
      style={[
        anamneseStyles.input, // UTILISER input au lieu de textArea
        { 
          backgroundColor: theme.colors.background,
          color: theme.colors.primary,
          borderColor: theme.colors.border,
          minHeight: 80,
        }
      ]}
      value={formData.etat_actuel}
      onChangeText={(text) => setFormData({ ...formData, etat_actuel: text })}
      placeholder={"Comment vous sentez-vous actuellement ?"}
      placeholderTextColor="#666666"
      multiline
      numberOfLines={3}
      textAlignVertical="top"
      onSubmitEditing={() => focusNextInput("contrainte_pro")}
    />
  </View>
</View>

{/* Contraintes */}
<View style={[anamneseStyles.fieldCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
  <Text style={[anamneseStyles.fieldTitle, { color: theme.colors.primary }]}>
    {'Contraintes et commentaires'}
  </Text>
  <Text style={[anamneseStyles.fieldDescription, { color: theme.colors.secondary }]}>
    {'Facteurs pouvant influencer votre entraînement :'}
  </Text>
  
  <View style={anamneseStyles.inputContainer}>
    <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
      {'Contraintes professionnelles'}
    </Text>
    
    <TextInput
      ref={(ref) => {
        inputRefs.current["contrainte_pro"] = ref;
      }}
      style={[
        anamneseStyles.input, // ✅ UTILISER input au lieu de textArea
        { 
          backgroundColor: theme.colors.background,
          color: theme.colors.primary,
          borderColor: theme.colors.border,
          minHeight: 80,
        }
      ]}
      value={formData.contrainte_pro}
      onChangeText={(text) => setFormData({ ...formData, contrainte_pro: text })}
      placeholder="Horaires, stress, voyages, sédentarité..."
      placeholderTextColor="#666666"
      multiline
      numberOfLines={3}
      textAlignVertical="top"
      onSubmitEditing={() => focusNextInput("contrainte_fam")}
    />
  </View>

  <View style={anamneseStyles.inputContainer}>
    <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
      {`Contraintes familiales`}
    </Text>
    
    <TextInput
      ref={(ref) => {
        inputRefs.current["contrainte_fam"] = ref;
      }}
      style={[
        anamneseStyles.input, // ✅ UTILISER input au lieu de textArea
        { 
          backgroundColor: theme.colors.background,
          color: theme.colors.primary,
          borderColor: theme.colors.border,
          minHeight: 80,
        }
      ]}
      value={formData.contrainte_fam}
      onChangeText={(text) => setFormData({ ...formData, contrainte_fam: text })}
      placeholder="Temps disponible, garde d'enfants, obligations familiales..."
      placeholderTextColor="#666666"
      multiline
      numberOfLines={3}
      textAlignVertical="top"
      onSubmitEditing={() => focusNextInput("commentaire")}
    />
  </View>

  <View style={anamneseStyles.inputContainer}>
    <Text style={[anamneseStyles.inputLabel, { color: theme.colors.secondary }]}>
      Commentaire libre
    </Text>
    <TextInput
      ref={(ref) => {
        inputRefs.current["commentaire"] = ref;
      }}
      style={[
        anamneseStyles.input, // UTILISER input au lieu de textArea
        { 
          backgroundColor: theme.colors.background,
          color: theme.colors.primary,
          borderColor: theme.colors.border,
          minHeight: 80,
        }
      ]}
      value={formData.commentaire}
      onChangeText={(text) => setFormData({ ...formData, commentaire: text })}
      placeholder="Autres informations importantes..."
      placeholderTextColor="#666666"
      multiline
      numberOfLines={3}
      textAlignVertical="top"
    />
  </View>
</View>
      </View>

      {/* ✅ BOUTONS D'ACTION MODERNISÉS */}
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
          style={[anamneseStyles.cancelButton, { backgroundColor: 'transparent', borderColor: theme.colors.error }]}
          onPress={() => router.replace('/(tabs)/profil')}
        >
          <FontAwesome name="times" size={18} color={theme.colors.error} />
          <Text style={[anamneseStyles.cancelButtonText, { color: theme.colors.error }]}>
            Annuler
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}