import { StyleSheet } from 'react-native';

const LoginStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
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
    loginButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    registerLink: {
        alignItems: 'center',
        marginTop: 20,
    },
    registerLinkText: {
        color: '#007AFF',
        fontSize: 16,
    },
    // ✅ AJOUT : Style pour le bouton de test
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

export default LoginStyles;