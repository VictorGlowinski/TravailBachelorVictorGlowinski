// components/EvaluationInitialeModal.tsx
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
import { evaluationInitialeStyles } from '@/styles';
import DateTimePicker from '@react-native-community/datetimepicker';


interface EvaluationInitialeModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string | null;
}

const API_BASE_URL = "http://192.168.0.112:8000/api";

export default function EvaluationInitialeModal({ visible, onClose, userId }: EvaluationInitialeModalProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    vo2max: "",
    freq_repos: "",
    freq_max: "",
    ftp_cyclisme: "",
    vma: "",
    cooper: "",
    nb_heure_dispo: "",
    seuil_natation: "",
    seuil_cyclisme: "",
    seuil_course: "",
    commentaire: "",
    echeance: "",
    objectif: "",
    exp_triathlon: ""
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // ✅ FONCTION pour parser une date existante
  const parseDate = (dateString: string) => {
    if (!dateString) return new Date();
    try {
      // Si la date vient de la DB au format ISO
      if (dateString.includes('T')) {
        return new Date(dateString);
      }
      // Si c'est au format dd/mm/yyyy
      const [day, month, year] = dateString.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } catch (error) {
      return new Date();
    }
  };

  // ✅ GESTIONNAIRE de changement de date
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setFormData(prev => ({ 
        ...prev, 
        echeance: formatDate(selectedDate) 
      }));
    }
  };

  // Charger les données (MODIFIER pour inclure la date)
  const loadEvaluationData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/evaluation-initiale/user/${userId}`);
      if (response.status === 200) {
        const data = await response.json();
        console.log('📋 Modal Evaluation - Données reçues:', data);
        
        const evaluation = Array.isArray(data) ? data[0] : 
                         data?.evaluation?.[0] || data?.evaluation || data;
        
        if (evaluation?.eva_id) {
          console.log('✅ Chargement évaluation ID:', evaluation.eva_id);
          setEvaluationId(evaluation.eva_id.toString());
          
          // ✅ PARSER la date existante
          if (evaluation.eva_echeance) {
            const parsedDate = parseDate(evaluation.eva_echeance);
            setSelectedDate(parsedDate);
          }
          
          setFormData({
            vo2max: evaluation.eva_vo2max?.toString() || "",
            freq_repos: evaluation.eva_freq_repos?.toString() || "",
            freq_max: evaluation.eva_freq_max?.toString() || "",
            ftp_cyclisme: evaluation.eva_ftp_cyclisme?.toString() || "",
            vma: evaluation.eva_vma?.toString() || "",
            cooper: evaluation.eva_cooper?.toString() || "",
            nb_heure_dispo: evaluation.eva_nb_heure_dispo?.toString() || "",
            seuil_natation: evaluation.eva_seuil_natation || "",
            seuil_cyclisme: evaluation.eva_seuil_cyclisme || "",
            seuil_course: evaluation.eva_seuil_course || "",
            commentaire: evaluation.eva_commentaire || "",
            exp_triathlon: evaluation.eva_exp_triathlon || "",
            objectif: evaluation.eva_objectif || "",
            echeance: evaluation.eva_echeance ? formatDate(parseDate(evaluation.eva_echeance)) : "",

          });
        } else {
          Alert.alert("Erreur", "Aucune évaluation trouvée");
        }
      } else {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erreur chargement évaluation:', error);
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder
  const saveChanges = async () => {
  if (!userId || !evaluationId) return;
  
  setIsSaving(true);
  try {
    // ✅ CONVERSION de la date pour l'API
    let echeanceForAPI = null;
    if (formData.echeance) {
      // Convertir dd/mm/yyyy vers format ISO pour l'API
      const [day, month, year] = formData.echeance.split('/');
      echeanceForAPI = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const evaluationData = {
      eva_user_id: parseInt(userId, 10),
      eva_vo2max: formData.vo2max || null,
      eva_freq_repos: formData.freq_repos || null,
      eva_freq_max: formData.freq_max || null,
      eva_ftp_cyclisme: formData.ftp_cyclisme || null,
      eva_vma: formData.vma || null,
      eva_cooper: formData.cooper || null,
      eva_seuil_natation: formData.seuil_natation || null,
      eva_seuil_cyclisme: formData.seuil_cyclisme || null,
      eva_seuil_course: formData.seuil_course || null,
      eva_echeance: echeanceForAPI, // ✅ UTILISER le format converti
      eva_nb_heure_dispo: formData.nb_heure_dispo || null,
      eva_commentaire: formData.commentaire || null,
    };

    const response = await fetch(`${API_BASE_URL}/evaluation-initiale/${evaluationId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(evaluationData),
    });

    if (response.ok) {
      Alert.alert("Succès", "Évaluation mise à jour !", [
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
      loadEvaluationData();
      setMode('view');
    }
  }, [visible, userId]);

  const handleClose = () => {
    setMode('view');
    onClose();
  };

  // ✅ FONCTION DE SUPPRESSION
  const deleteEvaluation = async () => {
    if (!userId || !evaluationId) return;
    
    // ✅ CONFIRMATION avant suppression
    Alert.alert(
      "Supprimer l'évaluation initiale",
      "Êtes-vous sûr de vouloir supprimer définitivement cette évaluation ? Cette action est irréversible.",
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
              const response = await fetch(`${API_BASE_URL}/evaluation-initiale/${evaluationId}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (response.ok) {
                Alert.alert(
                  "Succès", 
                  "Évaluation supprimée avec succès !",
                  [
                    { 
                      text: "OK", 
                      onPress: () => {
                        // ✅ FERMER le modal et réinitialiser
                        setFormData({
                          vo2max: "",
                          freq_repos: "",
                          freq_max: "",
                          ftp_cyclisme: "",
                          vma: "",
                          cooper: "",
                          nb_heure_dispo: "",
                          seuil_natation: "",
                          seuil_cyclisme: "",
                          seuil_course: "",
                          objectif: "",
                          exp_triathlon: "",
                          echeance: "",
                          commentaire: "",
                        });
                        setEvaluationId(null);
                        setSelectedDate(new Date());
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
              Alert.alert("Erreur", "Impossible de supprimer l'évaluation. Veuillez réessayer.");
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
            {mode === 'view' ? 'Consultation' : 'Modification'} évaluation
          </Text>
          
          {/* ✅ BOUTONS d'action */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            {/* Bouton Supprimer - visible uniquement en mode view */}
            {mode === 'view' && (
              <Pressable 
                onPress={deleteEvaluation}
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
            
            

           <View style={{ flexDirection: 'row', gap: 15, marginBottom: 20 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Échéance</Text>
                <Pressable
                  onPress={() => {
                    if (mode === 'edit') {
                      setShowDatePicker(true);
                    }
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{
                    color: formData.echeance ? '#333' : '#999',
                  }}>
                    {formData.echeance || 'Sélectionner une date'}
                  </Text>
                  {mode === 'edit' && (
                    <FontAwesome name="calendar" size={16} color="#007AFF" />
                  )}
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Heures/semaine</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                  }}
                  value={formData.nb_heure_dispo}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, nb_heure_dispo: text }))}
                  placeholder="Heures/semaine"
                  keyboardType="numeric"
                  editable={mode === 'edit'}
                />
              </View>
            </View>

            {/* ✅ CALENDRIER DateTimePicker */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()} // Empêche de sélectionner une date passée
                locale="fr-FR"
              />
            )}

            {/* ✅ Tests physiques de base (style identique aux autres champs) */}
            {[
              { label: "VO2 Max (ml/kg/min)", key: "vo2max", keyboardType: "decimal-pad" },
              { label: "Test Cooper (m)", key: "cooper", keyboardType: "numeric" },
              { label: "Fréq. repos (bpm)", key: "freq_repos", keyboardType: "numeric" },
              { label: "Fréq. max (bpm)", key: "freq_max", keyboardType: "numeric" },
              { label: "VMA (km/h)", key: "vma", keyboardType: "decimal-pad" },
              { label: "FTP Cyclisme (Watts)", key: "ftp_cyclisme", keyboardType: "numeric" },
              { label: "Seuil Natation (min/100m)", key: "seuil_natation", keyboardType: "default" },
              { label: "Seuil Cyclisme (km/h)", key: "seuil_cyclisme", keyboardType: "default" },
              { label: "Seuil Course (min/km)", key: "seuil_course", keyboardType: "default" },
              { label: "Objectif", key: "objectif", keyboardType: "default" },
              { label: "Échéance", key: "echeance", keyboardType: "default" },
              { label: "Expérience Triathlon", key: "exp_triathlon", keyboardType: "default" },

            ].map(({ label, key, keyboardType }) => (
              <View key={key} style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{label}</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                  }}
                  value={formData[key as keyof typeof formData]}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
                  placeholder={`Saisir ${label.toLowerCase()}`}
                  keyboardType={keyboardType as any}
                  editable={mode === 'edit'}
                />
              </View>
            ))}

            {/* ✅ Champs texte longs (même style que dans Anamnèse) */}
            {[
              { label: "Commentaire", key: "commentaire" },
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
            {/* ✅ SECTION DANGER en bas du formulaire */}
            {mode === 'view' && (    
                <Pressable
                  onPress={deleteEvaluation}
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
                        Supprimer l'évaluation
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