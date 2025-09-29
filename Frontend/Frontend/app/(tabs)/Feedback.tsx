// app/(tabs)/Feedback.tsx - VERSION AVEC THÈME ADAPTATIF

import React, { useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import FeedbackModal from '@/components/FeedbackModal';
import commentaireStyles from '@/styles/screens/CommentaireStyle';
import { useTheme } from '@/styles/screens/ThemeStyle'; // IMPORTER le hook de thème


export default function FeedbackScreen() {
  const theme = useTheme(); // UTILISER le thème
  const [modalVisible, setModalVisible] = useState(false);

  const handleFeedbackSubmitted = () => {
    console.log('✅ Feedback envoyé avec succès');
  };

  const handleOpenModal = () => {
    console.log('🔥 Bouton pressé, ouverture du modal');
    setModalVisible(true);
    console.log('🔥 Modal state après setModalVisible:', true);
  };

  return (
    <View style={[commentaireStyles.container, { backgroundColor: theme.colors.background }]}>
      {/* HEADER avec thème */}
      <View style={[commentaireStyles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[commentaireStyles.title, { color: theme.colors.primary }]}>
          Feedback
        </Text>
        <Text style={[commentaireStyles.subtitle, { color: theme.colors.secondary }]}>
          Votre avis nous intéresse
        </Text>
      </View>

      {/* CONTENU avec thème */}
      <View style={commentaireStyles.content}>
        <View style={[
          commentaireStyles.infoCard, 
          { backgroundColor: theme.colors.surface },
          theme.shadows // OMBRES adaptées au thème
        ]}>
          <FontAwesome name="comment" size={48} color={theme.colors.accent} />
          <Text style={[commentaireStyles.infoTitle, { color: theme.colors.primary }]}>
            Partagez votre expérience
          </Text>
          <Text style={[commentaireStyles.infoText, { color: theme.colors.secondary }]}>
            Aidez-nous à améliorer Kinesis en nous faisant part de vos retours
          </Text>
        </View>

        <Pressable
          style={[
            commentaireStyles.feedbackButton, 
            { backgroundColor: theme.colors.accent },
            theme.shadows // OMBRES adaptées au thème
          ]}
          onPress={handleOpenModal}
        >
          <FontAwesome name="edit" size={20} color="white" />
          <Text style={commentaireStyles.buttonText}>
            Laisser un feedback
          </Text>
        </Pressable>
      </View>

      {/* MODAL avec thème */}
      <FeedbackModal
        visible={modalVisible}
        onClose={() => {
          console.log('🔥 Fermeture du modal');
          setModalVisible(false);
        }}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
    </View>
  );
}