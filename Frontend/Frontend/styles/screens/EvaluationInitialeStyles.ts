// styles/screens/EvaluationInitialeStyles.ts - VERSION COMPLÈTE

import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const evaluationInitialeStyles = StyleSheet.create({
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
    paddingTop: Platform.OS === "ios" ? 50 : 35,
    paddingBottom: 20,
    paddingHorizontal: 20,
    // backgroundColor et shadows seront définis dynamiquement
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor sera définie dynamiquement
  },
  titleContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    // color sera définie dynamiquement
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    // color sera définie dynamiquement
  },
  keyboardButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor sera définie dynamiquement
  },

  // ✅ BARRE DE PROGRESSION
  progressSection: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    // backgroundColor sera définie dynamiquement
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    // backgroundColor sera définie dynamiquement
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    // color sera définie dynamiquement
  },

  // ✅ LOADING STATE
  loadingCard: {
    margin: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    // backgroundColor sera définie dynamiquement
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
    // color sera définie dynamiquement
  },

  // ✅ SECTION FORMULAIRE
  formSection: {
    padding: 20,
    gap: 20,
  },

  // ✅ CARTES DE CHAMPS
  fieldCard: {
    borderRadius: 16,
    padding: 20,
    gap: 15,
    // backgroundColor sera définie dynamiquement
  },
  fieldTitle: {
    fontSize: 18,
    fontWeight: '600',
    // color sera définie dynamiquement
  },
  fieldDescription: {
    fontSize: 14,
    lineHeight: 20,
    // color sera définie dynamiquement
  },
  required: {
    // color sera définie dynamiquement
  },

  // ✅ CHIPS POUR NIVEAU D'EXPÉRIENCE
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    // backgroundColor et borderColor seront définies dynamiquement
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    // color sera définie dynamiquement
  },

  // ✅ INPUTS
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    // backgroundColor, color et borderColor seront définies dynamiquement
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    // backgroundColor, color et borderColor seront définies dynamiquement
  },
  inputContainer: {
    flex: 1,
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    // color sera définie dynamiquement
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },

  // ✅ SECTION EXPANDABLE (TESTS PHYSIQUES)
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  expandableTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
    // backgroundColor sera définie dynamiquement
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  expandableContent: {
    marginTop: 15,
    gap: 20,
  },

  // ✅ SECTIONS DE TESTS
  testSection: {
    gap: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    // color sera définie dynamiquement
  },

  // ✅ SECTION ACTIONS
  actionsSection: {
    padding: 20,
    gap: 15,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
    // backgroundColor sera définie dynamiquement
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    gap: 10,
    // backgroundColor et borderColor seront définies dynamiquement
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    // color sera définie dynamiquement
  },

  // ✅ STYLES LEGACY (compatibilité)
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  keyboardCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardCloseText: { 
    fontSize: 11, 
    fontWeight: "500" 
  },
  scrollView: { 
    flex: 1 
  },
  form: { 
    padding: 20 
  },
  inputGroup: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 8 
  },
  col: { 
    flex: 1 
  },
  buttonContainer: { 
    marginTop: 20, 
    gap: 10 
  },
  buttonIcon: { 
    marginRight: 8 
  },
  bottomSpacer: { 
    height: 80 
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  userName: { 
    fontSize: 16, 
    fontWeight: "600" 
  },
  userMeta: { 
    fontSize: 12, 
    marginTop: 2 
  },
  chipsRow: { 
    flexDirection: "row", 
    gap: 8 
  },
  advancedToggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  advancedToggleText: { 
    fontWeight: "600" 
  },
   inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor sera définie dynamiquement
  },
  infoTooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
    // backgroundColor sera définie dynamiquement
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
    fontStyle: 'italic',
  },
  inputText: {
  fontSize: 16,
  flex: 1,
},
// styles/screens/EvaluationInitialeStyles.ts - AJOUTER ces styles

// ✅ Styles pour le DatePicker customisé
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


});

export default evaluationInitialeStyles;