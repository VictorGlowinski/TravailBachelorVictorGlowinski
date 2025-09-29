// utils/apiHelper.ts - VERSION AMÉLIORÉE

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '@/constants/config';

/**
 * HELPER pour faire des requêtes authentifiées
 */
export const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // RÉCUPÉRER LE TOKEN
    const token = await AsyncStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    // CONSTRUIRE L'URL COMPLÈTE
    const url = endpoint.startsWith('http') ? endpoint : `${CONFIG.API_BASE_URL}${endpoint}`;

    // AJOUTER L'AUTHORIZATION HEADER
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`, // TOKEN SANCTUM
      ...(options.headers || {})
    };

    console.log('📤 Requête authentifiée:', { url, method: options.method || 'GET' });

    // FAIRE LA REQUÊTE
    const response = await fetch(url, {
      ...options,
      headers
    });

    console.log('📥 Réponse:', response.status);

    // GERER L'EXPIRATION DU TOKEN
    if (response.status === 401) {
      console.warn('🔒 Token expiré, nettoyage de la session');
      await AsyncStorage.multiRemove(['user', 'authToken', 'userId']); 
      throw new Error('Session expirée, veuillez vous reconnecter');
    }

    return response;
  } catch (error) {
    console.error('❌ Erreur requête authentifiée:', error);
    throw error;
  }
};

/**
 * HELPERS spécifiques
 */
export const apiGet = async (endpoint: string) => {
  const response = await authenticatedFetch(endpoint, { method: 'GET' });
  return response.json();
};

export const apiPost = async (endpoint: string, data: any) => {
  const response = await authenticatedFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
};

export const apiPut = async (endpoint: string, data: any) => {
  const response = await authenticatedFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
};

export const apiDelete = async (endpoint: string) => {
  const response = await authenticatedFetch(endpoint, { method: 'DELETE' });
  return response.json();
};