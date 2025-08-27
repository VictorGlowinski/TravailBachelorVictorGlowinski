// app/(tabs)/creationEvaluationInitiale.tsx - VERSION COMPLÈTE CORRIGÉE

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
import evaluationInitialeStyles from "@/styles/screens/EvaluationInitialeStyles";
import { useTheme } from '@/styles/screens/ThemeStyle';
import DateTimePicker from '@react-native-community/datetimepicker'; 


const API_BASE_URL = "http://192.168.0.112:8000/api";

const REQUIRED_KEYS = ["exp_triathlon", "objectifs", "echeance", "nb_heure_dispo"];

export default function CreationEvaluationInitialeScreen() {
  const theme = useTheme();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // États pour les pastilles d'information
  const [showCooperInfo, setShowCooperInfo] = useState(false);
  const [showVo2maxInfo, setShowVo2maxInfo] = useState(false);
  const [showFcReposInfo, setShowFcReposInfo] = useState(false);
  const [showFcMaxInfo, setShowFcMaxInfo] = useState(false);
  const [showVMAInfo, setShowVMAInfo] = useState(false);
  const [showFTPInfo, setShowFTPInfo] = useState(false);
  const [showSeuilNatationInfo, setShowSeuilNatationInfo] = useState(false);
  const [showSeuilCyclismeInfo, setShowSeuilCyclismeInfo] = useState(false);
  const [showSeuilCourseInfo, setShowSeuilCourseInfo] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);


  const [formData, setFormData] = useState({
    vo2max: "",
    freq_repo: "",
    freq_max: "",
    ftp_cyclisme: "",
    vma: "",
    cooper: "",
    nb_heure_dispo: "",
    seuil_natation: "",
    seuil_cyclisme: "",
    seuil_course: "",
    commentaire: "",
    objectifs: "",
    echeance: "",
    exp_triathlon: "",
  });

  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  // Draft key pour évaluation initiale
  const draftKey = useMemo(() => 
    currentUserId ? `evaluation_draft_${currentUserId}` : null, 
    [currentUserId]
  );

  // Calcul du nombre de champs remplis
  const filledCount = useMemo(() => {
    return Object.values(formData).filter(value => value.trim() !== "").length;
  }, [formData]);

  // Validation des champs requis
  const isValid = useMemo(() => {
    return REQUIRED_KEYS.every(key => formData[key as keyof typeof formData]?.trim() !== "");
  }, [formData]);

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

// ✅ MODIFIER la fonction handleDateChange
const handleDateChange = (event: any, selectedDate?: Date) => {
  if (Platform.OS === 'android') {
    // ✅ Sur Android, garder le comportement natif
    setShowDatePicker(false);
    if (selectedDate && event.type !== 'dismissed') {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, echeance: formattedDate }));
    }
  } else {
    // ✅ Sur iOS, ne pas fermer automatiquement
    if (selectedDate && event.type !== 'dismissed') {
      setTempDate(selectedDate);
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
      setTempDate(null);
    }
  }
};

// ✅ FONCTION pour confirmer la date (iOS)
const confirmDate = () => {
  if (tempDate) {
    const formattedDate = tempDate.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, echeance: formattedDate }));
  }
  setShowDatePicker(false);
  setTempDate(null);
};

// ✅ FONCTION pour annuler la sélection
const cancelDateSelection = () => {
  setShowDatePicker(false);
  setTempDate(null);
};

// ✅ FONCTION pour fermer le calendrier si on clique sur un autre champ
const handleInputFocus = (inputKey: string) => {
  if (showDatePicker) {
    confirmDate(); // ✅ Valider la date en cours si le calendrier est ouvert
  }
  const input = inputRefs.current[inputKey];
  if (input) {
    input.focus();
  }
};

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

  // Récupérer l'ID utilisateur
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        setCurrentUserId(userId);
      } catch (error) {
        console.error("Erreur récupération userId:", error);
      }
    };
    getUserId();
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

  // Charger le brouillon sauvegardé
  const loadDraft = async () => {
    if (!draftKey) return;
    
    try {
      const savedDraft = await AsyncStorage.getItem(draftKey);
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsedDraft }));
        console.log('📝 Brouillon évaluation chargé');
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

  // app/(tabs)/creationEvaluationInitiale.tsx - CORRIGER handleSubmit

