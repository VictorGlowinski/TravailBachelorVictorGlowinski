// styles/screens/AccueilStyle.ts - VERSION COMPLÈTE avec UX moderne

import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const accueilStyles = StyleSheet.create({
  // ✅ CONTAINER PRINCIPAL
  container: {
    flex: 1,
    // backgroundColor sera définie dynamiquement
  },
  scrollContent: {
    paddingBottom: 30,
  },

  // ✅ HEADER MODERNISÉ
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    // backgroundColor sera définie dynamiquement
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    // color sera définie dynamiquement
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    // color sera définie dynamiquement
  },

  // ✅ CARTES PRINCIPALES
  card: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    gap: 15,
    // backgroundColor sera définie dynamiquement
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    // color sera définie dynamiquement
  },

  // ✅ ÉTAT DE CHARGEMENT
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
    // color sera définie dynamiquement
  },

  // ✅ INFORMATIONS DE DATE
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    // color sera définie dynamiquement
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
    fontStyle: 'italic',
    // color sera définie dynamiquement
  },

  // ✅ CONTAINER DES ACTIVITÉS
  activitiesContainer: {
    gap: 12,
  },
  activityCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
    // backgroundColor sera définie dynamiquement
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    // color sera définie dynamiquement
  },
  activityTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    // backgroundColor sera définie dynamiquement
  },
  activityTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },

  // ✅ DÉTAILS DES ACTIVITÉS
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  activityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityDetailText: {
    fontSize: 14,
    fontWeight: '500',
    // color sera définie dynamiquement
  },
  activityComment: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    // color sera définie dynamiquement
  },

  // ✅ ÉTATS VIDES
  emptyState: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    // color sera définie dynamiquement
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    // color sera définie dynamiquement
  },

  // ✅ BOUTONS D'ACTION
  actionButtons: {
    width: '100%',
    gap: 12,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    // backgroundColor sera définie dynamiquement
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // ✅ ÉTATS SPÉCIAUX
  restDayContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 16,
  },
  restDayIcon: {
    marginBottom: 8,
  },
  restDayTitle: {
    fontSize: 20,
    fontWeight: '600',
    // color sera définie dynamiquement
  },
  restDaySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    // color sera définie dynamiquement
  },

  // ✅ GUIDE UTILISATEUR (pas de plan)
  guideContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 20,
  },
  guideIcon: {
    marginBottom: 10,
  },
  guideTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    // color sera définie dynamiquement
  },
  guideDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
    // color sera définie dynamiquement
  },
  stepsList: {
    width: '100%',
    gap: 12,
    marginTop: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 15,
    // backgroundColor sera définie dynamiquement
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor sera définie dynamiquement
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    // color sera définie dynamiquement
  },
  stepChevron: {
    opacity: 0.6,
  },

  // ✅ ERREURS ET MESSAGES
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    // color sera définie dynamiquement (rouge)
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    // color sera définie dynamiquement
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
    // backgroundColor sera définie dynamiquement
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },

  // ✅ INDICATEURS DE PROGRESSION
  progressIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    // backgroundColor sera définie dynamiquement
  },
  progressDotActive: {
    // backgroundColor sera définie dynamiquement (accent)
  },

  // ✅ ANIMATIONS ET TRANSITIONS
  fadeIn: {
    opacity: 1,
  },
  fadeOut: {
    opacity: 0.5,
  },

  // ✅ RESPONSIVE
  largeScreen: {
    maxWidth: 600,
    alignSelf: 'center',
  },

  // ✅ ACCESSIBILITÉ
  accessibilityHint: {
    fontSize: 12,
    // color sera définie dynamiquement
  },

  // ✅ STYLES POUR TAGS/BADGES
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    // backgroundColor sera définie dynamiquement
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  durationTag: {
    backgroundColor: '#4CAF50',
  },
  intensityTag: {
    backgroundColor: '#FF9800',
  },
  typeTag: {
    backgroundColor: '#2196F3',
  },

  // ✅ STYLES LEGACY (compatibilité avec globalStyles)
  activitiesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    paddingHorizontal: 20,
    // color sera définie dynamiquement
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    // color sera définie dynamiquement
  },
});

export default accueilStyles;