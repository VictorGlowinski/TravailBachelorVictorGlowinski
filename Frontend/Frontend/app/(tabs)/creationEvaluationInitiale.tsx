// app/(tabs)/creationEvaluationInitiale.tsx
import {
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState, useEffect, useRef, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { evaluationInitialeStyles } from '@/styles'; // ✅ Import correct

interface User {
  id: number;
  email: string;
  date_naissance: string;
  consentement?: boolean;
  created_at?: string;
  updated_at?: string;
}

const API_BASE_URL = "http://192.168.0.112:8000/api";

// ✅ CORRECTION : FormData pour évaluation initiale
type FormData = {
  vo2max: string;
  freq_repo: string;
  freq_max: string;
  ftp_cyclisme: string;
  vma: string;
  cooper: string;
  seuil_natation: string;
  seuil_cyclisme: string;
  seuil_course: string;
  echeance: string;
  nb_heure_dispo: string;
  commentaire: string;
  objectifs: string;
  niveau_experience: "Débutant" | "Intermédiaire" | "Avancé" | "Expert" | "";
};

// ✅ CORRECTION : Champs requis pour l'évaluation
const REQUIRED_KEYS: (keyof FormData)[] = ["niveau_experience", "objectifs", "echeance", "nb_heure_dispo"];

export default function CreationEvaluationInitialeScreen() { // ✅ CORRECTION : Nom de fonction
  const [formData, setFormData] = useState<FormData>({
    vo2max: "",
    freq_repo: "",
    freq_max: "",
    ftp_cyclisme: "",
    vma: "",
    cooper: "",
    seuil_natation: "",
    seuil_cyclisme: "",
    seuil_course: "",
    echeance: "",
    nb_heure_dispo: "",
    commentaire: "",
    objectifs: "",
    niveau_experience: "",
  });

  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  // ✅ CORRECTION : Draft key pour évaluation
  const draftKey = useMemo(() => 
    currentUserId ? `evaluation_draft_${currentUserId}` : null, 
    [currentUserId]
  );

  // ✅ Calcul du nombre de champs remplis
  const filledCount = useMemo(() => {
    return Object.values(formData).filter(value => value.trim() !== "").length;
  }, [formData]);

  // ✅ Validation des champs requis
  const isValid = useMemo(() => {
    return REQUIRED_KEYS.every(key => formData[key].trim() !== "");
  }, [formData]);

  // ✅ Gestion du clavier
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


  // ✅ Charger le brouillon quand l'utilisateur est chargé
  useEffect(() => {
    if (currentUserId) {
      loadDraft();
    }
  }, [currentUserId, draftKey]);

  // ✅ Sauvegarder automatiquement le brouillon
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData, draftKey]);



  // ✅ Charger le brouillon sauvegardé
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

  // ✅ Sauvegarder le brouillon
  const saveDraft = async () => {
    if (!draftKey) return;
    
    try {
      await AsyncStorage.setItem(draftKey, JSON.stringify(formData));
    } catch (error) {
      console.error('Erreur sauvegarde brouillon:', error);
    }
  };

  // ✅ Fonctions de navigation entre les champs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleInputFocus = () => {
    // Optionnel: scroll vers le champ focalisé
  };

  const focusNextInput = (nextKey: string) => {
    const nextInput = inputRefs.current[nextKey];
    if (nextInput) {
      nextInput.focus();
    }
  };

  // ✅ CORRECTION : Soumission du formulaire pour évaluation
  const handleSubmit = async (): Promise<void> => {
    Keyboard.dismiss();

    if (!currentUserId) {
      Alert.alert("Erreur", "Utilisateur non connecté");
      return;
    }
    if (!isValid) {
      Alert.alert("Champs requis", "Veuillez compléter les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ Mapping correct des champs pour l'évaluation initiale
      const evaluationData = {
        // Champs de base
        eva_user_id: parseInt(currentUserId, 10),
        eva_vo2max: formData.vo2max || null,
        eva_freq_repos: formData.freq_repo || null,
        eva_freq_max: formData.freq_max || null,
        eva_ftp_cyclisme: formData.ftp_cyclisme || null,
        eva_vma: formData.vma || null,
        eva_cooper: formData.cooper || null,
        
        // Seuils
        eva_seuil_natation: formData.seuil_natation || null,
        eva_seuil_cyclisme: formData.seuil_cyclisme || null,
        eva_seuil_course: formData.seuil_course || null,

        // Objectifs et planning
        eva_objectifs: formData.objectifs || null,
        eva_echeance: formData.echeance || null,
        eva_nb_heures_dispo: formData.nb_heure_dispo || null,
        eva_niveau_experience: formData.niveau_experience || null,
        
        // Commentaire
        eva_commentaire: formData.commentaire || null,
      };

      console.log('🚀 Envoi évaluation avec mapping:', evaluationData);

      const response = await fetch(`${API_BASE_URL}/evaluation-initiale`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(evaluationData),
      });

      console.log('📡 Response status:', response.status);
      const result = await response.json();
      console.log('📋 Response data:', result);

      if (response.ok) {
        if (result?.success !== false) {
          // Clear draft on success
          if (draftKey) await AsyncStorage.removeItem(draftKey);
          Alert.alert("Succès", "Évaluation initiale créée avec succès !", [
            { text: "OK", onPress: () => router.back() },
          ]);
        } else {
          throw new Error(result?.message || "Erreur retournée par le serveur");
        }
      } else {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        if (result?.message) {
          errorMessage = result.message;
        } else if (result?.errors) {
          if (Array.isArray(result.errors)) {
            errorMessage = result.errors.join("\n");
          } else if (typeof result.errors === 'object') {
            const errorMessages = Object.values(result.errors).flat();
            errorMessage = errorMessages.join("\n");
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("❌ Erreur création évaluation:", error);
      
      let userMessage = "Impossible de créer l'évaluation initiale";
      
      if (error instanceof TypeError && error.message === 'Network request failed') {
        userMessage = "Erreur de connexion. Vérifiez votre connexion internet.";
      } else if (error.message && error.message !== 'Erreur de création') {
        userMessage = error.message;
      }
      
      Alert.alert("Erreur", userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={evaluationInitialeStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={evaluationInitialeStyles.header}>
            <View style={evaluationInitialeStyles.headerTop}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour"
                onPress={() => router.back()}
                style={evaluationInitialeStyles.backButton}
              >
                <FontAwesome name="arrow-left" size={22} color="#fff" />
              </Pressable>

              <View style={evaluationInitialeStyles.titleContainer}>
                <Text style={evaluationInitialeStyles.title}>Nouvelle évaluation initiale</Text>
                <View style={evaluationInitialeStyles.progressContainer}>
                  <View style={evaluationInitialeStyles.progressBar}>
                    <View 
                      style={[
                        evaluationInitialeStyles.progressFill, 
                        { width: `${(filledCount / 14) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={evaluationInitialeStyles.progressText}>
                    {filledCount}/14 complétés
                  </Text>
                </View>
              </View>

              {isLoadingUser ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                isKeyboardVisible && (
                  <Pressable
                    onPress={dismissKeyboard}
                    style={evaluationInitialeStyles.keyboardCloseButton}
                    accessibilityRole="button"
                    accessibilityLabel="Fermer le clavier"
                  >
                    <FontAwesome name="keyboard-o" size={16} color="#fff" />
                  </Pressable>
                )
              )}
            </View>
          </View>

          {/* Content */}
          <KeyboardAwareScrollView
            ref={scrollViewRef}
            style={evaluationInitialeStyles.scrollView}
            contentContainerStyle={evaluationInitialeStyles.scrollContent}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraHeight={150}
            extraScrollHeight={150}
            keyboardOpeningTime={250}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={evaluationInitialeStyles.form}>

              {/* Niveau d'expérience chips */}
              <View style={evaluationInitialeStyles.inputGroup}>
                <Text style={evaluationInitialeStyles.label}>
                  Niveau d'expérience <Text style={evaluationInitialeStyles.required}>*</Text>
                </Text>
                <View style={evaluationInitialeStyles.chipsRow}>
                  {(["Débutant", "Intermédiaire", "Avancé", "Expert"] as const).map((opt) => {
                    const selected = formData.niveau_experience === opt;
                    return (
                      <Pressable
                        key={opt}
                        onPress={() =>
                          setFormData((p) => ({ ...p, niveau_experience: selected ? "" : opt }))
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Niveau ${opt}`}
                        style={[evaluationInitialeStyles.chip, selected && { backgroundColor: "#007AFF" }]}
                      >
                        <Text style={[evaluationInitialeStyles.chipText, selected && { color: "white" }]}>
                          {opt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Objectifs (required) */}
              <View style={evaluationInitialeStyles.inputGroup}>
                <Text style={evaluationInitialeStyles.label}>
                  Objectifs sportifs <Text style={evaluationInitialeStyles.required}>*</Text>
                </Text>
                <TextInput
                  ref={(ref) => {
                    inputRefs.current["objectifs"] = ref;
                  }}
                  style={[evaluationInitialeStyles.input, evaluationInitialeStyles.textArea]}
                  value={formData.objectifs}
                  onChangeText={(text) => setFormData({ ...formData, objectifs: text })}
                  placeholder="Quels sont vos objectifs ? (ex: Triathlon olympique, améliorer endurance...)"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  textAlignVertical="top"
                  onFocus={handleInputFocus}
                  onSubmitEditing={() => focusNextInput("echeance")}
                  accessibilityLabel="Objectifs sportifs"
                  autoCapitalize="sentences"
                />
              </View>

              {/* Échéance et heures dispo row */}
              <View style={[evaluationInitialeStyles.inputGroup, { marginBottom: 8 }]}>
                <Text style={evaluationInitialeStyles.label}>
                  Planning <Text style={evaluationInitialeStyles.required}>*</Text>
                </Text>
                <View style={evaluationInitialeStyles.row}>
                  <View style={[evaluationInitialeStyles.col, { marginRight: 10 }]}>
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current["echeance"] = ref;
                      }}
                      style={evaluationInitialeStyles.input}
                      value={formData.echeance}
                      onChangeText={(text) => setFormData({ ...formData, echeance: text })}
                      placeholder="Échéance (ex: 6 mois)"
                      placeholderTextColor="#999"
                      returnKeyType="next"
                      onFocus={handleInputFocus}
                      onSubmitEditing={() => focusNextInput("nb_heure_dispo")}
                      accessibilityLabel="Échéance"
                      autoCapitalize="sentences"
                    />
                  </View>
                  <View style={evaluationInitialeStyles.col}>
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current["nb_heure_dispo"] = ref;
                      }}
                      style={evaluationInitialeStyles.input}
                      value={formData.nb_heure_dispo}
                      onChangeText={(text) => setFormData({ ...formData, nb_heure_dispo: text })}
                      placeholder="Heures/semaine"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      returnKeyType="next"
                      onFocus={handleInputFocus}
                      onSubmitEditing={() => focusNextInput("vo2max")}
                      accessibilityLabel="Nombre d'heures disponibles par semaine"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>

              {/* Toggle advanced */}
              <Pressable
                onPress={() => setShowAdvanced((s) => !s)}
                style={evaluationInitialeStyles.advancedToggle}
                accessibilityRole="button"
                accessibilityLabel="Afficher ou masquer les tests physiques"
              >
                <FontAwesome
                  name={showAdvanced ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="#1976D2"
                  style={{ marginRight: 6 }}
                />
                <Text style={evaluationInitialeStyles.advancedToggleText}>
                  {showAdvanced ? "Masquer les tests physiques" : "Afficher les tests physiques (optionnel)"}
                </Text>
              </Pressable>

              {showAdvanced && (
                <>
                  {/* Tests cardiorespiratoires */}
                  <View style={evaluationInitialeStyles.inputGroup}>
                    <Text style={evaluationInitialeStyles.sectionTitle}>Tests cardiorespiratoires</Text>
                    
                    <View style={evaluationInitialeStyles.row}>
                      <View style={[evaluationInitialeStyles.col, { marginRight: 10 }]}>
                        <Text style={evaluationInitialeStyles.label}>VO2 Max</Text>
                        <TextInput
                          ref={(ref) => {
                            inputRefs.current["vo2max"] = ref;
                          }}
                          style={evaluationInitialeStyles.input}
                          value={formData.vo2max}
                          onChangeText={(text) => setFormData({ ...formData, vo2max: text.replace(/[^\d.,]/g, "") })}
                          placeholder="ml/kg/min"
                          placeholderTextColor="#999"
                          keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                          returnKeyType="next"
                          onFocus={handleInputFocus}
                          onSubmitEditing={() => focusNextInput("freq_repo")}
                          accessibilityLabel="VO2 Max"
                          autoCapitalize="none"
                        />
                      </View>
                      <View style={evaluationInitialeStyles.col}>
                        <Text style={evaluationInitialeStyles.label}>Test Cooper</Text>
                        <TextInput
                          ref={(ref) => {
                            inputRefs.current["cooper"] = ref;
                          }}
                          style={evaluationInitialeStyles.input}
                          value={formData.cooper}
                          onChangeText={(text) => setFormData({ ...formData, cooper: text.replace(/[^\d.,]/g, "") })}
                          placeholder="Distance (m)"
                          placeholderTextColor="#999"
                          keyboardType="numeric"
                          returnKeyType="next"
                          onFocus={handleInputFocus}
                          onSubmitEditing={() => focusNextInput("vma")}
                          accessibilityLabel="Test Cooper en mètres"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    <View style={evaluationInitialeStyles.row}>
                      <View style={[evaluationInitialeStyles.col, { marginRight: 10 }]}>
                        <Text style={evaluationInitialeStyles.label}>Fréq. repos</Text>
                        <TextInput
                          ref={(ref) => {
                            inputRefs.current["freq_repo"] = ref;
                          }}
                          style={evaluationInitialeStyles.input}
                          value={formData.freq_repo}
                          onChangeText={(text) => setFormData({ ...formData, freq_repo: text.replace(/[^\d]/g, "") })}
                          placeholder="bpm"
                          placeholderTextColor="#999"
                          keyboardType="numeric"
                          returnKeyType="next"
                          onFocus={handleInputFocus}
                          onSubmitEditing={() => focusNextInput("freq_max")}
                          accessibilityLabel="Fréquence cardiaque de repos"
                          autoCapitalize="none"
                        />
                      </View>
                      <View style={evaluationInitialeStyles.col}>
                        <Text style={evaluationInitialeStyles.label}>Fréq. max</Text>
                        <TextInput
                          ref={(ref) => {
                            inputRefs.current["freq_max"] = ref;
                          }}
                          style={evaluationInitialeStyles.input}
                          value={formData.freq_max}
                          onChangeText={(text) => setFormData({ ...formData, freq_max: text.replace(/[^\d]/g, "") })}
                          placeholder="bpm"
                          placeholderTextColor="#999"
                          keyboardType="numeric"
                          returnKeyType="next"
                          onFocus={handleInputFocus}
                          onSubmitEditing={() => focusNextInput("vma")}
                          accessibilityLabel="Fréquence cardiaque maximale"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  </View>

                  {/* VMA */}
                  <View style={evaluationInitialeStyles.inputGroup}>
                    <Text style={evaluationInitialeStyles.label}>VMA (Vitesse Maximale Aérobie)</Text>
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current["vma"] = ref;
                      }}
                      style={evaluationInitialeStyles.input}
                      value={formData.vma}
                      onChangeText={(text) => setFormData({ ...formData, vma: text.replace(/[^\d.,]/g, "") })}
                      placeholder="km/h (ex: 15.5)"
                      placeholderTextColor="#999"
                      keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                      returnKeyType="next"
                      onFocus={handleInputFocus}
                      onSubmitEditing={() => focusNextInput("ftp_cyclisme")}
                      accessibilityLabel="VMA en kilomètres par heure"
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Tests par discipline */}
                  <View style={evaluationInitialeStyles.inputGroup}>
                    <Text style={evaluationInitialeStyles.sectionTitle}>Tests par discipline</Text>
                    
                    <Text style={evaluationInitialeStyles.label}>FTP Cyclisme</Text>
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current["ftp_cyclisme"] = ref;
                      }}
                      style={evaluationInitialeStyles.input}
                      value={formData.ftp_cyclisme}
                      onChangeText={(text) => setFormData({ ...formData, ftp_cyclisme: text.replace(/[^\d]/g, "") })}
                      placeholder="Watts (ex: 250)"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      returnKeyType="next"
                      onFocus={handleInputFocus}
                      onSubmitEditing={() => focusNextInput("seuil_natation")}
                      accessibilityLabel="FTP Cyclisme en watts"
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Seuils */}
                  <View style={evaluationInitialeStyles.inputGroup}>
                    <Text style={evaluationInitialeStyles.sectionTitle}>Allures seuil</Text>
                    
                    <Text style={evaluationInitialeStyles.label}>Seuil Natation</Text>
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current["seuil_natation"] = ref;
                      }}
                      style={evaluationInitialeStyles.input}
                      value={formData.seuil_natation}
                      onChangeText={(text) => setFormData({ ...formData, seuil_natation: text })}
                      placeholder="min/100m (ex: 1:30)"
                      placeholderTextColor="#999"
                      returnKeyType="next"
                      onFocus={handleInputFocus}
                      onSubmitEditing={() => focusNextInput("seuil_cyclisme")}
                      accessibilityLabel="Seuil natation"
                      autoCapitalize="none"
                    />

                    <Text style={evaluationInitialeStyles.label}>Seuil Cyclisme</Text>
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current["seuil_cyclisme"] = ref;
                      }}
                      style={evaluationInitialeStyles.input}
                      value={formData.seuil_cyclisme}
                      onChangeText={(text) => setFormData({ ...formData, seuil_cyclisme: text })}
                      placeholder="km/h (ex: 35)"
                      placeholderTextColor="#999"
                      keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                      returnKeyType="next"
                      onFocus={handleInputFocus}
                      onSubmitEditing={() => focusNextInput("seuil_course")}
                      accessibilityLabel="Seuil cyclisme"
                      autoCapitalize="none"
                    />

                    <Text style={evaluationInitialeStyles.label}>Seuil Course à pied</Text>
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current["seuil_course"] = ref;
                      }}
                      style={evaluationInitialeStyles.input}
                      value={formData.seuil_course}
                      onChangeText={(text) => setFormData({ ...formData, seuil_course: text })}
                      placeholder="min/km (ex: 4:30)"
                      placeholderTextColor="#999"
                      returnKeyType="next"
                      onFocus={handleInputFocus}
                      onSubmitEditing={() => focusNextInput("commentaire")}
                      accessibilityLabel="Seuil course à pied"
                      autoCapitalize="none"
                    />
                  </View>
                </>
              )}

              {/* Commentaire libre */}
              <View style={evaluationInitialeStyles.inputGroup}>
                <Text style={evaluationInitialeStyles.label}>Commentaire</Text>
                <TextInput
                  ref={(ref) => {
                    inputRefs.current["commentaire"] = ref;
                  }}
                  style={[evaluationInitialeStyles.input, evaluationInitialeStyles.textArea]}
                  value={formData.commentaire}
                  onChangeText={(text) => setFormData({ ...formData, commentaire: text })}
                  placeholder="Informations supplémentaires, préférences d'entraînement..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  onFocus={handleInputFocus}
                  accessibilityLabel="Commentaire libre"
                  autoCapitalize="sentences"
                />
              </View>

              {/* Buttons */}
              <View style={evaluationInitialeStyles.buttonContainer}>
                <Pressable
                  style={[
                    evaluationInitialeStyles.submitButton,
                    (!isValid || isSubmitting) && { opacity: 0.6 },
                  ]}
                  onPress={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel="Créer l'évaluation initiale"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <FontAwesome
                        name="check"
                        size={20}
                        color="white"
                        style={evaluationInitialeStyles.buttonIcon}
                      />
                      <Text style={evaluationInitialeStyles.submitButtonText}>Créer l'évaluation initiale</Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  style={evaluationInitialeStyles.cancelButton}
                  onPress={() => router.back()}
                  accessibilityRole="button"
                  accessibilityLabel="Annuler"
                >
                  <FontAwesome
                    name="times"
                    size={20}
                    color="white"
                    style={evaluationInitialeStyles.buttonIcon}
                  />
                  <Text style={evaluationInitialeStyles.cancelButtonText}>Annuler</Text>
                </Pressable>
              </View>

              <View style={evaluationInitialeStyles.bottomSpacer} />
            </View>
          </KeyboardAwareScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}