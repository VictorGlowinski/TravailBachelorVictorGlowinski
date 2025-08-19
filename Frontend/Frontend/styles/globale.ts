// styles/globale.ts
import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';

export const globalStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  
  // Cards et surfaces
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  surface: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  
  // Boutons génériques
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  
  buttonDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  
  // Textes de boutons
  buttonText: {
    color: colors.text.white,
    ...typography.button.medium,
  },
  
  buttonTextLarge: {
    color: colors.text.white,
    ...typography.button.large,
  },
  
  // Inputs
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: 15,
    fontSize: typography.fontSize.base,
    backgroundColor: colors.surface,
    color: colors.text.primary,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  
  // Labels
  label: {
    ...typography.label,
    color: colors.text.primary,
  },
  
  labelRequired: {
    color: colors.error,
  },
  
  // Textes
  title: {
    ...typography.heading.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  subtitle: {
    ...typography.body.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Layouts
  row: {
    flexDirection: 'row',
  },
  
  col: {
    flex: 1,
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  alignCenter: {
    alignItems: 'center',
  },
  
  // Espacement
  marginVertical: {
    marginVertical: 10,
  },
  
  marginHorizontal: {
    marginHorizontal: 10,
  },
  
  padding: {
    padding: 16,
  },
  
  // Séparateurs
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: 20,
    width: '80%',
    alignSelf: 'center',
  },
  
  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  
  loadingText: {
    marginTop: 16,
    ...typography.body.base,
    color: colors.text.secondary,
  },
  
  // Shadows
  shadowSmall: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});