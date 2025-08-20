// styles/screens/ProfilStyles.ts - VERSION COMPLÈTE avec tous les styles

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const profilStyles = StyleSheet.create({
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
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    // backgroundColor sera définie dynamiquement
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor sera définie dynamiquement
  },
  userInfo: {
    alignItems: 'center',
    gap: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    // color sera définie dynamiquement
  },
  emailText: {
    fontSize: 16,
    textAlign: 'center',
    // color sera définie dynamiquement
  },

  // ✅ BADGES DE PROGRESSION
  progressBadges: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    // backgroundColor sera définie dynamiquement
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
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

  // ✅ SECTION ACTIONS
  actionsSection: {
    padding: 20,
    gap: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    // color sera définie dynamiquement
  },
  cardsContainer: {
    gap: 15,
  },

  // ✅ CARTES D'ACTION MODERNISÉES
  actionCard: {
    borderRadius: 16,
    padding: 20,
    // backgroundColor sera définie dynamiquement
  },
  completedCard: {
    // Style spécial pour les cartes complétées
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor sera définie dynamiquement
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    // color sera définie dynamiquement
  },
  cardSubtitle: {
    fontSize: 14,
    // color sera définie dynamiquement
  },
  cardChevron: {
    padding: 5,
  },

  // ✅ BOUTON REFRESH
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
    // backgroundColor sera définie dynamiquement
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
    // color sera définie dynamiquement
  },

  // ✅ SECTION AIDE MODERNISÉE
  helpSection: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    // backgroundColor sera définie dynamiquement
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 15,
  },
  helpIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    // color sera définie dynamiquement
  },
  helpContent: {
    padding: 20,
    paddingTop: 0,
    gap: 20,
    // backgroundColor sera définie dynamiquement
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  helpBullet: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor sera définie dynamiquement
  },
  helpBulletText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  helpTextContainer: {
    flex: 1,
    gap: 4,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    // color sera définie dynamiquement
  },
  helpItemText: {
    fontSize: 14,
    lineHeight: 20,
    // color sera définie dynamiquement
  },
  helpNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 10,
    // backgroundColor sera définie dynamiquement
  },
  helpNoteText: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    // color sera définie dynamiquement
  },

  // ✅ SECTION DÉCONNEXION
  logoutSection: {
    padding: 20,
    paddingTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    gap: 12,
    // backgroundColor sera définie dynamiquement
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // ✅ STYLES LEGACY (gardés pour compatibilité)
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  userInfoContainer: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  userInfoText: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 6,
  },
  statusCompleted: {
    color: '#34C759',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
    marginTop: 20,
  },
  button: {
    width: '90%',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anamneseButton: {
    backgroundColor: '#34C759',
  },
  evaluationButton: {
    backgroundColor: '#FF9500',
  },
  completedButton: {
    backgroundColor: '#8E8E93',
    borderWidth: 2,
    borderColor: '#34C759',
  },
  buttonIcon: {
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  helpContainer: {
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  helpButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    width: '90%',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  infoText: {
    fontSize: 14,
    color: '#2C5282',
    textAlign: 'left',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#1A365D',
  },
  logoutContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default profilStyles;