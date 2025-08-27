// components/ActiviteGenereeModal.tsx - CRÉER ce composant

import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/styles/screens/ThemeStyle';
import activiteGenereeStyles from '@/styles/screens/ActiviteGenereeStyles';

interface ActiviteGenereeModalProps {
  visible: boolean;
  onClose: () => void;
  jour: any;
  dayNumber: number;
}

export default function ActiviteGenereeModal({ 
  visible, 
  onClose, 
  jour, 
  dayNumber 
}: ActiviteGenereeModalProps) {
  const theme = useTheme();

  // ✅ Formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // ✅ Obtenir l'icône selon le type d'activité
  const getActivityIcon = (type: string) => {
    const typeStr = String(type).toLowerCase();
    if (typeStr.includes('natation') || typeStr.includes('nage')) return 'tint';
    if (typeStr.includes('vélo') || typeStr.includes('cyclisme')) return 'bicycle';
    // "running" is not a valid FontAwesome icon, use "male" or "road" instead
    if (typeStr.includes('course') || typeStr.includes('running')) return 'male';
    if (typeStr.includes('repos') || typeStr.includes('récupération')) return 'bed';
    return 'flash';
  };

  // ✅ Obtenir la couleur selon l'intensité
  const getIntensityColor = (intensite: string) => {
    const intensiteStr = String(intensite).toLowerCase();
    if (intensiteStr.includes('faible') || intensiteStr.includes('facile')) return theme.colors.success;
    if (intensiteStr.includes('modérée') || intensiteStr.includes('moyenne')) return theme.colors.warning;
    if (intensiteStr.includes('élevée') || intensiteStr.includes('intense')) return theme.colors.error;
    return theme.colors.accent;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.accent} />
      
      <View style={[activiteGenereeStyles.container, { backgroundColor: theme.colors.background }]}>
        {/* ✅ HEADER du modal */}
        <View style={[activiteGenereeStyles.header, { backgroundColor: theme.colors.accent }]}>
          <View style={activiteGenereeStyles.headerContent}>
            <View style={activiteGenereeStyles.headerLeft}>
              <View style={activiteGenereeStyles.dayBadge}>
                <Text style={activiteGenereeStyles.dayBadgeText}>{dayNumber}</Text>
              </View>
              <View>
                <Text style={activiteGenereeStyles.headerTitle}>
                  Jour {dayNumber}
                </Text>
                {jour?.jou_date && (
                  <Text style={activiteGenereeStyles.headerSubtitle}>
                    {formatDate(jour.jou_date)}
                  </Text>
                )}
              </View>
            </View>
            
            <Pressable
              style={activiteGenereeStyles.closeButton}
              onPress={onClose}
            >
              <FontAwesome name="times" size={24} color="white" />
            </Pressable>
          </View>
        </View>

        {/* ✅ CONTENU scrollable */}
        <ScrollView 
          style={activiteGenereeStyles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ✅ Description du jour */}
          {jour?.jou_description && (
            <View style={[activiteGenereeStyles.card, { backgroundColor: theme.colors.surface }]}>
              <View style={activiteGenereeStyles.cardHeader}>
                <FontAwesome name="info-circle" size={20} color={theme.colors.accent} />
                <Text style={[activiteGenereeStyles.cardTitle, { color: theme.colors.primary }]}>
                  Description
                </Text>
              </View>
              <Text style={[activiteGenereeStyles.descriptionText, { color: theme.colors.secondary }]}>
                {jour.jou_description}
              </Text>
            </View>
          )}

          {/* ✅ ACTIVITÉS */}
          {jour?.activites && jour.activites.length > 0 ? (
            <View style={[activiteGenereeStyles.card, { backgroundColor: theme.colors.surface }]}>
              <View style={activiteGenereeStyles.cardHeader}>
                <FontAwesome name="list" size={20} color={theme.colors.accent} />
                <Text style={[activiteGenereeStyles.cardTitle, { color: theme.colors.primary }]}>
                  Programme ({jour.activites.length} activité{jour.activites.length > 1 ? 's' : ''})
                </Text>
              </View>

              <View style={activiteGenereeStyles.activitiesContainer}>
                {jour.activites.map((activite: any, index: number) => (
                  <View 
                    key={activite.gen_id || index} 
                    style={[
                      activiteGenereeStyles.activityCard, 
                      { backgroundColor: theme.colors.background }
                    ]}
                  >
                    {/* ✅ Header de l'activité */}
                    <View style={activiteGenereeStyles.activityHeader}>
                      <View style={activiteGenereeStyles.activityTitleRow}>
                        <FontAwesome 
                          name={getActivityIcon(activite.gen_type || '')} 
                          size={18} 
                          color={theme.colors.accent} 
                        />
                        <Text style={[activiteGenereeStyles.activityName, { color: theme.colors.primary }]}>
                          {activite.gen_nom || 'Activité'}
                        </Text>
                      </View>
                      
                      {activite.gen_type && (
                        <View style={[activiteGenereeStyles.typeBadge, { backgroundColor: theme.colors.accent }]}>
                          <Text style={activiteGenereeStyles.typeBadgeText}>
                            {activite.gen_type}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* ✅ Détails de l'activité */}
                    <View style={activiteGenereeStyles.activityDetails}>
                      {activite.gen_duree_minutes && (
                        <View style={activiteGenereeStyles.detailRow}>
                          <FontAwesome name="clock-o" size={14} color={theme.colors.secondary} />
                          <Text style={[activiteGenereeStyles.detailText, { color: theme.colors.secondary }]}>
                            Durée : {activite.gen_duree_minutes} minutes
                          </Text>
                        </View>
                      )}

                      {activite.gen_distance && (
                        <View style={activiteGenereeStyles.detailRow}>
                          <FontAwesome name="road" size={14} color={theme.colors.secondary} />
                          <Text style={[activiteGenereeStyles.detailText, { color: theme.colors.secondary }]}>
                            Distance : {activite.gen_distance} km
                          </Text>
                        </View>
                      )}

                      {activite.gen_intensite && (
                        <View style={activiteGenereeStyles.detailRow}>
                          <FontAwesome name="tachometer" size={14} color={getIntensityColor(activite.gen_intensite)} />
                          <Text style={[
                            activiteGenereeStyles.detailText, 
                            { color: getIntensityColor(activite.gen_intensite) }
                          ]}>
                            Intensité : {activite.gen_intensite}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* ✅ Description de l'activité */}
                    {activite.gen_description && (
                      <View style={[activiteGenereeStyles.activityDescriptionContainer, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[activiteGenereeStyles.activityDescription, { color: theme.colors.secondary }]}>
                          💡 {activite.gen_description}
                        </Text>
                      </View>
                    )}

                    {/* Commentaire du LLM pour l'activité */}
                    {activite.gen_commentaire && (
                      <View style={[activiteGenereeStyles.activityCommentContainer, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[activiteGenereeStyles.activityComment, { color: theme.colors.secondary }]}>
                          💬 {activite.gen_commentaire}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={[activiteGenereeStyles.card, { backgroundColor: theme.colors.surface }]}>
              <View style={activiteGenereeStyles.emptyState}>
                <FontAwesome name="bed" size={48} color={theme.colors.secondary} />
                <Text style={[activiteGenereeStyles.emptyTitle, { color: theme.colors.primary }]}>
                  Jour de repos
                </Text>
                <Text style={[activiteGenereeStyles.emptySubtitle, { color: theme.colors.secondary }]}>
                  Aucune activité programmée pour ce jour
                </Text>
              </View>
            </View>
          )}

          {/* ✅ Espacement en bas */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}