import { StyleSheet } from "react-native";

const profilStyles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 20,
        paddingTop: 40,
        paddingBottom: 50,
    },
    
    // Styles pour les infos utilisateur
    userInfoContainer: {
        backgroundColor: '#e3f2fd',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        width: '100%',
        borderLeftWidth: 4,
        borderLeftColor: '#1976d2',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
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

    // ✅ AJOUT : Styles pour le statut
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

    // ✅ AJOUT : Loading state
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
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
    
    // Styles des boutons d'action
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    anamneseButton: {
        backgroundColor: '#34C759',
    },
    evaluationButton: {
        backgroundColor: '#FF9500',
    },
    // ✅ AJOUT : Style pour boutons complétés
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

    // ✅ AJOUT : Bouton refresh
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        marginTop: 10,
    },
    refreshText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    
    // Styles pour le bouton ampoule et l'info
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
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

    // Styles pour le bouton de déconnexion
    logoutContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 30,
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        width: '70%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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