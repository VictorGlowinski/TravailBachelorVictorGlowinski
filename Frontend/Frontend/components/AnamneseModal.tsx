// components/AnamneseModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { anamneseStyles } from '@/styles';

interface AnamneseModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string | null;
}

const API_BASE_URL = "http://192.168.0.112:8000/api";

export default function AnamneseModal({ visible, onClose, userId }: AnamneseModalProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [anamneseId, setAnamneseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    commentaire: "",
    traitement: "",
    diagnostics: "",
  });

  // Calculer IMC
  const calculateBMI = () => {
    const poids = parseFloat(formData.poids_kg.replace(',', '.'));
    const taille = parseFloat(formData.taille_cm.replace(',', '.')) / 100;
    
    if (poids && taille) {
      const bmi = poids / (taille * taille);
      return bmi.toFixed(1);
    }
    return "";
  };

  // components/AnamneseModal.tsx - VERSION SIMPLIFIÉE avec même logique que profil

// Charger les données
const loadAnamneseData = async () => {
  if (!userId) return;
  
  setIsLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/anamnese/user/${userId}`);
    if (response.status === 200) {
      const data = await response.json();
      console.log('📋 Modal - Données reçues:', data);
      
      // ✅ MÊME LOGIQUE que dans profil.tsx
      const anamnese = Array.isArray(data) ? data[0] : 
                     data?.anamnese?.[0] || data?.anamnese || data;
      
      if (anamnese?.ana_id) {
        console.log('✅ Chargement anamnèse ID:', anamnese.ana_id);
        setAnamneseId(anamnese.ana_id.toString());
        setFormData({
          age: anamnese.ana_age?.toString() || "",
          blessures: anamnese.ana_blessures || "",
          etat_actuel: anamnese.ana_etat_actuel || "",
          sexe: anamnese.ana_sexe || "",
          poids_kg: anamnese.ana_poids_kg?.toString() || "",
          taille_cm: anamnese.ana_taille_cm?.toString() || "",
          imc: anamnese.ana_imc?.toString() || "",
          contrainte_pro: anamnese.ana_contrainte_pro || "",
          contrainte_fam: anamnese.ana_contrainte_fam || "",
          exp_sportive: anamnese.ana_exp_sportive || "",
          commentaire: anamnese.ana_commentaire || "",
          traitement: anamnese.ana_traitement || "",
          diagnostics: anamnese.ana_diagnostics || "",
        });
      } else {
        Alert.alert("Erreur", "Aucune anamnèse trouvée");
      }
    } else {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erreur chargement:', error);
    Alert.alert("Erreur", "Impossible de charger les données");
  } finally {
    setIsLoading(false);
  }
};

  // Sauvegarder
  const saveChanges = async () => {
    if (!userId || !anamneseId) return;
    
    setIsSaving(true);
    try {
      const anamneseData = {
        ana_user_id: parseInt(userId, 10),
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
        ana_commentaire: formData.commentaire,
        ana_traitement: formData.traitement,
        ana_diagnostics: formData.diagnostics
      };

      const response = await fetch(`${API_BASE_URL}/anamnese/${anamneseId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(anamneseData),
      });

      if (response.ok) {
        Alert.alert("Succès", "Anamnèse mise à jour !", [
          { text: "OK", onPress: () => setMode('view') }
        ]);
      } else {
        throw new Error("Erreur sauvegarde");
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert("Erreur", "Impossible de sauvegarder");
    } finally {
      setIsSaving(false);
    }
  };

  // Charger quand le modal s'ouvre
  useEffect(() => {
    if (visible && userId) {
      loadAnamneseData();
      setMode('view');
    }
  }, [visible, userId]);

  // Mettre à jour l'IMC
  useEffect(() => {
    if (mode === 'edit') {
      const newIMC = calculateBMI();
      if (newIMC !== formData.imc) {
        setFormData(prev => ({ ...prev, imc: newIMC }));
      }
    }
  }, [formData.poids_kg, formData.taille_cm, mode]);

  const handleClose = () => {
    setMode('view');
    onClose();
  };

  const deleteAnamnese = async () => {
    if (!userId || !anamneseId) return;
    
    // ✅ CONFIRMATION avant suppression
    Alert.alert(
      "Supprimer l'anamnèse",
      "Êtes-vous sûr de vouloir supprimer définitivement cette anamnèse ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await fetch(`${API_BASE_URL}/anamnese/${anamneseId}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (response.ok) {
                Alert.alert(
                  "Succès", 
                  "Anamnèse supprimée avec succès !",
                  [
                    { 
                      text: "OK", 
                      onPress: () => {
                        // ✅ FERMER le modal et réinitialiser
                        setFormData({
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
                          commentaire: "",
                          traitement: "",
                          diagnostics: "",
                        });
                        setAnamneseId(null);
                        onClose();
                      }
                    }
                  ]
                );
              } else {
                throw new Error("Erreur lors de la suppression");
              }
            } catch (error) {
              console.error('❌ Erreur suppression:', error);
              Alert.alert("Erreur", "Impossible de supprimer l'anamnèse. Veuillez réessayer.");
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        
        {/* ✅ HEADER MODIFIÉ avec bouton supprimer */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
        }}>
          <Pressable onPress={handleClose}>
            <FontAwesome name="times" size={20} color="#007AFF" />
          </Pressable>
          
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            {mode === 'view' ? 'Consultation' : 'Modification'} anamnèse
          </Text>
          
          {/* ✅ BOUTONS d'action */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            {/* Bouton Supprimer - visible uniquement en mode view */}
            {mode === 'view' && (
              <Pressable 
                onPress={deleteAnamnese}
                disabled={isDeleting}
                style={{
                  opacity: isDeleting ? 0.5 : 1
                }}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#e74c3c" />
                ) : (
                  <FontAwesome name="trash" size={20} color="#e74c3c" />
                )}
              </Pressable>
            )}
            
            {/* Bouton Modifier/Sauvegarder */}
            <Pressable 
              onPress={() => {
                if (mode === 'view') {
                  setMode('edit');
                } else {
                  saveChanges();
                }
              }}
              disabled={isSaving || isDeleting}
              style={{
                opacity: (isSaving || isDeleting) ? 0.5 : 1
              }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <FontAwesome 
                  name={mode === 'view' ? 'edit' : 'check'} 
                  size={20} 
                  color="#007AFF" 
                />
              )}
            </Pressable>
          </View>
        </View>

        {/* ✅ CONTENU avec état de chargement pour suppression */}
        {(isLoading || isDeleting) ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ marginTop: 10 }}>
              {isLoading ? 'Chargement...' : 'Suppression en cours...'}
            </Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1, padding: 20 }}>
            
            {/* Sexe */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Sexe</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {["Masculin", "Féminin", "Autre"].map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      if (mode === 'edit') {
                        setFormData(prev => ({ 
                          ...prev, 
                          sexe: formData.sexe === option ? "" : option 
                        }));
                      }
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: formData.sexe === option ? '#007AFF' : '#ddd',
                      backgroundColor: formData.sexe === option ? '#007AFF' : '#fff',
                    }}
                  >
                    <Text style={{
                      color: formData.sexe === option ? '#fff' : '#333',
                    }}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Poids et Taille */}
            <View style={{ flexDirection: 'row', gap: 15, marginBottom: 20 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Poids (kg)</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                  }}
                  value={formData.poids_kg}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, poids_kg: text }))}
                  placeholder="Poids"
                  keyboardType="decimal-pad"
                  editable={mode === 'edit'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Taille (cm)</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                  }}
                  value={formData.taille_cm}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, taille_cm: text }))}
                  placeholder="Taille"
                  keyboardType="decimal-pad"
                  editable={mode === 'edit'}
                />
              </View>
            </View>

            {/* IMC */}
            {formData.imc && (
              <View style={{
                backgroundColor: '#e8f5e8',
                padding: 10,
                borderRadius: 8,
                marginBottom: 20,
                alignItems: 'center',
              }}>
                <Text style={{ fontWeight: 'bold' }}>IMC: {formData.imc}</Text>
              </View>
            )}

            {/* Autres champs */}
            {[
              { label: "Blessures", key: "blessures" },
              { label: "État actuel", key: "etat_actuel" },
              { label: "Expérience sportive", key: "exp_sportive" },
              { label: "Antécédents et diagnostics", key: "diagnostics" },
              { label: "Traitements", key: "traitement" },
            ].map(({ label, key }) => (
              <View key={key} style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{label}</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 10,
                    minHeight: 60,
                    textAlignVertical: 'top',
                    backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                  }}
                  value={formData[key as keyof typeof formData]}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
                  placeholder={`Saisir ${label.toLowerCase()}`}
                  multiline
                  editable={mode === 'edit'}
                />
              </View>
            ))}

            {/* ✅ SECTION DANGER en bas du formulaire (optionnel) */}
            {mode === 'view' && ( 
                <Pressable
                  onPress={deleteAnamnese}
                  disabled={isDeleting}
                  style={{
                    backgroundColor: '#e74c3c',
                    padding: 10,
                    borderRadius: 6,
                    alignItems: 'center',
                    opacity: isDeleting ? 0.5 : 1
                  }}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <FontAwesome name="trash" size={16} color="white" />
                      <Text style={{ color: 'white', fontWeight: 'bold', marginTop: 4 }}>
                        Supprimer l'anamnèse
                      </Text>
                    </>
                  )}
                </Pressable>
              
            )}

            <View style={{ height: 50 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}