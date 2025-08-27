// app/(auth)/register.tsx

import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
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
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const { register } = useAuth();

    // ✅ FONCTION pour formater la date d'affichage
    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    // ✅ GESTION du DatePicker
    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (selectedDate && event.type !== 'dismissed') {
                const formattedDate = selectedDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
                setFormData({...formData, use_date_naissance: formattedDate});
            }
        } else {
            // iOS - ne pas fermer automatiquement
            if (selectedDate && event.type !== 'dismissed') {
                setTempDate(selectedDate);
            } else if (event.type === 'dismissed') {
                setShowDatePicker(false);
                setTempDate(null);
            }
        }
    };

    // ✅ CONFIRMER la date sur iOS
    const confirmDate = () => {
        if (tempDate) {
            const formattedDate = tempDate.toISOString().split('T')[0];
            setFormData({...formData, use_date_naissance: formattedDate});
        }
        setShowDatePicker(false);
        setTempDate(null);
    };

    // ✅ ANNULER la sélection de date
    const cancelDateSelection = () => {
        setShowDatePicker(false);
        setTempDate(null);
    };

    const handleRegister = async () => {
        if (!formData.email || !formData.password || !formData.use_date_naissance) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

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
            Alert.alert('Erreur', 'Format de date incorrect');
            return;
        }

        // ✅ VÉRIFIER que la date n'est pas dans le futur
        const selectedDate = new Date(formData.use_date_naissance);
        const today = new Date();
        if (selectedDate > today) {
            Alert.alert('Erreur', 'La date de naissance ne peut pas être dans le futur');
            return;
        }

        // ✅ VÉRIFIER un âge minimum (ex: 13 ans)
        const age = today.getFullYear() - selectedDate.getFullYear();
        if (age < 13) {
            Alert.alert('Erreur', 'Vous devez avoir au moins 13 ans pour vous inscrire');
            return;
        }

        setIsLoading(true);
        try {
            const success = await register(formData);
            
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
                        placeholderTextColor="#666666" // ✅ PLACEHOLDER PLUS FONCÉ
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </View>

                {/* ✅ CHAMP DATE avec DatePicker */}
                <View style={RegisterStyles.inputGroup}>
                    <Text style={RegisterStyles.label}>Date de naissance</Text>
                    <Pressable
                        style={[RegisterStyles.input, RegisterStyles.dateInput]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={[
                            RegisterStyles.dateInputText,
                            { color: formData.use_date_naissance ? '#000' : '#666666' }
                        ]}>
                            {formData.use_date_naissance ? 
                             formatDateForDisplay(formData.use_date_naissance) : 
                             'Sélectionnez votre date de naissance'}
                        </Text>
                        <FontAwesome name="calendar" size={18} color="#666666" />
                    </Pressable>
                </View>

                <View style={RegisterStyles.inputGroup}>
                    <Text style={RegisterStyles.label}>Mot de passe</Text>
                    <TextInput
                        style={RegisterStyles.input}
                        value={formData.password}
                        onChangeText={(text) => setFormData({...formData, password: text})}
                        placeholder="Au moins 6 caractères"
                        placeholderTextColor="#666666" // ✅ PLACEHOLDER PLUS FONCÉ
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
                        placeholderTextColor="#666666" // ✅ PLACEHOLDER PLUS FONCÉ
                        secureTextEntry
                        autoComplete="new-password"
                    />
                </View>

                {/* CHECKBOX pour le consentement */}
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
            </View>

            {/* ✅ DateTimePicker avec contrôle iOS/Android */}
            {showDatePicker && (
                <>
                    {Platform.OS === 'ios' && (
                        <View style={RegisterStyles.datePickerContainer}>
                            {/* Header avec boutons */}
                            <View style={RegisterStyles.datePickerHeader}>
                                <Pressable
                                    style={RegisterStyles.datePickerCancelButton}
                                    onPress={cancelDateSelection}
                                >
                                    <Text style={RegisterStyles.datePickerCancelText}>Annuler</Text>
                                </Pressable>
                                
                                <Text style={RegisterStyles.datePickerTitle}>Date de naissance</Text>
                                
                                <Pressable
                                    style={RegisterStyles.datePickerConfirmButton}
                                    onPress={confirmDate}
                                >
                                    <Text style={RegisterStyles.datePickerConfirmText}>OK</Text>
                                </Pressable>
                            </View>
                            
                            {/* ✅ DatePicker iOS avec mode compact pour plus de contraste */}
                            <DateTimePicker
                                value={tempDate || (formData.use_date_naissance ? new Date(formData.use_date_naissance) : new Date(2000, 0, 1))}
                                mode="date"
                                display="spinner" // ✅ MODE SPINNER pour iOS
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                                minimumDate={new Date(1900, 0, 1)}
                                style={RegisterStyles.datePickerIOS}
                                themeVariant="light" // ✅ FORCER le thème clair
                            />
                        </View>
                    )}
                    
                    {Platform.OS === 'android' && (
                        <DateTimePicker
                            value={formData.use_date_naissance ? new Date(formData.use_date_naissance) : new Date(2000, 0, 1)}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                            minimumDate={new Date(1900, 0, 1)}
                        />
                    )}
                </>
            )}
        </ScrollView>
    );
}