// contexts/AuthContext.tsx
import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

console.log('🌐 API URL détectée:', CONFIG.API_BASE_URL);

interface User {
    id: number;
    email: string;
    date_naissance?: string;
    consentement?: boolean;
    created_at?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null; 
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: any) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null); // ÉTAT DU TOKEN
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        try {
            console.log('🔍 Vérification état authentification...');
            
            const [userData, storedToken, userId] = await Promise.all([
                AsyncStorage.getItem('user'),
                AsyncStorage.getItem('authToken'), 
                AsyncStorage.getItem('userId')
            ]);
            
            console.log('📦 Données stockées:', {
                hasUser: !!userData,
                hasToken: !!storedToken,
                hasUserId: !!userId
            });
            
            if (userData && storedToken) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setToken(storedToken);
                console.log('✅ Utilisateur restauré:', parsedUser.email);
            } else {
                console.log('❌ Aucune session valide trouvée');
            }
        } catch (error) {
            console.error('❌ Erreur vérification auth:', error);
            // NETTOYER en cas d'erreur
            await clearAuth();
        } finally {
            setIsLoading(false);
        }
    };

    const clearAuth = async () => {
        try {
            await AsyncStorage.multiRemove(['user', 'authToken', 'userId']);
            setUser(null);
            setToken(null);
        } catch (error) {
            console.error('❌ Erreur nettoyage auth:', error);
        }
    };

    const register = async (userData: {
        email: string;
        password: string;
        password_confirmation: string;
        use_date_naissance: string;
        use_consentement: boolean;
    }): Promise<boolean> => {
        try {
            console.log('🔄 Tentative d\'inscription...', { 
                url: `${CONFIG.API_BASE_URL}/register`,
                email: userData.email
            });

            const response = await fetch(`${CONFIG.API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            console.log('📡 Register response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('❌ Register error:', errorData);
                return false;
            }

            const result = await response.json();
            console.log('✅ Register success:', { 
                success: result.success, 
                hasUser: !!result.user,
                hasToken: !!result.token 
            });

            if (result.success && result.user) {
                // STOCKER TOUTES LES DONNÉES
                await Promise.all([
                    AsyncStorage.setItem('user', JSON.stringify(result.user)),
                    AsyncStorage.setItem('authToken', result.token || ''), // Si token fourni
                    AsyncStorage.setItem('userId', result.user.id.toString())
                ]);
                
                setUser(result.user);
                if (result.token) {
                    setToken(result.token);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erreur register:', error);
            
            if (error instanceof Error && error.message === 'Network request failed') {
                console.error('🌐 Problème réseau - Vérifiez :');
                console.error('   1. Serveur Laravel démarré');
                console.error('   2. URL correcte:', CONFIG.API_BASE_URL);
                console.error('   3. Connexion réseau');
            }
            
            return false;
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            console.log('🔄 Tentative de connexion...', { 
                url: `${CONFIG.API_BASE_URL}/login`,
                email 
            });

            const response = await fetch(`${CONFIG.API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('📡 Login response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('❌ Login error:', errorData);
                return false;
            }

            const result = await response.json();
            console.log('✅ Login success:', { 
                success: result.success, 
                hasUser: !!result.user,
                hasToken: !!result.token 
            });

            if (result.success && result.user && result.token) {
                // STOCKER USER + TOKEN
                await Promise.all([
                    AsyncStorage.setItem('user', JSON.stringify(result.user)),
                    AsyncStorage.setItem('authToken', result.token), // TOKEN OBLIGATOIRE
                    AsyncStorage.setItem('userId', result.user.id.toString())
                ]);
                
                setUser(result.user);
                setToken(result.token);
                console.log('🎉 Connexion réussie pour:', result.user.email);
                return true;
            } else {
                console.error('❌ Réponse login incomplète:', result);
                return false;
            }
        } catch (error) {
            console.error('❌ Erreur login:', error);
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            console.log('🔄 Déconnexion en cours...');
            
            // APPELER L'API LOGOUT si token disponible
            if (token) {
                try {
                    const response = await fetch(`${CONFIG.API_BASE_URL}/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                    });
                    
                    console.log('📡 Logout API status:', response.status);
                } catch (apiError) {
                    console.error('⚠️ Erreur API logout (continuant quand même):', apiError);
                }
            }
            
            // NETTOYER LE STOCKAGE LOCAL dans tous les cas
            await clearAuth();
            console.log('✅ Déconnexion terminée');
            
        } catch (error) {
            console.error('❌ Erreur logout:', error);
            // FORCER LE NETTOYAGE même en cas d'erreur
            await clearAuth();
        }
    };

    const value: AuthContextType = {
        user,
        token, // EXPOSER LE TOKEN
        isAuthenticated: !!user && !!token, // VÉRIFIER USER ET TOKEN
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