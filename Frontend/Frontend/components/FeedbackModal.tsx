// components/FeedbackModal.tsx - CORRIGER l'import

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
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import feedbackModalStyles from '@/styles/screens/FeedbackModalStyles';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost } from '@/utils/apiHelper'; 

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onFeedbackSubmitted?: () => void;
}

export default function FeedbackModal({ 
  visible, 
  onClose, 
  onFeedbackSubmitted 
}: FeedbackModalProps) {

  const { user, isAuthenticated, logout } = useAuth(); 
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);




const handleSubmit = async () => {
  if (!feedback.trim()) {
    Alert.alert('Attention', 'Veuillez saisir votre feedback.');
    return;
  }

  setIsSubmitting(true);
  try {
    
    const feedbackData = {
      ret_commentaire: feedback.trim(), 
      ret_date: new Date().toISOString().split('T')[0], 
      // ✅ AJOUTER l'utilisateur si authentifié
      ...(isAuthenticated && user && {
        ret_user_id: user.id 
      })
    };

    console.log('📤 Envoi feedback:', feedbackData); 
    const response = await apiPost('/retour', feedbackData);

    Alert.alert(
      'Merci !',
      isAuthenticated 
        ? 'Votre feedback a été envoyé avec succès. Nous l\'examinerons attentivement.'
        : 'Votre feedback anonyme a été envoyé avec succès.',
      [
        {
          text: 'OK',
          onPress: () => {
            setFeedback('');
            onClose();
            onFeedbackSubmitted?.();
          }
        }
      ]
    );

  } catch (error) {
    console.error('❌ Erreur envoi feedback:', error);
    
    let errorMessage = 'Impossible d\'envoyer votre feedback. Veuillez réessayer.';

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
    }

    Alert.alert('Erreur', errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};
  const handleClose = () => {
    if (feedback.trim()) {
      Alert.alert(
        'Abandonner ?',
        'Voulez-vous vraiment fermer sans envoyer votre feedback ?',
        [
          { text: 'Continuer', style: 'cancel' },
          { 
            text: 'Fermer', 
            style: 'destructive',
            onPress: () => {
              setFeedback('');
              onClose();
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };

  
  console.log('Modal visible:', visible);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={feedbackModalStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={feedbackModalStyles.modalContent}>
          {/* Header */}
          <View style={feedbackModalStyles.header}>
            <View style={feedbackModalStyles.headerContent}>
              <Text style={feedbackModalStyles.title}>
                Votre feedback
              </Text>
              <Text style={feedbackModalStyles.subtitle}>
                Aidez-nous à améliorer Kinesis
              </Text>
              {/* AFFICHER l'état d'authentification */}
              {isAuthenticated && user && (
                <Text style={[feedbackModalStyles.subtitle, { 
                  fontSize: 12, 
                  color: '#27ae60',
                  marginTop: 4 
                }]}>
                  Connecté en tant que {user.email}
                </Text>
              )}
            </View>
            <Pressable
              onPress={handleClose}
              style={feedbackModalStyles.closeButton}
            >
              <FontAwesome name="times" size={18} color="#7f8c8d" />
            </Pressable>
          </View>

          {/* Contenu */}
          <View style={feedbackModalStyles.content}>
            <Text style={feedbackModalStyles.label}>
              Partagez votre expérience avec Kinesis :
            </Text>
            
            <TextInput
              style={feedbackModalStyles.textArea}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Vos suggestions, bugs rencontrés, points positifs..."
              placeholderTextColor="#7f8c8d"
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            
            <Text style={feedbackModalStyles.charCount}>
              {feedback.length}/1000
            </Text>
          </View>

          {/* Footer */}
          <View style={feedbackModalStyles.footer}>
            <Pressable
              style={feedbackModalStyles.cancelButton}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={feedbackModalStyles.cancelButtonText}>Annuler</Text>
            </Pressable>

            <Pressable
              style={[
                feedbackModalStyles.submitButton,
                { opacity: isSubmitting ? 0.6 : 1 }
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <FontAwesome name="send" size={16} color="white" />
                  <Text style={feedbackModalStyles.submitButtonText}>
                    {/* TEXTE adapté selon l'authentification */}
                    {isAuthenticated ? 'Envoyer' : 'Envoyer (anonyme)'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}