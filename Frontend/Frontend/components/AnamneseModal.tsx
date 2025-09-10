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
import { CONFIG } from '@/constants/config';
import { apiGet, apiPut, apiDelete } from '@/utils/apiHelper'; // ✅ UTILISER les helpers authentifiés
import { useAuth } from '@/contexts/AuthContext';

interface AnamneseModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function AnamneseModal({ visible, onClose, userId }: AnamneseModalProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [anamneseId, setAnamneseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, isAuthenticated, token } = useAuth(); // ✅ UTILISER le contexte d'auth

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

  // ✅ Calculer IMC
  const calculateBMI = () => {
    const poids = parseFloat(formData.poids_kg.replace(',', '.'));
    const taille = parseFloat(formData.taille_cm.replace(',', '.')) / 100;
    
    if (poids && taille) {
      const bmi = poids / (taille * taille);
      return bmi.toFixed(1);
    }
    return "";
  };

  // ✅ Charger les données avec authentification
  const loadAnamneseData = async () => {
    if (!userId || !isAuthenticated) {
      Alert.alert("Erreur", "Vous devez être connecté pour accéder à cette fonctionnalité");
      return;
    }
    
    // ✅ VÉRIFIER que l'utilisateur accède à ses propres données
    if (user && user.id.toString() !== userId) {
      Alert.alert("Erreur", "Vous ne pouvez accéder qu'à vos propres données");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('📡 Chargement anamnèse pour userId:', userId);
      
      // ✅ UTILISER apiGet qui gère l'authentification automatiquement
      const data = await apiGet(`/anamnese/user/${userId}`);
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
        Alert.alert("Information", "Aucune anamnèse trouvée pour cet utilisateur");
        onClose(); // ✅ FERMER le modal si pas de données
      }
    } catch (error) {
      console.error('❌ Erreur chargement anamnèse:', error);
      
      // ✅ GESTION D'ERREURS SPÉCIFIQUE
      let errorMessage = "Impossible de charger les données";
      
      if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
        if ((error as any).message.includes('Session expirée')) {
          errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        } else if ((error as any).message.includes('403')) {
          errorMessage = "Vous n'avez pas l'autorisation d'accéder à ces données.";
        }
      }
      
      Alert.alert("Erreur", errorMessage);
      onClose(); // ✅ FERMER le modal en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Sauvegarder avec authentification
  const saveChanges = async () => {
  if (!userId || !anamneseId || !isAuthenticated) {
    Alert.alert("Erreur", "Impossible de sauvegarder sans authentification");
    return;
  }
  
  // ✅ VALIDATION basique améliorée
  if (!formData.sexe || !formData.poids_kg || !formData.taille_cm) {
    Alert.alert("Champs requis", "Veuillez remplir au minimum le sexe, le poids et la taille");
    return;
  }
  
  setIsSaving(true);
  try {
    // ✅ PARSING SÉCURISÉ des nombres
    const poids = parseFloat(formData.poids_kg.replace(',', '.'));
    const taille = parseFloat(formData.taille_cm.replace(',', '.'));
    const age = formData.age ? parseInt(formData.age) : null;
    
    // ✅ VALIDATION des valeurs numériques
    if (isNaN(poids) || poids <= 0) {
      Alert.alert("Erreur", "Le poids doit être un nombre valide supérieur à 0");
      return;
    }
    
    if (isNaN(taille) || taille <= 0) {
      Alert.alert("Erreur", "La taille doit être un nombre valide supérieur à 0");
      return;
    }
    
    if (age !== null && (isNaN(age) || age <= 0 || age > 150)) {
      Alert.alert("Erreur", "L'âge doit être un nombre valide entre 1 et 150");
      return;
    }

    const anamneseData = {
      ana_user_id: parseInt(userId, 10),
      ana_imc: calculateBMI(), // ✅ CALCULER l'IMC avec les nouvelles valeurs
      ana_blessures: formData.blessures || null, // ✅ GÉRER les valeurs vides
      ana_etat_actuel: formData.etat_actuel || null,
      ana_sexe: formData.sexe,
      ana_poids_kg: poids,
      ana_taille_cm: taille,
      ana_age: age,
      ana_contrainte_pro: formData.contrainte_pro || null,
      ana_contrainte_fam: formData.contrainte_fam || null,
      ana_exp_sportive: formData.exp_sportive || null,
      ana_commentaire: formData.commentaire || null,
      ana_traitement: formData.traitement || null,
      ana_diagnostics: formData.diagnostics || null
    };

    console.log('📤 Mise à jour anamnèse - Données envoyées:', anamneseData);

    // ✅ UTILISER apiPut qui gère l'authentification
    const result = await apiPut(`/anamnese/${anamneseId}`, anamneseData);
    console.log('✅ Anamnèse mise à jour - Réponse:', result);

    Alert.alert("Succès", "Anamnèse mise à jour avec succès !", [
      { text: "OK", onPress: () => setMode('view') }
    ]);
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde anamnèse:', error);
    
    // ✅ GESTION D'ERREURS AMÉLIORÉE
    let errorMessage = "Impossible de sauvegarder les modifications";
    
    if (error && typeof error === 'object' && 'message' in error) {
      const errorStr = String(error.message);
      if (errorStr.includes('Session expirée')) {
        errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
      } else if (errorStr.includes('validation')) {
        errorMessage = "Données invalides. Vérifiez vos informations.";
      } else if (errorStr.includes('422')) {
        errorMessage = "Format de données incorrect. Vérifiez les champs numériques.";
      } else if (errorStr.includes('404')) {
        errorMessage = "Anamnèse introuvable. Actualisez et réessayez.";
      }
    }
    
    Alert.alert("Erreur", errorMessage);
  } finally {
    setIsSaving(false);
  }
};

// ✅ Supprimer avec authentification
const deleteAnamnese = async () => {
  if (!userId || !anamneseId || !isAuthenticated) {
    Alert.alert("Erreur", "Impossible de supprimer sans authentification");
    return;
    }
    
    // ✅ CONFIRMATION avant suppression
    Alert.alert(
      "Supprimer l'anamnèse",
      "Êtes-vous sûr de vouloir supprimer définitivement cette anamnèse ? Cette action est irréversible.",
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
              console.log('🗑️ Suppression anamnèse:', anamneseId);

              // ✅ UTILISER apiDelete qui gère l'authentification
              const result = await apiDelete(`/anamnese/${anamneseId}`);
              console.log('✅ Anamnèse supprimée:', result);

              Alert.alert(
                "Succès", 
                "Anamnèse supprimée avec succès !",
                [
                  { 
                    text: "OK", 
                    onPress: () => {
                      // ✅ RÉINITIALISER complètement
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
                      setMode('view');
                      onClose();
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('❌ Erreur suppression anamnèse:', error);
              
              let errorMessage = "Impossible de supprimer l'anamnèse";
              
              if (
                typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as any).message === 'string' &&
                (error as any).message.includes('Session expirée')
              ) {
                errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
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

  // ✅ Charger quand le modal s'ouvre et que l'utilisateur est authentifié
  useEffect(() => {
    if (visible && userId && isAuthenticated) {
      loadAnamneseData();
      setMode('view');
    } else if (visible && !isAuthenticated) {
      Alert.alert("Non authentifié", "Veuillez vous connecter pour accéder à cette fonctionnalité");
      onClose();
    }
  }, [visible, userId, isAuthenticated]);

  // ✅ Mettre à jour l'IMC automatiquement
  useEffect(() => {
    if (mode === 'edit') {
      const newIMC = calculateBMI();
      if (newIMC !== formData.imc) {
        setFormData(prev => ({ ...prev, imc: newIMC }));
      }
    }
  }, [formData.poids_kg, formData.taille_cm, mode]);

  const handleClose = () => {
    if (mode === 'edit' && isSaving) {
      Alert.alert(
        "Sauvegarde en cours",
        "Une sauvegarde est en cours. Veuillez patienter.",
        [{ text: "OK" }]
      );
      return;
    }
    
    if (mode === 'edit') {
      Alert.alert(
        "Modifications non sauvegardées",
        "Vous avez des modifications non sauvegardées. Voulez-vous les perdre ?",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Fermer", 
            style: "destructive",
            onPress: () => {
              setMode('view');
              onClose();
            }
          }
        ]
      );
    } else {
      setMode('view');
      onClose();
    }
  };

  // ✅ VÉRIFICATION d'authentification au niveau du composant
  if (!isAuthenticated) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <FontAwesome name="lock" size={50} color="#ccc" style={{ marginBottom: 20 }} />
          <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
            Vous devez être connecté pour accéder à cette fonctionnalité
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
        
        {/* ✅ HEADER avec état de connexion */}
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
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              {mode === 'view' ? 'Consultation' : 'Modification'} anamnèse
            </Text>
            {user && (
              <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                {user.email}
              </Text>
            )}
          </View>
          
          {/* ✅ BOUTONS d'action */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            {/* Bouton Supprimer - visible uniquement en mode view */}
            {mode === 'view' && anamneseId && (
              <Pressable 
                onPress={deleteAnamnese}
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
            {anamneseId && (
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
            )}
          </View>
        </View>

        {/* ✅ CONTENU */}
        {(isLoading || isDeleting) ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ marginTop: 10, textAlign: 'center' }}>
              {isLoading ? 'Chargement de vos données...' : 'Suppression en cours...'}
            </Text>
          </View>
        ) : !anamneseId ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <FontAwesome name="file-text-o" size={50} color="#ccc" style={{ marginBottom: 20 }} />
            <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
              Aucune anamnèse trouvée
            </Text>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
              Vous devez d'abord créer une anamnèse depuis l'onglet correspondant.
            </Text>
            <Pressable
              onPress={handleClose}
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
        ) : (
          <ScrollView style={{ flex: 1, padding: 20 }}>
            
            {/* ✅ SECTION IDENTIFICATION */}
            <View style={{
              backgroundColor: '#f8f9fa',
              padding: 15,
              borderRadius: 8,
              marginBottom: 20
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Informations générales
              </Text>
              <Text style={{ color: '#666' }}>
                Âge: {formData.age} ans
              </Text>
            </View>

            {/* Sexe */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                Sexe <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
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
                      padding: 12,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: formData.sexe === option ? '#007AFF' : '#ddd',
                      backgroundColor: formData.sexe === option ? '#007AFF' : '#fff',
                      opacity: mode === 'edit' ? 1 : 0.7,
                    }}
                  >
                    <Text style={{
                      color: formData.sexe === option ? '#fff' : '#333',
                      fontWeight: formData.sexe === option ? 'bold' : 'normal',
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
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                  Poids (kg) <Text style={{ color: 'red' }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                    fontSize: 16,
                  }}
                  value={formData.poids_kg}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, poids_kg: text }))}
                  placeholder="Ex: 70.5"
                  keyboardType="decimal-pad"
                  editable={mode === 'edit'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                  Taille (cm) <Text style={{ color: 'red' }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                    fontSize: 16,
                  }}
                  value={formData.taille_cm}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, taille_cm: text }))}
                  placeholder="Ex: 175"
                  keyboardType="decimal-pad"
                  editable={mode === 'edit'}
                />
              </View>
            </View>

            {/* IMC */}
            {formData.imc && (
              <View style={{
                backgroundColor: parseFloat(formData.imc) < 18.5 ? '#e3f2fd' :
                               parseFloat(formData.imc) < 25 ? '#e8f5e8' :
                               parseFloat(formData.imc) < 30 ? '#fff3e0' : '#ffebee',
                padding: 15,
                borderRadius: 8,
                marginBottom: 20,
                alignItems: 'center',
              }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                  IMC: {formData.imc}
                </Text>
                
              </View>
            )}

            {/* Autres champs avec icônes et amélioration */}
            {[
              { label: "Blessures actuelles", key: "blessures", icon: "plus-square" },
              { label: "État de santé actuel", key: "etat_actuel", icon: "heart" },
              { label: "Expérience sportive", key: "exp_sportive", icon: "bicycle" },
              { label: "Antécédents et diagnostics", key: "diagnostics", icon: "file-text" },
              { label: "Traitements en cours", key: "traitement", icon: "medkit" },
              { label: "Contraintes professionnelles", key: "contrainte_pro", icon: "briefcase" },
              { label: "Contraintes familiales", key: "contrainte_fam", icon: "home" },
              { label: "Commentaires", key: "commentaire", icon: "comment" },
            ].map(({ label, key, icon }) => (
              <View key={key} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <FontAwesome name={icon as keyof typeof FontAwesome.glyphMap} size={16} color="#666" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{label}</Text>
                </View>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    minHeight: 80,
                    textAlignVertical: 'top',
                    backgroundColor: mode === 'edit' ? '#fff' : '#f5f5f5',
                    fontSize: 14,
                  }}
                  value={formData[key as keyof typeof formData]}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
                  placeholder={`Décrivez ${label.toLowerCase()}...`}
                  multiline
                  editable={mode === 'edit'}
                />
              </View>
            ))}

            {/* ✅ ESPACE EN BAS */}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}