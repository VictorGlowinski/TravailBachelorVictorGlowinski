// app/(auth)/login.tsx
import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext'; // CORRECTION : Import corrigé
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, router } from 'expo-router'; // ✅ Ajoutez Link
import LoginStyles from '@/styles/screens/LoginStyles'; // ✅ Import des styles


export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setIsLoading(true);
        try {
            const success = await login(email, password);
            
            if (success) {
                console.log('Connexion réussie');
            } else {
                Alert.alert('Erreur', 'Email ou mot de passe incorrect');
            }
        } catch (error) {
            console.error('Erreur login:', error);
            Alert.alert('Erreur', 'Impossible de se connecter');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={LoginStyles.container}>
            <View style={LoginStyles.header}>
                <FontAwesome name="user-circle" size={80} color="#007AFF" />
                <Text style={LoginStyles.title}>Connexion</Text>
                <Text style={LoginStyles.subtitle}>Triathlon Training App</Text>
            </View>

            <View style={LoginStyles.form}>
                <View style={LoginStyles.inputGroup}>
                    <Text style={LoginStyles.label}>Email</Text>
                    <TextInput
                        style={LoginStyles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="votre@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </View>

                <View style={LoginStyles.inputGroup}>
                    <Text style={LoginStyles.label}>Mot de passe</Text>
                    <TextInput
                        style={LoginStyles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Votre mot de passe"
                        secureTextEntry
                        autoComplete="password"
                    />
                </View>

                <Pressable 
                    style={[LoginStyles.loginButton, isLoading && LoginStyles.disabledButton]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={LoginStyles.loginButtonText}>
                        {isLoading ? 'Connexion...' : 'Se connecter'}
                    </Text>
                </Pressable>

                <Pressable 
                    style={LoginStyles.registerLink}
                    onPress={() => {
                        console.log('🔄 Tentative de navigation vers register...');
                        console.log('🔍 Route actuelle:', router);
                        
                        try {
                            router.push('/(auth)/register');
                            console.log('✅ Navigation réussie');
                        } catch (error) {
                            console.error('❌ Erreur navigation:', error);
                        }
                    }}
                >
                    <Text style={LoginStyles.registerLinkText}>
                        Pas de compte ? S'inscrire
                    </Text>
                </Pressable>

                <Pressable 
                    style={LoginStyles.testButton}
                    onPress={() => {
                        setEmail('test@example.com');
                        setPassword('password123');
                    }}
                >
                    <Text style={LoginStyles.testButtonText}>Remplir test (dev)</Text>
                </Pressable>
            </View>
        </View>
    );
}

