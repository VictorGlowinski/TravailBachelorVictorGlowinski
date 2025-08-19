
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

import { useColorScheme } from '@/components/useColorScheme';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return; // ✅ Attendre la vérification

    const inAuthGroup = segments[0] === '(auth)';
    
    console.log('🔍 Navigation check:', { 
      isAuthenticated, 
      inAuthGroup, 
      segments: segments[0],
      currentRoute: segments.join('/')
    });

    if (!isAuthenticated && !inAuthGroup) {
      // ✅ Utilisateur non connecté ET pas dans auth → aller vers login
      console.log('🔄 Redirecting to login (not authenticated, not in auth)');
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // ✅ Utilisateur connecté ET dans auth → aller vers l'app
      console.log('🔄 Redirecting to tabs (authenticated, in auth)');
      router.replace('/(tabs)');
    }
    // ✅ IMPORTANT : Ne rien faire dans les autres cas pour permettre la navigation dans auth
    
  }, [isAuthenticated, isLoading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true }} />
      </Stack>
    </ThemeProvider>
  );
}