// app/(tabs)/creationAnamnese.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { anamneseStyles } from "@/styles";

const API_BASE_URL = "http://192.168.0.112:8000/api";

export default function CreationAnamneseScreen() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    age: "",
    blessures: "",
    etat_actuel: "",
    sexe: "",
    poids_kg: "",
    taille_cm: "",
    imc: "",
    contrainte_pro: "",
    contrainte_fam: "",
    exp_sportive: "",
    objectif: "",
    commentaire: "",
    traitement: "",
    diagnostics: "",
  });

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

  // Validation des champs obligatoires
  const validateForm = () => {
    const requiredFields = [
      { key: 'sexe', label: 'Sexe' },
      { key: 'poids_kg', label: 'Poids' },
      { key: 'taille_cm', label: 'Taille' },
      { key: 'etat_actuel', label: 'État actuel' },
      { key: 'objectif', label: 'Objectifs' },
    ];

    for (const field of requiredFields) {
      if (!formData[field.key as keyof typeof formData]?.trim()) {
        Alert.alert("Champ manquant", `Le champ "${field.label}" est obligatoire.`);
        return false;
      }
    }
    return true;
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!currentUserId) {
      Alert.alert("Erreur", "Utilisateur non identifié");
      return;
    }

    setIsLoading(true);
    try {
      const anamneseData = {
        ana_user_id: parseInt(currentUserId, 10),
        ana_imc: calculateBMI(),
        ana_blessures: formData.blessures,
        ana_etat_actuel: formData.etat_actuel,
        ana_sexe: formData.sexe,
        ana_poids_kg: formData.poids_kg,
        ana_taille_cm: formData.taille_cm,
        ana_age: formData.age,
        ana_contrainte_pro: formData.contrainte_pro,
        ana_contrainte_fam: formData.contrainte_fam,
        ana_exp_sportive: formData.exp_sportive,
        ana_objectif: formData.objectif,
        ana_commentaire: formData.commentaire,
        ana_traitement: formData.traitement,
        ana_diagnostics: formData.diagnostics
      };

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
        await AsyncStorage.removeItem(`anamnese_draft_${currentUserId}`);
        
        Alert.alert(
          "Succès", 
          "Anamnèse créée avec succès !",
          [{ text: "OK", onPress: () => router.push("/(tabs)/profil") }]
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

  // Sauvegarder en brouillon
  const saveDraft = async () => {
    if (!currentUserId) return;
    try {
      await AsyncStorage.setItem(
        `anamnese_draft_${currentUserId}`,
        JSON.stringify(formData)
      );
    } catch (error) {
      console.error("Erreur sauvegarde brouillon:", error);
    }
  };

  // Charger le brouillon
  useEffect(() => {
    const loadDraft = async () => {
      if (!currentUserId) return;
      try {
        const draft = await AsyncStorage.getItem(`anamnese_draft_${currentUserId}`);
        if (draft) {
          setFormData(JSON.parse(draft));
        }
      } catch (error) {
        console.error("Erreur chargement brouillon:", error);
      }
    };
    loadDraft();
  }, [currentUserId]);

  // Sauvegarder automatiquement
  useEffect(() => {
    saveDraft();
  }, [formData]);

  // Render des champs de saisie
  const renderField = (label: string, key: keyof typeof formData, multiline = false, required = false) => (
    <View style={anamneseStyles.inputGroup}>
      <Text style={anamneseStyles.label}>
        {label} {required && <Text style={{ color: 'red' }}>*</Text>}
      </Text>
      <TextInput
        style={[anamneseStyles.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
        value={formData[key]}
        onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
        placeholder={`Saisir ${label.toLowerCase()}`}
        placeholderTextColor="#b49f9fff"
        multiline={multiline}
      />
    </View>
  );

  // Render des chips pour le sexe
  const renderSexeChips = () => (
    <View style={anamneseStyles.inputGroup}>
      <Text style={anamneseStyles.label}>
        Sexe <Text style={{ color: 'red' }}>*</Text>
      </Text>
      <View style={anamneseStyles.chipsRow}>
        {["Masculin", "Féminin", "Autre"].map((option) => (
          <Pressable
            key={option}
            onPress={() => setFormData(prev => ({ 
              ...prev, 
              sexe: formData.sexe === option ? "" : option 
            }))}
            style={[
              anamneseStyles.chip,
              formData.sexe === option && anamneseStyles.chipSelected
            ]}
          >
            <Text style={[
              anamneseStyles.chipText,
              formData.sexe === option && anamneseStyles.chipTextSelected
            ]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={anamneseStyles.container}>
      <View style={anamneseStyles.content}>
        
        {/* Header */}
        <View style={anamneseStyles.header}>
          <Pressable onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={24} color="#007AFF" />
          </Pressable>
          <Text style={anamneseStyles.title}>Création d'anamnèse</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Informations personnelles */}
        <Text style={anamneseStyles.sectionTitle}>Informations personnelles</Text>
        <Text>Debug {JSON.stringify(currentUserId)}, {JSON.stringify(formData)}</Text>
        {renderSexeChips()}
        
        <View style={anamneseStyles.row}>
          <View style={[anamneseStyles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={anamneseStyles.label}>
              Poids (kg) <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              style={anamneseStyles.input}
              value={formData.poids_kg}
              onChangeText={(text) => setFormData(prev => ({ ...prev, poids_kg: text.replace(/[^\d.,]/g, "") }))}
              placeholder="Poids"
              placeholderTextColor="#b49f9fff"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[anamneseStyles.inputGroup, { flex: 1 }]}>
            <Text style={anamneseStyles.label}>
              Taille (cm) <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              style={anamneseStyles.input}
              value={formData.taille_cm}
              onChangeText={(text) => setFormData(prev => ({ ...prev, taille_cm: text.replace(/[^\d.,]/g, "") }))}
              placeholder="Taille"
              placeholderTextColor="#b49f9fff"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* IMC */}
        {formData.imc && (
          <View style={anamneseStyles.imcContainer}>
            <Text style={anamneseStyles.imcText}>IMC calculé: {formData.imc}</Text>
          </View>
        )}

        {/* Informations médicales */}
        <Text style={anamneseStyles.sectionTitle}>Informations médicales</Text>
        {renderField("Antécédents médicaux/Diagnostics", "diagnostics", true)}
        {renderField("Blessures actuelles", "blessures", true)}
        {renderField("Traitements en cours", "traitement", true)}

        {/* Activité sportive */}
        <Text style={anamneseStyles.sectionTitle}>Activité sportive</Text>
        {renderField("Expérience sportive", "exp_sportive", true)}
        {renderField("État actuel", "etat_actuel", true, true)}
        {renderField("Objectifs sportifs", "objectif", true, true)}

        {/* ✅ TOUS LES CHAMPS MAINTENANT VISIBLES */}
        <Text style={anamneseStyles.sectionTitle}>Contraintes</Text>
        {renderField("Contraintes professionnelles", "contrainte_pro", true)}
        {renderField("Contraintes familiales", "contrainte_fam", true)}
        {renderField("Commentaire libre", "commentaire", true)}

        {/* Bouton de soumission */}
        <Pressable
          style={[
            anamneseStyles.submitButton,
            isLoading && { opacity: 0.7 }
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <FontAwesome name="check" size={20} color="#fff" />
              <Text style={anamneseStyles.submitButtonText}>Créer l'anamnèse</Text>
            </>
          )}
        </Pressable>

        <View style={{ height: 50 }} />
      </View>
    </ScrollView>
  );
}