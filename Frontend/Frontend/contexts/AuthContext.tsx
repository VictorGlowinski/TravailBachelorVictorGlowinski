// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// ✅ Configuration intelligente pour iPhone physique + Expo Go
const getApiBaseUrl = () => {
    if (__DEV__) {
        // En développement avec Expo Go
        const expoUrl = Constants.manifest2?.extra?.expoGo?.debuggerHost;
        if (expoUrl) {
            // Extrait l'IP de Expo Go (ex: "192.168.0.112:19000" -> "192.168.0.112")
            const ip = expoUrl.split(':')[0];
            return `http://${ip}:8000/api`;
        }
        // Fallback sur votre IP manuelle
        return 'http://192.168.0.112:8000/api'; // ✅ VOTRE IP
    } else {
        // Production - remplacez par votre domaine futur
        return 'https://votre-domaine.com/api';
    }
};

const API_BASE_URL = getApiBaseUrl();
console.log('🌐 API URL détectée:', API_BASE_URL); // ✅ Log pour vérifier

interface User {
    id: number;
    email: string;
    date_naissance: string; // ✅ Sans use_ pour le frontend
    consentement: boolean;  // ✅ Sans use_ pour le frontend
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: any) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');
            
            if (userData && token) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Erreur vérification auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: {
        email: string;
        password: string;
        password_confirmation: string;
        use_date_naissance: string; // ✅ ENVOI : use_date_naissance
        use_consentement: boolean;  // ✅ ENVOI : use_consentement
    }): Promise<boolean> => {
        try {
            console.log('🔄 Tentative d\'inscription...', { 
                url: `${API_BASE_URL}/register`,
                userData: { ...userData, password: '***' }
            });

            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error:', errorText);
                return false;
            }

            const result = await response.json();
            console.log('✅ Response data:', result);

            if (result.success) {
                await AsyncStorage.setItem('user', JSON.stringify(result.user));
                await AsyncStorage.setItem('token', result.token);
                await AsyncStorage.setItem('userId', result.user.id.toString());
                
                setUser(result.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erreur register:', error);
            
            if (error instanceof Error && error.message === 'Network request failed') {
                console.error('🌐 Problème réseau - Vérifiez :');
                console.error('   1. Laravel serve --host=0.0.0.0 est lancé');
                console.error('   2. IP correcte:', API_BASE_URL);
                console.error('   3. iPhone et PC sur même Wi-Fi');
                console.error('   4. Firewall Windows');
            }
            
            return false;
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            console.log('🔄 Tentative de connexion...', { 
                url: `${API_BASE_URL}/login`,
                email 
            });

            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('📡 Login response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Login error:', errorText);
                return false;
            }

            const result = await response.json();
            console.log('✅ Login success:', result);

            if (result.success) {
                await AsyncStorage.setItem('user', JSON.stringify(result.user));
                await AsyncStorage.setItem('token', result.token);
                await AsyncStorage.setItem('userId', result.user.id.toString());
                
                setUser(result.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erreur login:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['user', 'token', 'userId']);
            setUser(null);
        } catch (error) {
            console.error('Erreur logout:', error);
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}