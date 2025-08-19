import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import RegisterStyles from '@/styles/screens/RegisterStyles';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password_confirmation: '',
        use_date_naissance: '',
        use_consentement: false 
    });
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleRegister = async () => {
        if (!formData.email || !formData.password || !formData.use_date_naissance) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        // AJOUT : Vérification du consentement
        if (!formData.use_consentement) {
            Alert.alert('Erreur', 'Vous devez accepter les conditions d\'utilisation');
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(formData.use_date_naissance)) {
            Alert.alert('Erreur', 'Format de date incorrect (YYYY-MM-DD)');
            return;
        }

        setIsLoading(true);
        try {
            const success = await register(formData); // ✅ Maintenant formData contient use_consentement
            
            if (success) {
                Alert.alert(
                    'Succès', 
                    'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
                    [{ text: 'OK', onPress: () => router.back()}]
                );
            } else {
                Alert.alert('Erreur', 'Impossible de créer le compte');
            }
        } catch (error) {
            console.error('Erreur register:', error);
            Alert.alert('Erreur', 'Impossible de créer le compte');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={RegisterStyles.container} contentContainerStyle={RegisterStyles.contentContainer}>
            <View style={RegisterStyles.header}>
                <Pressable onPress={() => router.back()} style={RegisterStyles.backButton}>
                    <FontAwesome name="arrow-left" size={24} color="#007AFF" />
                </Pressable>
                <FontAwesome name="user-plus" size={60} color="#007AFF" />
                <Text style={RegisterStyles.title}>Inscription</Text>
                <Text style={RegisterStyles.subtitle}>Créez votre compte triathlon</Text>
            </View>

            <View style={RegisterStyles.form}>
                <View style={RegisterStyles.inputGroup}>
                    <Text style={RegisterStyles.label}>Email</Text>
                    <TextInput
                        style={RegisterStyles.input}
                        value={formData.email}
                        onChangeText={(text) => setFormData({...formData, email: text})}
                        placeholder="votre@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </View>

                <View style={RegisterStyles.inputGroup}>
                    <Text style={RegisterStyles.label}>Date de naissance</Text>
                    <TextInput
                        style={RegisterStyles.input}
                        value={formData.use_date_naissance}
                        onChangeText={(text) => setFormData({...formData, use_date_naissance: text})}
                        placeholder="YYYY-MM-DD (ex: 1990-05-15)"
                        maxLength={10}
                    />
                    <Text style={RegisterStyles.helpText}>Format : Année-Mois-Jour</Text>
                </View>

                <View style={RegisterStyles.inputGroup}>
                    <Text style={RegisterStyles.label}>Mot de passe</Text>
                    <TextInput
                        style={RegisterStyles.input}
                        value={formData.password}
                        onChangeText={(text) => setFormData({...formData, password: text})}
                        placeholder="Au moins 6 caractères"
                        secureTextEntry
                        autoComplete="new-password"
                    />
                </View>

                <View style={RegisterStyles.inputGroup}>
                    <Text style={RegisterStyles.label}>Confirmer le mot de passe</Text>
                    <TextInput
                        style={RegisterStyles.input}
                        value={formData.password_confirmation}
                        onChangeText={(text) => setFormData({...formData, password_confirmation: text})}
                        placeholder="Répétez votre mot de passe"
                        secureTextEntry
                        autoComplete="new-password"
                    />
                </View>

                {/* AJOUT : Checkbox pour le consentement */}
                <View style={RegisterStyles.consentGroup}>
                    <Pressable 
                        style={RegisterStyles.checkbox}
                        onPress={() => setFormData({...formData, use_consentement: !formData.use_consentement})}
                    >
                        <FontAwesome 
                            name={formData.use_consentement ? "check-square" : "square-o"} 
                            size={20} 
                            color={formData.use_consentement ? "#34C759" : "#666"} 
                        />
                        <Text style={RegisterStyles.consentText}>
                            J'accepte que mes données soient utilisées à des fins académiques et de recherche
                        </Text>
                    </Pressable>
                </View>

                <Pressable 
                    style={[RegisterStyles.registerButton, isLoading && RegisterStyles.disabledButton]}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    <Text style={RegisterStyles.registerButtonText}>
                        {isLoading ? 'Création...' : 'Créer le compte'}
                    </Text>
                </Pressable>

                <Pressable 
                    style={RegisterStyles.loginLink}
                    onPress={() => router.back()}
                >
                    <Text style={RegisterStyles.loginLinkText}>
                        Déjà un compte ? Se connecter
                    </Text>
                </Pressable>

                {/* ✅ MODIFIÉ : Bouton de test avec consentement */}
                <Pressable 
                    style={RegisterStyles.testButton}
                    onPress={() => {
                        setFormData({
                            email: 'test@example.com',
                            password: 'password123',
                            password_confirmation: 'password123',
                            use_date_naissance: '1990-05-15',
                            use_consentement: true // ✅ Pré-cocher pour les tests
                        });
                    }}
                >
                    <Text style={RegisterStyles.testButtonText}>Remplir test (dev)</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