const handleSubmit = async () => {
  if (!isValid) {
    Alert.alert("Champs requis", "Veuillez compléter les champs obligatoires.");
    return;
  }
  if (!currentUserId) {
    Alert.alert("Erreur", "Utilisateur non identifié");
    return;
  }

  setIsSubmitting(true);
  try {
    // ✅ SIMPLIFIER - La date est déjà au bon format YYYY-MM-DD
    const evaluationData = {
      eva_user_id: parseInt(currentUserId, 10),
      eva_vo2max: formData.vo2max ? parseFloat(formData.vo2max) : null,
      eva_freq_repos: formData.freq_repo ? parseInt(formData.freq_repo, 10) : null,
      eva_freq_max: formData.freq_max ? parseInt(formData.freq_max, 10) : null,
      eva_ftp_cyclisme: formData.ftp_cyclisme ? parseInt(formData.ftp_cyclisme, 10) : null,
      eva_vma: formData.vma ? parseFloat(formData.vma) : null,
      eva_cooper: formData.cooper || null,
      eva_nb_heure_dispo: formData.nb_heure_dispo ? parseInt(formData.nb_heure_dispo, 10) : null,
      eva_seuil_natation: formData.seuil_natation || null,
      eva_seuil_cyclisme: formData.seuil_cyclisme || null,
      eva_seuil_course: formData.seuil_course || null,
      eva_commentaire: formData.commentaire || null,
      eva_objectif: formData.objectifs || null,
      eva_echeance: formData.echeance || null, // ✅ Date déjà au format YYYY-MM-DD
    };

    console.log('📤 Données à envoyer:', evaluationData);

    const response = await fetch(`${API_BASE_URL}/evaluation-initiale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(evaluationData),
    });

    console.log('📡 Response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Succès:', result);
      
      if (draftKey) await AsyncStorage.removeItem(draftKey);
      
      Alert.alert(
        "Succès", 
        "Évaluation initiale créée avec succès !",
        [{ text: "OK", onPress: () => router.push('/(tabs)/profil') }]
      );
    } else {
      const errorData = await response.json();
      console.error('❌ Erreur response:', errorData);
      throw new Error(errorData.message || "Erreur lors de la création");
    }
  } catch (error) {
    console.error("Erreur création évaluation:", error);
    Alert.alert("Erreur", "Impossible de créer l'évaluation. Veuillez réessayer.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
  <ScrollView 
    style={[evaluationInitialeStyles.container, { backgroundColor: theme.colors.background }]}
    contentContainerStyle={evaluationInitialeStyles.scrollContent}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
  >
    {/* ✅ HEADER MODERNISÉ */}
    <View style={[evaluationInitialeStyles.header, { backgroundColor: theme.colors.surface }, theme.shadows]}>
      <View style={evaluationInitialeStyles.headerContent}>
        <Pressable
          onPress={() => router.replace('/(tabs)/profil')}
          style={[evaluationInitialeStyles.backButton, { backgroundColor: theme.colors.accent }]}
        >
          <FontAwesome name="arrow-left" size={20} color="white" />
        </Pressable>

        <View style={evaluationInitialeStyles.titleContainer}>
          <Text style={[evaluationInitialeStyles.mainTitle, { color: theme.colors.primary }]}>
            Évaluation Initiale
          </Text>
          <Text style={[evaluationInitialeStyles.subtitle, { color: theme.colors.secondary }]}>
            Définissez vos objectifs et capacités
          </Text>
        </View>

        {isKeyboardVisible && (
          <Pressable
            onPress={dismissKeyboard}
            style={[evaluationInitialeStyles.keyboardButton, { backgroundColor: theme.colors.surfaceVariant }]}
          >
            <FontAwesome name="keyboard-o" size={16} color={theme.colors.accent} />
          </Pressable>
        )}
      </View>

      {/* ✅ BARRE DE PROGRESSION MODERNE */}
      <View style={evaluationInitialeStyles.progressSection}>
        <View style={[evaluationInitialeStyles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View 
            style={[
              evaluationInitialeStyles.progressFill, 
              { 
                width: `${(filledCount / 14) * 100}%`,
                backgroundColor: theme.colors.accent
              }
            ]} 
          />
        </View>
        <Text style={[evaluationInitialeStyles.progressText, { color: theme.colors.secondary }]}>
          {filledCount}/14 champs complétés
        </Text>
      </View>
    </View>

    {/* ✅ LOADING STATE */}
    {isSubmitting && (
      <View style={[evaluationInitialeStyles.loadingCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={[evaluationInitialeStyles.loadingText, { color: theme.colors.secondary }]}>
          Création de votre évaluation...
        </Text>
      </View>
    )}

    {/* ✅ FORMULAIRE MODERNISÉ */}
    <View style={evaluationInitialeStyles.formSection}>
      {/* Niveau d'expérience */}
      <View style={[evaluationInitialeStyles.fieldCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
        <Text style={[evaluationInitialeStyles.fieldTitle, { color: theme.colors.primary }]}>
          Niveau d'expérience <Text style={[evaluationInitialeStyles.required, { color: theme.colors.error }]}>*</Text>
        </Text>
        <Text style={[evaluationInitialeStyles.fieldDescription, { color: theme.colors.secondary }]}>
          Sélectionnez votre niveau actuel
        </Text>
        
        <View style={evaluationInitialeStyles.chipsContainer}>
          {(["Débutant", "Intermédiaire", "Avancé", "Expert"] as const).map((opt) => {
            const selected = formData.exp_triathlon === opt;
            return (
              <Pressable
                key={opt}
                onPress={() =>
                  setFormData((p) => ({ ...p, exp_triathlon: selected ? "" : opt }))
                }
                style={[
                  evaluationInitialeStyles.chip, 
                  { 
                    backgroundColor: selected ? theme.colors.accent : theme.colors.surfaceVariant,
                    borderColor: selected ? theme.colors.accent : theme.colors.border
                  }
                ]}
              >
                <Text style={[
                  evaluationInitialeStyles.chipText, 
                  { color: selected ? 'white' : theme.colors.primary }
                ]}>
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Objectifs */}
      <View style={[evaluationInitialeStyles.fieldCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
        <Text style={[evaluationInitialeStyles.fieldTitle, { color: theme.colors.primary }]}>
          Objectifs sportifs <Text style={[evaluationInitialeStyles.required, { color: theme.colors.error }]}>*</Text>
        </Text>
        <Text style={[evaluationInitialeStyles.fieldDescription, { color: theme.colors.secondary }]}>
          Décrivez vos objectifs et motivations
        </Text>
        
        <TextInput
          ref={(ref) => {
            inputRefs.current["objectifs"] = ref;
          }}
          style={[
            evaluationInitialeStyles.textArea, 
            { 
              backgroundColor: theme.colors.background,
              color: theme.colors.primary,
              borderColor: theme.colors.border
            }
          ]}
          value={formData.objectifs}
          onChangeText={(text) => setFormData({ ...formData, objectifs: text })}
          placeholder="Ex: Triathlon olympique, améliorer endurance, perte de poids..."
          placeholderTextColor={theme.colors.secondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          onFocus={() => handleInputFocus("objectifs")}
          onSubmitEditing={() => focusNextInput("echeance")}
        />
      </View>

      {/* Planning */}
      <View style={[evaluationInitialeStyles.fieldCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
        <Text style={[evaluationInitialeStyles.fieldTitle, { color: theme.colors.primary }]}>
          Planning <Text style={[evaluationInitialeStyles.required, { color: theme.colors.error }]}>*</Text>
        </Text>
        <Text style={[evaluationInitialeStyles.fieldDescription, { color: theme.colors.secondary }]}>
          Définissez votre échéance et disponibilité {'\n'}
          (Dans le cadre de ce travail il sera généré que 2 semaines de plan mais mettez l'échéance à la quelle vous pensiez initialement)
        </Text>
        
        {/* ✅ ROW avec les deux champs côte à côte */}
        <View style={evaluationInitialeStyles.row}>
          {/* ✅ ÉCHÉANCE - Pressable qui ouvre le calendrier */}
          <View style={[evaluationInitialeStyles.inputContainer, { marginRight: 10 }]}>
            <Text style={[evaluationInitialeStyles.inputLabel, { color: theme.colors.secondary }]}>Échéance</Text>
            <Pressable
              style={[
                evaluationInitialeStyles.input,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[
                evaluationInitialeStyles.inputText,
                { 
                  color: formData.echeance ? theme.colors.primary : theme.colors.secondary,
                  fontSize: 16,
                }
              ]}>
                {formData.echeance ? formatDateForDisplay(formData.echeance) : "Sélectionnez une date"}
              </Text>
              <FontAwesome name="calendar" size={16} color={theme.colors.secondary} />
            </Pressable>
          </View>
          
          {/* ✅ HEURES/SEMAINE - À côté de l'échéance */}
          <View style={evaluationInitialeStyles.inputContainer}>
            <Text style={[evaluationInitialeStyles.inputLabel, { color: theme.colors.secondary }]}>Heures/semaine</Text>
            <TextInput
              ref={(ref) => {
                inputRefs.current["nb_heure_dispo"] = ref;
              }}
              style={[
                evaluationInitialeStyles.input, 
                { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.primary,
                  borderColor: theme.colors.border
                }
              ]}
              value={formData.nb_heure_dispo}
              onChangeText={(text) => setFormData({ ...formData, nb_heure_dispo: text.replace(/[^\d]/g, "") })}
              placeholder="Ex: 8"
              placeholderTextColor={theme.colors.secondary}
              keyboardType="numeric"
              onFocus={() => handleInputFocus("nb_heure_dispo")}
              onSubmitEditing={() => focusNextInput("vo2max")}
            />
          </View>
        </View>
      </View>

      {/* Tests physiques (optionnel) */}
      <View style={[evaluationInitialeStyles.fieldCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
        <Pressable
          onPress={() => setShowAdvanced(!showAdvanced)}
          style={evaluationInitialeStyles.expandableHeader}
        >
          <View style={evaluationInitialeStyles.expandableTitle}>
            <FontAwesome name="heartbeat" size={20} color={theme.colors.accent} />
            <Text style={[evaluationInitialeStyles.fieldTitle, { color: theme.colors.primary, marginLeft: 10 }]}>
              Tests physiques
            </Text>
            <View style={[evaluationInitialeStyles.optionalBadge, { backgroundColor: theme.colors.warning }]}>
              <Text style={evaluationInitialeStyles.optionalText}>Optionnel</Text>
            </View>
          </View>
          <FontAwesome 
            name={showAdvanced ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={theme.colors.secondary} 
          />
        </Pressable>
        
        <Text style={[evaluationInitialeStyles.fieldDescription, { color: theme.colors.secondary }]}>
          Si vous disposez des données de tests physiques suivantes via votre appareil connecté, vous pouvez les saisir afin de personnaliser votre plan.
          (Ces données sont optionnelles et peuvent être modifiées ultérieurement.)
        </Text>

        {showAdvanced && (
          <View style={evaluationInitialeStyles.expandableContent}>
            {/* Tests cardiorespiratoires */}
            <View style={evaluationInitialeStyles.row}>
              {/* ✅ VO2 MAX avec pastille d'info */}
              <View style={[evaluationInitialeStyles.inputContainer, { marginRight: 10 }]}>
                <View style={evaluationInitialeStyles.inputLabelContainer}>
                  <Text style={[evaluationInitialeStyles.inputLabel, { color: theme.colors.secondary }]}>VO2 Max</Text>
                  <Pressable 
                    style={[evaluationInitialeStyles.infoBadge, { backgroundColor: theme.colors.accent }]}
                    onPress={() => setShowVo2maxInfo(!showVo2maxInfo)}
                  >
                    <FontAwesome name="info" size={10} color="white" />
                  </Pressable>
                </View>
                
                <TextInput
                  ref={(ref) => {
                    inputRefs.current["vo2max"] = ref;
                  }}
                  style={[
                    evaluationInitialeStyles.input, 
                    { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.primary,
                      borderColor: theme.colors.border
                    }
                  ]}
                  value={formData.vo2max}
                  onChangeText={(text) => setFormData({ ...formData, vo2max: text.replace(/[^\d.,]/g, "") })}
                  placeholder="Ex: 50"
                  placeholderTextColor={theme.colors.secondary}
                  keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                  onFocus={() => handleInputFocus("vo2max")}
                  onSubmitEditing={() => focusNextInput("freq_repo")}
                />
                
                {/* ✅ TOOLTIP VO2 MAX */}
                {showVo2maxInfo && (
                  <View style={[evaluationInitialeStyles.infoTooltip, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <FontAwesome name="lightbulb-o" size={12} color={theme.colors.accent} />
                    <Text style={[evaluationInitialeStyles.infoText, { color: theme.colors.secondary }]}>
                      Volume maximal d'oxygène consommé par unité de temps (ml/kg/min). Indicateur de capacité aérobie.
                    </Text>
                  </View>
                )}
              </View>
              
              {/* ✅ TEST COOPER avec pastille d'info */}
              <View style={evaluationInitialeStyles.inputContainer}>
                <View style={evaluationInitialeStyles.inputLabelContainer}>
                  <Text style={[evaluationInitialeStyles.inputLabel, { color: theme.colors.secondary }]}>Test Cooper</Text>
                  <Pressable 
                    style={[evaluationInitialeStyles.infoBadge, { backgroundColor: theme.colors.accent }]}
                    onPress={() => setShowCooperInfo(!showCooperInfo)}
                  >
                    <FontAwesome name="info" size={10} color="white" />
                  </Pressable>
                </View>
                
                <TextInput
                  ref={(ref) => {
                    inputRefs.current["cooper"] = ref;
                  }}
                  style={[
                    evaluationInitialeStyles.input, 
                    { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.primary,
                      borderColor: theme.colors.border
                    }
                  ]}
                  value={formData.cooper}
                  onChangeText={(text) => setFormData({ ...formData, cooper: text.replace(/[^\d.,]/g, "") })}
                  placeholder="Distance (m)"
                  placeholderTextColor={theme.colors.secondary}
                  keyboardType="numeric"
                  onFocus={() => handleInputFocus("cooper")}
                  onSubmitEditing={() => focusNextInput("vma")}
                />
                
                {/* ✅ TOOLTIP COOPER */}
                {showCooperInfo && (
                  <View style={[evaluationInitialeStyles.infoTooltip, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <FontAwesome name="lightbulb-o" size={12} color={theme.colors.accent} />
                    <Text style={[evaluationInitialeStyles.infoText, { color: theme.colors.secondary }]}>
                      Distance maximale que vous arrivez à parcourir en 12 minutes de course continue.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ✅ FC REPOS et FC MAX avec pastilles d'info */}
            <View style={evaluationInitialeStyles.row}>
              {/* FC REPOS */}
              <View style={[evaluationInitialeStyles.inputContainer, { marginRight: 10 }]}>
                <View style={evaluationInitialeStyles.inputLabelContainer}>
                  <Text style={[evaluationInitialeStyles.inputLabel, { color: theme.colors.secondary }]}>FC repos</Text>
                  <Pressable 
                    style={[evaluationInitialeStyles.infoBadge, { backgroundColor: theme.colors.accent }]}
                    onPress={() => setShowFcReposInfo(!showFcReposInfo)}
                  >
                    <FontAwesome name="info" size={10} color="white" />
                  </Pressable>
                </View>
                
                <TextInput
                  ref={(ref) => {
                    inputRefs.current["freq_repo"] = ref;
                  }}
                  style={[
                    evaluationInitialeStyles.input, 
                    { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.primary,
                      borderColor: theme.colors.border
                    }
                  ]}
                  value={formData.freq_repo}
                  onChangeText={(text) => setFormData({ ...formData, freq_repo: text.replace(/[^\d]/g, "") })}
                  placeholder="bpm"
                  placeholderTextColor={theme.colors.secondary}
                  keyboardType="numeric"
                  onFocus={() => handleInputFocus("freq_repo")}
                  onSubmitEditing={() => focusNextInput("freq_max")}
                />
                
                {/* ✅ TOOLTIP FC REPOS */}
                {showFcReposInfo && (
                  <View style={[evaluationInitialeStyles.infoTooltip, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <FontAwesome name="lightbulb-o" size={12} color={theme.colors.accent} />
                    <Text style={[evaluationInitialeStyles.infoText, { color: theme.colors.secondary }]}>
                      Fréquence cardiaque au repos, mesurée le matin au réveil (battements par minute).
                    </Text>
                  </View>
                )}
              </View>
              
              {/* FC MAX */}
              <View style={evaluationInitialeStyles.inputContainer}>
                <View style={evaluationInitialeStyles.inputLabelContainer}>
                  <Text style={[evaluationInitialeStyles.inputLabel, { color: theme.colors.secondary }]}>FC max</Text>
                  <Pressable 
                    style={[evaluationInitialeStyles.infoBadge, { backgroundColor: theme.colors.accent }]}
                    onPress={() => setShowFcMaxInfo(!showFcMaxInfo)}
                  >
                    <FontAwesome name="info" size={10} color="white" />
                  </Pressable>
                </View>
                
                <TextInput
                  ref={(ref) => {
                    inputRefs.current["freq_max"] = ref;
                  }}
                  style={[
                    evaluationInitialeStyles.input, 
                    { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.primary,
                      borderColor: theme.colors.border
                    }
                  ]}
                  value={formData.freq_max}
                  onChangeText={(text) => setFormData({ ...formData, freq_max: text.replace(/[^\d]/g, "") })}
                  placeholder="bpm"
                  placeholderTextColor={theme.colors.secondary}
                  keyboardType="numeric"
                  onFocus={() => handleInputFocus("freq_max")}
                  onSubmitEditing={() => focusNextInput("vma")}
                />
                
                {/* ✅ TOOLTIP FC MAX */}
                {showFcMaxInfo && (
                  <View style={[evaluationInitialeStyles.infoTooltip, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <FontAwesome name="lightbulb-o" size={12} color={theme.colors.accent} />
                    <Text style={[evaluationInitialeStyles.infoText, { color: theme.colors.secondary }]}>
                      Fréquence cardiaque maximale, mesurée lors d'un effort maximal ou calculée (220 - âge).
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ✅ VMA avec pastille d'info */}
            <View style={evaluationInitialeStyles.testSection}>
              <Text style={[evaluationInitialeStyles.sectionTitle, { color: theme.colors.primary }]}>
                Vitesse Maximale Aérobie
              </Text>
              
              <View style={evaluationInitialeStyles.inputContainer}>
                <View style={evaluationInitialeStyles.inputLabelContainer}>
                  <Text style={[evaluationInitialeStyles.inputLabel, { color: theme.colors.secondary }]}>VMA</Text>
                  <Pressable 
                    style={[evaluationInitialeStyles.infoBadge, { backgroundColor: theme.colors.accent }]}
                    onPress={() => setShowVMAInfo(!showVMAInfo)}
                  >
                    <FontAwesome name="info" size={10} color="white" />
                  </Pressable>
                </View>
                
                <TextInput
                  ref={(ref) => {
                    inputRefs.current["vma"] = ref;
                  }}
                  style={[
                    evaluationInitialeStyles.input, 
                    { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.primary,
                      borderColor: theme.colors.border
                    }
                  ]}
                  value={formData.vma}
                  onChangeText={(text) => setFormData({ ...formData, vma: text.replace(/[^\d.,]/g, "") })}
                  placeholder="km/h (ex: 15.5)"
                  placeholderTextColor={theme.colors.secondary}
                  keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                  onFocus={() => handleInputFocus("vma")}
                  onSubmitEditing={() => focusNextInput("ftp_cyclisme")}
                />
                
                {/* ✅ TOOLTIP VMA */}
                {showVMAInfo && (
                  <View style={[evaluationInitialeStyles.infoTooltip, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <FontAwesome name="lightbulb-o" size={12} color={theme.colors.accent} />
                    <Text style={[evaluationInitialeStyles.infoText, { color: theme.colors.secondary }]}>
                      Vitesse de course à laquelle le VO2 max est atteint. Déterminée par un test progressif (ex: test de Léger-Boucher).
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ✅ FTP CYCLISME avec pastille d'info */}
            <View style={evaluationInitialeStyles.testSection}>
              <Text style={[evaluationInitialeStyles.sectionTitle, { color: theme.colors.primary }]}>
                Tests par discipline
              </Text>
              
              <View style={evaluationInitialeStyles.inputContainer}>
                <View style={evaluationInitialeStyles.inputLabelContainer}>
                  <Text style={[evaluationInitialeStyles.inputLabel, { color: theme.colors.secondary }]}>FTP Cyclisme</Text>
                  <Pressable 
                    style={[evaluationInitialeStyles.infoBadge, { backgroundColor: theme.colors.accent }]}
                    onPress={() => setShowFTPInfo(!showFTPInfo)}
                  >
                    <FontAwesome name="info" size={10} color="white" />
                  </Pressable>
                </View>
                
                <TextInput
                  ref={(ref) => {
                    inputRefs.current["ftp_cyclisme"] = ref;
                  }}
                  style={[
                    evaluationInitialeStyles.input, 
                    { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.primary,
                      borderColor: theme.colors.border
                    }
                  ]}
                  value={formData.ftp_cyclisme}
                  onChangeText={(text) => setFormData({ ...formData, ftp_cyclisme: text.replace(/[^\d]/g, "") })}
                  placeholder="Watts (ex: 250)"
                  placeholderTextColor={theme.colors.secondary}
                  keyboardType="numeric"
                  onFocus={() => handleInputFocus("ftp_cyclisme")}
                  onSubmitEditing={() => focusNextInput("seuil_natation")}
                />
                
                {/* ✅ TOOLTIP FTP */}
                {showFTPInfo && (
                  <View style={[evaluationInitialeStyles.infoTooltip, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <FontAwesome name="lightbulb-o" size={12} color={theme.colors.accent} />
                    <Text style={[evaluationInitialeStyles.infoText, { color: theme.colors.secondary }]}>
                      Functional Threshold Power : puissance maximale soutenable pendant 1 heure en cyclisme (en watts).
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ✅ SEUILS avec pastilles d'info */}
            <View style={evaluationInitialeStyles.testSection}>
              <Text style={[evaluationInitialeStyles.sectionTitle, { color: theme.colors.primary }]}>
                Allures seuil
              </Text>
              
              {/* SEUIL NATATION */}
              <View style={evaluationInitialeStyles.inputContainer}>
                <View style={evaluationInitialeStyles.inputLabelContainer}>
                  <Text style={[evaluationInitialeStyles.inputLabel, { color: theme.colors.secondary }]}>Seuil Natation</Text>
                  <Pressable 
                    style={[evaluationInitialeStyles.infoBadge, { backgroundColor: theme.colors.accent }]}
                    onPress={() => setShowSeuilNatationInfo(!showSeuilNatationInfo)}
                  >
                    <FontAwesome name="info" size={10} color="white" />
                  </Pressable>
                </View>
                
                <TextInput
                  ref={(ref) => {
                    inputRefs.current["seuil_natation"] = ref;
                  }}
                  style={[
                    evaluationInitialeStyles.input, 
                    { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.primary,
                      borderColor: theme.colors.border
                    }
                  ]}
                  value={formData.seuil_natation}
                  onChangeText={(text) => setFormData({ ...formData, seuil_natation: text })}
                  placeholder="min/100m (ex: 1:30)"
                  placeholderTextColor={theme.colors.secondary}
                  onFocus={() => handleInputFocus("seuil_natation")}
                  onSubmitEditing={() => focusNextInput("seuil_cyclisme")}
                />
                
                {/* ✅ TOOLTIP SEUIL NATATION */}
                {showSeuilNatationInfo && (
                  <View style={[evaluationInitialeStyles.infoTooltip, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <FontAwesome name="lightbulb-o" size={12} color={theme.colors.accent} />
                    <Text style={[evaluationInitialeStyles.infoText, { color: theme.colors.secondary }]}>
                      Allure de nage au seuil anaérobie, exprimée en temps pour parcourir 100 mètres (ex: 1:30 = 1 min 30 sec).
                    </Text>
                  </View>
                )}
              </View>

              {/* SEUIL CYCLISME */}
              <View style={evaluationInitialeStyles.inputContainer}>
                <View style={evaluationInitialeStyles.inputLabelContainer}>
                  <Text style={[evaluationInitialeStyles.inputLabel, { color: theme.colors.secondary }]}>Seuil Cyclisme</Text>
                  <Pressable 
                    style={[evaluationInitialeStyles.infoBadge, { backgroundColor: theme.colors.accent }]}
                    onPress={() => setShowSeuilCyclismeInfo(!showSeuilCyclismeInfo)}
                  >
                    <FontAwesome name="info" size={10} color="white" />
                  </Pressable>
                </View>
                
                <TextInput
                  ref={(ref) => {
                    inputRefs.current["seuil_cyclisme"] = ref;
                  }}
                  style={[
                    evaluationInitialeStyles.input, 
                    { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.primary,
                      borderColor: theme.colors.border
                    }
                  ]}
                  value={formData.seuil_cyclisme}
                  onChangeText={(text) => setFormData({ ...formData, seuil_cyclisme: text })}
                  placeholder="km/h (ex: 35)"
                  placeholderTextColor={theme.colors.secondary}
                  keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                  onFocus={() => handleInputFocus("seuil_cyclisme")}
                  onSubmitEditing={() => focusNextInput("seuil_course")}
                />
                
                {/* ✅ TOOLTIP SEUIL CYCLISME */}
                {showSeuilCyclismeInfo && (
                  <View style={[evaluationInitialeStyles.infoTooltip, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <FontAwesome name="lightbulb-o" size={12} color={theme.colors.accent} />
                    <Text style={[evaluationInitialeStyles.infoText, { color: theme.colors.secondary }]}>
                      Vitesse de cyclisme au seuil anaérobie, exprimée en kilomètres par heure (correspond souvent à 85-90% de la FTP).
                    </Text>
                  </View>
                )}
              </View>

              {/* SEUIL COURSE */}
              <View style={evaluationInitialeStyles.inputContainer}>
                <View style={evaluationInitialeStyles.inputLabelContainer}>
                  <Text style={[evaluationInitialeStyles.inputLabel, { color: theme.colors.secondary }]}>Seuil Course</Text>
                  <Pressable 
                    style={[evaluationInitialeStyles.infoBadge, { backgroundColor: theme.colors.accent }]}
                    onPress={() => setShowSeuilCourseInfo(!showSeuilCourseInfo)}
                  >
                    <FontAwesome name="info" size={10} color="white" />
                  </Pressable>
                </View>
                
                <TextInput
                  ref={(ref) => {
                    inputRefs.current["seuil_course"] = ref;
                  }}
                  style={[
                    evaluationInitialeStyles.input, 
                    { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.primary,
                      borderColor: theme.colors.border
                    }
                  ]}
                  value={formData.seuil_course}
                  onChangeText={(text) => setFormData({ ...formData, seuil_course: text })}
                  placeholder="min/km (ex: 4:30)"
                  placeholderTextColor={theme.colors.secondary}
                  onFocus={() => handleInputFocus("seuil_course")}
                  onSubmitEditing={() => focusNextInput("commentaire")}
                />
                
                {/* ✅ TOOLTIP SEUIL COURSE */}
                {showSeuilCourseInfo && (
                  <View style={[evaluationInitialeStyles.infoTooltip, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <FontAwesome name="lightbulb-o" size={12} color={theme.colors.accent} />
                    <Text style={[evaluationInitialeStyles.infoText, { color: theme.colors.secondary }]}>
                      Allure de course au seuil anaérobie, exprimée en temps par kilomètre (ex: 4:30 = 4 min 30 sec/km).
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Commentaire */}
      <View style={[evaluationInitialeStyles.fieldCard, { backgroundColor: theme.colors.surface }, theme.shadows]}>
        <Text style={[evaluationInitialeStyles.fieldTitle, { color: theme.colors.primary }]}>
          Commentaires
        </Text>
        <Text style={[evaluationInitialeStyles.fieldDescription, { color: theme.colors.secondary }]}>
          Informations supplémentaires, préférences d'entraînement
        </Text>
        
        <TextInput
          ref={(ref) => {
            inputRefs.current["commentaire"] = ref;
          }}
          style={[
            evaluationInitialeStyles.textArea, 
            { 
              backgroundColor: theme.colors.background,
              color: theme.colors.primary,
              borderColor: theme.colors.border
            }
          ]}
          value={formData.commentaire}
          onChangeText={(text) => setFormData({ ...formData, commentaire: text })}
          placeholder="Préférences, informations utiles..."
          placeholderTextColor={theme.colors.secondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          onFocus={() => handleInputFocus("commentaire")}
        />
      </View>
    </View>

    {/* ✅ BOUTONS D'ACTION MODERNISÉS */}
    <View style={evaluationInitialeStyles.actionsSection}>
      <Pressable
        style={[
          evaluationInitialeStyles.submitButton,
          { 
            backgroundColor: isValid ? theme.colors.accent : theme.colors.disabled,
            opacity: (!isValid || isSubmitting) ? 0.6 : 1
          }
        ]}
        onPress={handleSubmit}
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <FontAwesome name="check" size={18} color="white" />
            <Text style={evaluationInitialeStyles.submitButtonText}>
              Créer l'évaluation
            </Text>
          </>
        )}
      </Pressable>

      <Pressable
        style={[evaluationInitialeStyles.cancelButton, { backgroundColor: 'transparent', borderColor: theme.colors.error }]}
        onPress={() => router.replace('/(tabs)/profil')}
      >
        <FontAwesome name="times" size={18} color={theme.colors.error} />
        <Text style={[evaluationInitialeStyles.cancelButtonText, { color: theme.colors.error }]}>
          Annuler
        </Text>
      </Pressable>
    </View>

    {/* ✅ DateTimePicker avec contrôle iOS/Android */}
    {showDatePicker && (
      <>
        {Platform.OS === 'ios' && (
          <View style={[evaluationInitialeStyles.datePickerContainer, { backgroundColor: theme.colors.surface }]}>
            {/* ✅ Header avec boutons */}
            <View style={[evaluationInitialeStyles.datePickerHeader, { borderBottomColor: theme.colors.border }]}>
              <Pressable
                style={[evaluationInitialeStyles.datePickerButton, { backgroundColor: 'transparent' }]}
                onPress={cancelDateSelection}
              >
                <Text style={[evaluationInitialeStyles.datePickerButtonText, { color: theme.colors.error }]}>
                  Annuler
                </Text>
              </Pressable>
              
              <Text style={[evaluationInitialeStyles.datePickerTitle, { color: theme.colors.primary }]}>
                Sélectionner une date
              </Text>
              
              <Pressable
                style={[evaluationInitialeStyles.datePickerButton, { backgroundColor: theme.colors.accent }]}
                onPress={confirmDate}
              >
                <Text style={[evaluationInitialeStyles.datePickerButtonText, { color: 'white' }]}>
                  OK
                </Text>
              </Pressable>
            </View>
            
            {/* ✅ DatePicker iOS */}
            <DateTimePicker
              value={tempDate || (formData.echeance ? new Date(formData.echeance) : new Date())}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              minimumDate={new Date()}
              maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
              style={evaluationInitialeStyles.datePickerIOS}
            />
          </View>
        )}
        
        {Platform.OS === 'android' && (
          <DateTimePicker
            value={formData.echeance ? new Date(formData.echeance) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
            maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
          />
        )}
      </>
    )}
  </ScrollView>
);
}