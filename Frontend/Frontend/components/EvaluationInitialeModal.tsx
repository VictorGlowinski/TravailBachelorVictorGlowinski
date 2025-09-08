// components/EvaluationInitialeModal.tsx - VERSION COMPLÈTE AVEC AUTHENTIFICATION

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
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { evaluationInitialeStyles } from '@/styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPut, apiDelete } from '@/utils/apiHelper'; // ✅ UTILISER les helpers authentifiés

interface EvaluationInitialeModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function EvaluationInitialeModal({ visible, onClose, userId }: EvaluationInitialeModalProps) {
  const { user, isAuthenticated, logout, token } = useAuth(); // ✅ UTILISER le contexte d'auth
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tempDate, setTempDate] = useState<Date | null>(null);
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

  // ✅ VÉRIFICATION d'authentification
  useEffect(() => {
    if (visible && !isAuthenticated) {
      Alert.alert(
        "Non authentifié", 
        "Vous devez être connecté pour consulter votre évaluation",
        [
          { 
            text: "Se connecter", 
            onPress: () => onClose() 
          }
        ]
      );
      return;
    }

    // ✅ VÉRIFIER que l'utilisateur peut accéder à cette évaluation
    if (visible && userId && user && userId !== user.id.toString()) {
      Alert.alert(
        "Accès refusé", 
        "Vous ne pouvez consulter que votre propre évaluation",
        [
          { 
            text: "OK", 
            onPress: () => onClose() 
          }
        ]
      );
      return;
    }
  }, [visible, isAuthenticated, userId, user]);

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
      // Si c'est au format YYYY-MM-DD
      if (dateString.includes('-') && dateString.length === 10) {
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
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate && event.type !== 'dismissed') {
        setSelectedDate(selectedDate);
        setFormData(prev => ({ 
          ...prev, 
          echeance: formatDate(selectedDate) 
        }));
      }
    } else {
      if (selectedDate && event.type !== 'dismissed') {
        setTempDate(selectedDate);
      } else if (event.type === 'dismissed') {
        setShowDatePicker(false);
        setTempDate(null);
      }
    }
  };

  // ✅ CONFIRMER la date (iOS)
  const confirmDate = () => {
    if (tempDate) {
      setSelectedDate(tempDate);
      setFormData(prev => ({ 
        ...prev, 
        echeance: formatDate(tempDate) 
      }));
    }
    setShowDatePicker(false);
    setTempDate(null);
  };

  // ✅ ANNULER la sélection de date
  const cancelDateSelection = () => {
    setShowDatePicker(false);
    setTempDate(null);
  };

  // ✅ CHARGER les données avec authentification
  const loadEvaluationData = async () => {
    if (!userId || !isAuthenticated) {
      console.log('❌ Utilisateur non authentifié ou userId manquant');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('📡 Chargement évaluation pour userId:', userId);

      // ✅ UTILISER apiGet qui gère l'authentification automatiquement
      const data = await apiGet(`/evaluation-initiale/user/${userId}`);
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
    } catch (error) {
      console.error('❌ Erreur chargement évaluation:', error);
      
      // ✅ GESTION D'ERREURS SPÉCIFIQUE
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as any).message === "string" &&
        (error as any).message.includes('Session expirée')
      ) {
        Alert.alert(
          'Session expirée', 
          'Votre session a expiré. Veuillez vous reconnecter.',
          [
            { 
              text: "Se reconnecter", 
              onPress: () => {
                logout();
                onClose();
              }
            }
          ]
        );
        return;
      }
      
      Alert.alert("Erreur", "Impossible de charger les données de l'évaluation");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ SAUVEGARDER avec authentification
  const saveChanges = async () => {
    if (!userId || !evaluationId || !isAuthenticated) {
      Alert.alert("Erreur", "Données manquantes pour la sauvegarde");
      return;
    }
    
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
        eva_vo2max: formData.vo2max ? parseFloat(formData.vo2max) : null,
        eva_freq_repos: formData.freq_repos ? parseInt(formData.freq_repos, 10) : null,
        eva_freq_max: formData.freq_max ? parseInt(formData.freq_max, 10) : null,
        eva_ftp_cyclisme: formData.ftp_cyclisme ? parseInt(formData.ftp_cyclisme, 10) : null,
        eva_vma: formData.vma ? parseFloat(formData.vma) : null,
        eva_cooper: formData.cooper || null,
        eva_seuil_natation: formData.seuil_natation || null,
        eva_seuil_cyclisme: formData.seuil_cyclisme || null,
        eva_seuil_course: formData.seuil_course || null,
        eva_echeance: echeanceForAPI, // ✅ UTILISER le format converti
        eva_nb_heure_dispo: formData.nb_heure_dispo ? parseInt(formData.nb_heure_dispo, 10) : null,
        eva_commentaire: formData.commentaire || null,
        eva_objectif: formData.objectif || null,
        eva_exp_triathlon: formData.exp_triathlon || null,
      };

      console.log('📤 Sauvegarde évaluation:', evaluationData);

      // ✅ UTILISER apiPut qui gère l'authentification automatiquement
      const result = await apiPut(`/evaluation-initiale/${evaluationId}`, evaluationData);
      console.log('✅ Évaluation mise à jour:', result);

      Alert.alert("Succès", "Évaluation mise à jour avec succès !", [
        { text: "OK", onPress: () => setMode('view') }
      ]);
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      
      // ✅ GESTION D'ERREURS SPÉCIFIQUE
      let errorMessage = "Impossible de sauvegarder l'évaluation. Veuillez réessayer.";
      
      if (typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string") {
        if ((error as any).message.includes('Session expirée')) {
          errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
          Alert.alert(
            'Session expirée', 
            errorMessage,
            [
              { 
                text: "Se reconnecter", 
                onPress: () => {
                  logout();
                  onClose();
                }
              }
            ]
          );
          return;
        } else if ((error as any).message.includes('403')) {
          errorMessage = "Vous n'avez pas l'autorisation de modifier cette évaluation.";
        }
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Charger quand le modal s'ouvre
  useEffect(() => {
    if (visible && userId && isAuthenticated) {
      loadEvaluationData();
      setMode('view');
    }
  }, [visible, userId, isAuthenticated]);

  const handleClose = () => {
    setMode('view');
    onClose();
  };

  // ✅ FONCTION DE SUPPRESSION avec authentification
  const deleteEvaluation = async () => {
    if (!userId || !evaluationId || !isAuthenticated) {
      Alert.alert("Erreur", "Données manquantes pour la suppression");
      return;
    }
    
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
              console.log('🗑️ Suppression évaluation:', evaluationId);

              // ✅ UTILISER apiDelete qui gère l'authentification automatiquement
              await apiDelete(`/evaluation-initiale/${evaluationId}`);
              console.log('✅ Évaluation supprimée avec succès');

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
            } catch (error) {
              console.error('❌ Erreur suppression:', error);
              
              // ✅ GESTION D'ERREURS SPÉCIFIQUE
              let errorMessage = "Impossible de supprimer l'évaluation. Veuillez réessayer.";
              
              if (
                typeof error === "object" &&
                error !== null &&
                "message" in error &&
                typeof (error as any).message === "string" &&
                (error as any).message.includes('Session expirée')
              ) {
                errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
                Alert.alert(
                  'Session expirée', 
                  errorMessage,
                  [
                    { 
                      text: "Se reconnecter", 
                      onPress: () => {
                        logout();
                        onClose();
                      }
                    }
                  ]
                );
                return;
              } else if (
                typeof error === "object" &&
                error !== null &&
                "message" in error &&
                typeof (error as any).message === "string" &&
                (error as any).message.includes('403')
              ) {
                errorMessage = "Vous n'avez pas l'autorisation de supprimer cette évaluation.";
              }
              
              Alert.alert("Erreur", errorMessage);
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  // ✅ VÉRIFICATION d'authentification au niveau du composant
  if (!isAuthenticated) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
          }}>
            <FontAwesome name="lock" size={50} color="#ccc" style={{ marginBottom: 20 }} />
            <Text style={{ 
              fontSize: 18, 
              textAlign: 'center', 
              marginBottom: 20,
              color: '#333' 
            }}>
              Vous devez être connecté pour consulter votre évaluation
            </Text>
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: '#007AFF',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Fermer</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        
        {/* ✅ HEADER MODERNISÉ avec bouton supprimer */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
          backgroundColor: '#f8f9fa',
        }}>
          <Pressable onPress={handleClose}>
            <FontAwesome name="times" size={20} color="#007AFF" />
          </Pressable>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              {mode === 'view' ? 'Consultation' : 'Modification'} évaluation
            </Text>
            {/* ✅ AFFICHER l'utilisateur */}
            {user && (
              <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                {user.email}
              </Text>
            )}
          </View>
          
          {/* ✅ BOUTONS d'action */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            {/* Bouton Supprimer - visible uniquement en mode view */}
            {mode === 'view' && (
              <Pressable 
                onPress={deleteEvaluation}
                disabled={isDeleting || isSaving}
                style={{
                  opacity: (isDeleting || isSaving) ? 0.5 : 1
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

        {/* ✅ CONTENU avec état de chargement */}
        {(isLoading || isDeleting) ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ marginTop: 10, color: '#666' }}>
              {isLoading ? 'Chargement de votre évaluation...' : 'Suppression en cours...'}
            </Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1, padding: 20 }}>
            
            {/* ✅ OBJECTIFS ET EXPÉRIENCE */}
<View style={{ marginBottom: 25 }}>
  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>
    Objectifs et Expérience
  </Text>
  
  <View style={{ marginBottom: 15 }}>
    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Objectif</Text>
    <TextInput
      style={{
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
        minHeight: 80,
        textAlignVertical: 'top',
      }}
      value={formData.objectif}
      onChangeText={(text) => setFormData(prev => ({ ...prev, objectif: text }))}
      placeholder="Vos objectifs sportifs"
      multiline
      editable={mode === 'edit'}
    />
  </View>

  {/* ✅ EXPÉRIENCE TRIATHLON AVEC CHIPS */}
  <View style={{ marginBottom: 15 }}>
    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Expérience Triathlon</Text>
    
    {mode === 'edit' ? (
      // ✅ MODE ÉDITION - Chips sélectionnables
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 8
      }}>
        {(["Débutant", "Intermédiaire", "Avancé", "Expert"] as const).map((level) => {
          const selected = formData.exp_triathlon === level;
          return (
            <Pressable
              key={level}
              onPress={() => 
                setFormData(prev => ({ 
                  ...prev, 
                  exp_triathlon: selected ? "" : level 
                }))
              }
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selected ? '#007AFF' : '#f0f0f0',
                borderWidth: 1,
                borderColor: selected ? '#007AFF' : '#ddd',
                minWidth: 80,
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: selected ? 'white' : '#333',
                fontSize: 14,
                fontWeight: selected ? 'bold' : 'normal'
              }}>
                {level}
              </Text>
            </Pressable>
          );
        })}
      </View>
    ) : (
      // ✅ MODE CONSULTATION - TextInput désactivé avec style amélioré
      <View style={{
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f5f5f5',
      }}>
        <Text style={{
          color: formData.exp_triathlon ? '#333' : '#999',
          fontSize: 16
        }}>
          {formData.exp_triathlon || 'Non renseigné'}
        </Text>
      </View>
    )}
  </View>
