// components/FeedbackModal.tsx - CORRIGER l'import

import React, { useState } from 'react';
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
// ✅ CORRIGER ce chemin - le fichier est dans styles/screens/ pas components/
import feedbackModalStyles from '@/styles/screens/FeedbackModalStyles';

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
  const API_BASE_URL = "http://192.168.0.112:8000/api";

  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert('Attention', 'Veuillez saisir votre feedback.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          fee_commentaire: feedback,
          fee_note: 5,
          fee_type: 'general',
          fee_sujet: 'Feedback utilisateur'
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Merci !', 
          'Votre feedback a été envoyé avec succès. Nous l\'examinerons attentivement.',
          [
            {
              text: 'OK',
              onPress: () => {
                setFeedback('');
                onClose();
                if (onFeedbackSubmitted) {
                  onFeedbackSubmitted();
                }
              }
            }
          ]
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur envoi feedback:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer votre feedback. Veuillez réessayer.');
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

  // ✅ AJOUTER un console.log pour débugger
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
                    Envoyer
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