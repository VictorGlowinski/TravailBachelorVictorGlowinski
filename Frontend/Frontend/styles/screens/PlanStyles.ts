// styles/screens/PlanStyles.ts - SUPPRIMER les couleurs fixes

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const planStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,

    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // Les shadows seront appliquées via theme.shadows
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },

  // Section génération
  generateSection: {
    padding: 20,
    gap: 20,
  },
  prerequisCard: {
    borderRadius: 16,
    padding: 20,
    // Les shadows seront appliquées via theme.shadows
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  prerequisList: {
    gap: 12,
  },
  prerequisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // La backgroundColor sera définie dynamiquement
  },
  statusIconText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  prerequisText: {
    fontSize: 16,
  },
  generateButton: {
    // La backgroundColor sera définie dynamiquement
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    // Les shadows seront appliquées via theme.shadows
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    // La color sera définie dynamiquement
  },

  // Section plan
  planSection: {
    padding: 20,
    gap: 20,
  },
  planHeader: {
    borderRadius: 16,
    padding: 20,
    // Les shadows seront appliquées via theme.shadows
  },
  planTitleContainer: {
    gap: 15,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  planInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  planInfoDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 15,
  },
  planInfoLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },

  // Bouton supprimer
  deleteButton: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    // backgroundColor et borderColor seront définis dynamiquement
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    // La color sera définie dynamiquement
  },

  // Jours
  daysSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dayCard: {
    borderRadius: 16,
    padding: 20,
    // Les shadows seront appliquées via theme.shadows
    gap: 15,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  dayNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayInfo: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  dayDate: {
    fontSize: 14,
    marginTop: 2,
  },
  dayDescriptionContainer: {
    borderRadius: 12,
    padding: 15,
  },
  dayDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Activités
  activitiesContainer: {
    gap: 12,
  },
  activityCard: {
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50', 
    gap: 10,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeTag: {
    backgroundColor: '#007AFF', 
  },
  durationTag: {
    backgroundColor: '#FF9500', 
  },
  intensityTag: {
    backgroundColor: '#34C759',
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  activityDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  noActivityContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noActivityText: {
    fontSize: 14,
    fontStyle: 'italic',
  },

  // États vides
  noDaysContainer: {
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    // Les shadows seront appliquées via theme.shadows
  },
  noDaysText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  noDaysSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  // styles/screens/PlanStyles.ts - AJOUTER ces styles

generateButtonContainer: {
  marginTop: 20,
  gap: 12,
},

generateButtonSubtext: {
  fontSize: 12,
  color: 'rgba(255, 255, 255, 0.8)',
  textAlign: 'center',
},
helpText: {
  fontSize: 14,
  textAlign: 'center',
  lineHeight: 20,
  fontStyle: 'italic',
  paddingHorizontal: 20,
  // color sera définie dynamiquement
},
// styles/screens/PlanStyles.ts - AJOUTER ces styles

// Styles pour l'aperçu des activités
activitiesPreview: {
  padding: 12,
  borderRadius: 8,
  marginTop: 12,
},
activitiesCount: {
  fontSize: 14,
  fontWeight: '500',
  marginBottom: 4,
},
tapToView: {
  fontSize: 12,
  fontStyle: 'italic',
},
restDay: {
  fontSize: 14,
  fontStyle: 'italic',
  textAlign: 'center',
},
// styles/screens/PlanStyles.ts - AJOUTER ces styles

dateSection: {
  marginTop: 20,
  paddingTop: 20,
  borderTopWidth: 1,
  borderTopColor: 'rgba(0, 0, 0, 0.1)',
},
dateLabel: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 4,
},
dateDescription: {
  fontSize: 14,
  marginBottom: 12,
  lineHeight: 20,
},
dateInput: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 12,
  paddingVertical: 12,
  borderRadius: 8,
  borderWidth: 1,
},
dateInputText: {
  fontSize: 16,
  flex: 1,
},

required: {
  fontSize: 16,
  fontWeight: 'bold',
},
errorText: {
  fontSize: 12,
  fontStyle: 'italic',
  marginTop: 4,
},
// styles/screens/PlanStyles.ts - AJOUTER ces styles

// Styles pour le DatePicker customisé
datePickerContainer: {
  position: 'absolute',
  top: '50%',
  left: 20,
  right: 20,
  transform: [{ translateY: -150 }],
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
  zIndex: 1000,
},
datePickerHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
},
datePickerTitle: {
  fontSize: 16,
  fontWeight: '600',
},
datePickerButton: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 8,
  minWidth: 70,
  alignItems: 'center',
},
datePickerButtonText: {
  fontSize: 14,
  fontWeight: '500',
},
datePickerIOS: {
  height: 200,
},
// styles/screens/PlanStyles.ts - AJOUTER les styles pour le bouton rafraîchir

headerContent: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},

refreshButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
},

lastUpdateText: {
  fontSize: 12,
  fontStyle: 'italic',
  textAlign: 'center',
},
});

export default planStyles;