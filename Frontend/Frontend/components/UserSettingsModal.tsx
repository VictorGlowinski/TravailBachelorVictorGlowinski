// components/UserSettingsModal.tsx - NOUVEAU COMPOSANT

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/styles/screens/ThemeStyle';
import { useAuth } from '@/contexts/AuthContext'; // ✅ AJOUTER le contexte d'auth
import { apiGet, apiDelete } from '@/utils/apiHelper'; // ✅ UTILISER les helpers authentifiés

interface UserSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string | null;
}

interface UserData {
  email: string;
  use_date_naissance: string;
}

export default function UserSettingsModal({ 
  visible, 
  onClose, 
  userId 
}: UserSettingsModalProps) {
  const theme = useTheme();
  const { user, isAuthenticated, logout } = useAuth(); // ✅ UTILISER le contexte d'auth
  const [userData, setUserData] = useState<UserData>({
    email: '',
    use_date_naissance: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);  
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  
  // ✅ VÉRIFICATION d'authentification
  useEffect(() => {
    if (visible && !isAuthenticated) {
      Alert.alert(
        "Non authentifié", 
        "Vous devez être connecté pour accéder aux paramètres",
        [
          { 
            text: "Se connecter", 
            onPress: () => onClose() 
          }
        ]
      );
      return;
    }

    // ✅ VÉRIFIER que l'utilisateur peut accéder à ces paramètres
    if (visible && userId && user && userId !== user.id.toString()) {
      Alert.alert(
        "Accès refusé", 
        "Vous ne pouvez modifier que vos propres paramètres",
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

  // ✅ CHARGER les données utilisateur avec authentification
  useEffect(() => {
    if (visible && userId && isAuthenticated) {
      loadUserData();
    }
  }, [visible, userId, isAuthenticated]);

  const loadUserData = async () => {
    if (!userId || !isAuthenticated) return;
    
    setIsLoading(true);
    try {
      console.log('📡 Chargement données utilisateur:', userId);
      
      // ✅ UTILISER apiGet qui gère l'authentification automatiquement
      const data = await apiGet(`/users/${userId}`);
      console.log('✅ Données utilisateur reçues:', data);
      
      if (data.user) {
        setUserData({
          email: data.user.email || '',
          use_date_naissance: data.user.use_date_naissance || ''
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      
      // ✅ GESTION D'ERREURS SPÉCIFIQUE
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string' &&
        (error as { message: string }).message.includes('Session expirée')
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
      
      Alert.alert('Erreur', 'Impossible de charger vos informations');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FORMATER la date de naissance
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non renseignée';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Format invalide';
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const deleteAccount = () => {
    // ✅ VÉRIFICATIONS préliminaires
    if (!isAuthenticated) {
      Alert.alert("Non authentifié", "Vous devez être connecté pour supprimer votre compte");
      return;
    }

    if (!userId) {
      Alert.alert("Erreur", "Utilisateur non identifié");
      return;
    }

    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera toutes vos données.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              console.log('🗑️ Suppression compte utilisateur:', userId);

              // ✅ UTILISER apiDelete qui gère l'authentification automatiquement
              await apiDelete(`/users/${userId}`);
              console.log('✅ Compte supprimé avec succès');

              Alert.alert(
                'Succès', 
                'Votre compte a été supprimé avec succès.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // ✅ DÉCONNECTER l'utilisateur après suppression
                      logout();
                      onClose();
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('❌ Erreur suppression compte:', error);
              
              // ✅ GESTION D'ERREURS SPÉCIFIQUE
              let errorMessage = 'Impossible de supprimer le compte. Veuillez réessayer.';
              
              if (
                typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as { message?: string }).message === 'string' &&
                (error as { message: string }).message.includes('Session expirée')
              ) {
                errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
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
                typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as { message?: string }).message === 'string' &&
                (error as { message: string }).message.includes('403')
              ) {
                errorMessage = "Vous n'avez pas l'autorisation de supprimer ce compte.";
              }
              
              Alert.alert('Erreur', errorMessage);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // ✅ VÉRIFICATION d'authentification au niveau du composant
  if (!isAuthenticated) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
              color: theme.colors.primary 
            }}>
              Vous devez être connecté pour accéder aux paramètres
            </Text>
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: theme.colors.accent,
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
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* ✅ HEADER avec informations utilisateur */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}>
            <Pressable onPress={handleClose}>
              <FontAwesome name="times" size={20} color={theme.colors.secondary} />
            </Pressable>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: theme.colors.primary 
              }}>
                Paramètres du compte
              </Text>
              {/* ✅ AFFICHER l'utilisateur connecté */}
              {user && (
                <Text style={{ 
                  fontSize: 12, 
                  color: theme.colors.secondary,
                  marginTop: 2 
                }}>
                  {user.email}
                </Text>
              )}
            </View>
            
            <View style={{ width: 20 }} />
          </View>

          {/* ✅ CONTENU */}
          <ScrollView style={{ flex: 1, padding: 20 }}>
            {isLoading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
                <ActivityIndicator size="large" color={theme.colors.accent} />
                <Text style={{ 
                  marginTop: 10, 
                  color: theme.colors.secondary 
                }}>
                  Chargement de vos paramètres...
                </Text>
              </View>
            ) : (
              <>
                {/* ✅ INFORMATIONS PERSONNELLES */}
                <View style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: theme.colors.primary,
                    marginBottom: 15
                  }}>
                    Informations personnelles
                  </Text>

                  {/* Email */}
                  <View style={{ marginBottom: 15 }}>
                    <Text style={{
                      fontSize: 14,
                      color: theme.colors.secondary,
                      marginBottom: 5
                    }}>
                      Email
                    </Text>
                    <View style={{
                      padding: 15,
                      backgroundColor: theme.colors.background,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    }}>
                      <Text style={{ color: theme.colors.primary }}>
                        {userData.email || 'Non renseigné'}
                      </Text>
                    </View>
                  </View>

                  {/* Date de naissance */}
                  <View>
                    <Text style={{
                      fontSize: 14,
                      color: theme.colors.secondary,
                      marginBottom: 5
                    }}>
                      Date de naissance
                    </Text>
                    <View style={{
                      padding: 15,
                      backgroundColor: theme.colors.background,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    }}>
                      <Text style={{ color: theme.colors.primary }}>
                        {formatDate(userData.use_date_naissance)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* ✅ SECTION DANGER */}
                <View style={{
                  backgroundColor: '#fff3f3',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: '#ffcccb',
                  borderLeftWidth: 4,
                  borderLeftColor: '#e74c3c'
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#e74c3c',
                    marginBottom: 10
                  }}>
                    Zone de danger
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#666',
                    marginBottom: 15,
                    lineHeight: 20
                  }}>
                    La suppression de votre compte est irréversible. Toutes vos données (anamnèse, évaluations, plans d'entraînement) seront définitivement perdues.
                  </Text>
                </View>
               
                {/* ✅ SUPPRESSION COMPTE */}
                <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 50 }}>
                    <Pressable
                      onPress={deleteAccount}
                      disabled={isDeleting}
                      style={{
                        backgroundColor: '#e74c3c',
                        padding: 15,
                        borderRadius: 8,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        opacity: isDeleting ? 0.5 : 1,
                        minWidth: 200
                      }}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <FontAwesome name="trash" size={16} color="white" />
                          <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>
                            Supprimer le compte
                          </Text>
                        </>
                      )}
                    </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}