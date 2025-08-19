import { StyleSheet } from "react-native";
const RegisterStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: 'white',
    },
    // ✅ AJOUT : Style pour le texte d'aide
    helpText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
    },
    registerButton: {
        backgroundColor: '#34C759',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    registerButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    loginLink: {
        alignItems: 'center',
        marginTop: 20,
    },
    loginLinkText: {
        color: '#007AFF',
        fontSize: 16,
    },
    // AJOUT : Style pour le consentement
    consentGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    consentText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    // AJOUT : Style pour le bouton de test
    testButton: {
        alignItems: 'center',
        marginTop: 15,
        padding: 10,
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#FFC107',
    },
    testButtonText: {
        color: '#856404',
        fontSize: 14,
        fontStyle: 'italic',
    },
});

export default RegisterStyles;