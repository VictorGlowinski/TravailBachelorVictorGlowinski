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

interface UserSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string | null;
}

interface UserData {
  email: string;
  use_date_naissance: string;
}

const API_BASE_URL = "http://192.168.0.112:8000/api";

export default function UserSettingsModal({ 
  visible, 
  onClose, 
  userId 
}: UserSettingsModalProps) {
  const theme = useTheme();
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
  

  // ✅ CHARGER les données utilisateur
  useEffect(() => {
    if (visible && userId) {
      loadUserData();
    }
  }, [visible, userId]);

  const loadUserData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUserData({
            email: data.user.email || '',
            use_date_naissance: data.user.use_date_naissance || ''
          });
        }
        console.log('Données utilisateur chargées:', data.user); // ✅ Log pour vérifier
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
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
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            if (!userId) return;

            try {
              const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Succès', 'Votre compte a été supprimé avec succès.');
                onClose();
              } else {
                throw new Error('Erreur lors de la suppression');
              }
            } catch (error) {
              console.error('Erreur suppression compte:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le compte');
            }
          },
        },
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
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* ✅ HEADER */}
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
            
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: theme.colors.primary 
            }}>
              Paramètres du compte
            </Text>
            
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
                  Chargement...
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

               
                {/* ✅ SUPPRESSION COMPTE */}
                <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 50 }}>
                    <Pressable
                      onPress={deleteAccount}
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