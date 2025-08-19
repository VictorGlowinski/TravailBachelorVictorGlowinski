// ✅ STYLES CORRIGÉS
import { StyleSheet, Platform } from 'react-native';

const EvaluationInitialeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa", // ✅ CORRECTION : Couleur normale
  },

  header: {
    backgroundColor: "#000000ff",
    paddingTop: Platform.OS === "ios" ? 50 : 35,
    paddingBottom: 15,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#34C759",
    borderRadius: 3,
  },

  progressText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    minWidth: 80,
  },

  keyboardCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardCloseText: { fontSize: 11, color: "#007AFF", fontWeight: "500" },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  form: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8 },
  required: { color: "#FF3B30" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
    color: "#333", // ✅ AJOUT : Couleur du texte
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  buttonContainer: { marginTop: 20, gap: 10 },
  submitButton: {
    backgroundColor: "#34C759",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  cancelButton: {
    backgroundColor: "#6c757d",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  cancelButtonText: { color: "white", fontSize: 16 },
  buttonIcon: { marginRight: 8 },
  bottomSpacer: { height: 80 },

  // User card
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginBottom: 16,
  },
  userName: { fontSize: 16, fontWeight: "600", color: "#333" },
  userMeta: { fontSize: 12, color: "#6c757d", marginTop: 2 },

  // Chips
  chipsRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "white",
  },
  chipText: { color: "#007AFF", fontWeight: "600" },

  // Advanced toggle
  advancedToggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#EAF2FF",
    marginBottom: 6,
  },
  advancedToggleText: { color: "#007AFF", fontWeight: "600" },
});



export default EvaluationInitialeStyles;