</View>
            {/* ✅ PLANNING */}
            <View style={{ marginBottom: 25 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>
                Planning
              </Text>
              
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
                      padding: 12,
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
                      padding: 12,
                      backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                    }}
                    value={formData.nb_heure_dispo}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, nb_heure_dispo: text.replace(/[^\d]/g, "") }))}
                    placeholder="Heures/semaine"
                    keyboardType="numeric"
                    editable={mode === 'edit'}
                  />
                </View>
              </View>
            </View>

            {/* ✅ TESTS PHYSIQUES */}
            <View style={{ marginBottom: 25 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>
                Tests Physiques
              </Text>
              
              {/* Tests cardiorespiratoires */}
              <View style={{ flexDirection: 'row', gap: 15, marginBottom: 15 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>VO2 Max</Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                    }}
                    value={formData.vo2max}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, vo2max: text.replace(/[^\d.,]/g, "") }))}
                    placeholder="ml/kg/min"
                    keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                    editable={mode === 'edit'}
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Test Cooper</Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                    }}
                    value={formData.cooper}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, cooper: text.replace(/[^\d.,]/g, "") }))}
                    placeholder="Distance (m)"
                    keyboardType="numeric"
                    editable={mode === 'edit'}
                  />
                </View>
              </View>

              {/* Fréquences cardiaques */}
              <View style={{ flexDirection: 'row', gap: 15, marginBottom: 15 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>FC repos</Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                    }}
                    value={formData.freq_repos}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, freq_repos: text.replace(/[^\d]/g, "") }))}
                    placeholder="bpm"
                    keyboardType="numeric"
                    editable={mode === 'edit'}
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>FC max</Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                    }}
                    value={formData.freq_max}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, freq_max: text.replace(/[^\d]/g, "") }))}
                    placeholder="bpm"
                    keyboardType="numeric"
                    editable={mode === 'edit'}
                  />
                </View>
              </View>

              {/* VMA et FTP */}
              <View style={{ flexDirection: 'row', gap: 15, marginBottom: 15 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>VMA</Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                    }}
                    value={formData.vma}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, vma: text.replace(/[^\d.,]/g, "") }))}
                    placeholder="km/h"
                    keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                    editable={mode === 'edit'}
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>FTP Cyclisme</Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                    }}
                    value={formData.ftp_cyclisme}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, ftp_cyclisme: text.replace(/[^\d]/g, "") }))}
                    placeholder="Watts"
                    keyboardType="numeric"
                    editable={mode === 'edit'}
                  />
                </View>
              </View>
            </View>

            {/* ✅ SEUILS PAR DISCIPLINE */}
            <View style={{ marginBottom: 25 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>
                Allures Seuil
              </Text>
              
              {[
                { label: "Seuil Natation", key: "seuil_natation", placeholder: "min/100m (ex: 1:30)" },
                { label: "Seuil Cyclisme", key: "seuil_cyclisme", placeholder: "km/h (ex: 35)" },
                { label: "Seuil Course", key: "seuil_course", placeholder: "min/km (ex: 4:30)" },
              ].map(({ label, key, placeholder }) => (
                <View key={key} style={{ marginBottom: 15 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{label}</Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                    }}
                    value={formData[key as keyof typeof formData]}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
                    placeholder={placeholder}
                    editable={mode === 'edit'}
                  />
                </View>
              ))}
            </View>

            {/* ✅ COMMENTAIRES */}
            <View style={{ marginBottom: 25 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>
                Commentaires
              </Text>
              
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                }}
                value={formData.commentaire}
                onChangeText={(text) => setFormData(prev => ({ ...prev, commentaire: text }))}
                placeholder="Informations supplémentaires, préférences..."
                multiline
                editable={mode === 'edit'}
              />
            </View>

            {/* ✅ SECTION DANGER en bas du formulaire */}
            {mode === 'view' && (
              <View style={{ 
                backgroundColor: '#fff3f3', 
                padding: 15, 
                borderRadius: 8, 
                marginBottom: 20,
                borderLeftWidth: 4,
                borderLeftColor: '#e74c3c'
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#e74c3c', marginBottom: 10 }}>
                  Zone de danger
                </Text>
                <Pressable
                  onPress={deleteEvaluation}
                  disabled={isDeleting}
                  style={{
                    backgroundColor: '#e74c3c',
                    padding: 12,
                    borderRadius: 6,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    opacity: isDeleting ? 0.5 : 1
                  }}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <FontAwesome name="trash" size={16} color="white" />
                      <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>
                        Supprimer l'évaluation
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}

            <View style={{ height: 50 }} />
          </ScrollView>
        )}

        {/* ✅ DateTimePicker avec contrôle iOS/Android */}
        {showDatePicker && (
          <>
            {Platform.OS === 'ios' && (
              <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderTopColor: '#ddd',
              }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ddd'
                }}>
                  <Pressable onPress={cancelDateSelection}>
                    <Text style={{ color: '#e74c3c', fontSize: 16 }}>Annuler</Text>
                  </Pressable>
                  
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Sélectionner une date</Text>
                  
                  <Pressable onPress={confirmDate}>
                    <Text style={{ color: '#007AFF', fontSize: 16, fontWeight: 'bold' }}>OK</Text>
                  </Pressable>
                </View>
                
                <DateTimePicker
                  value={tempDate || selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                  maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
                  locale="fr-FR"
                />
              </View>
            )}
            
            {Platform.OS === 'android' && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
                maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
                locale="fr-FR"
              />
            )}
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}