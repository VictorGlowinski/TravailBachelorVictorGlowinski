// styles/screens/ThemeStyle.ts - PLUS DE CONTRASTE pour les couleurs claires

import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  console.log('🎨 ColorScheme détecté:', colorScheme, 'isDarkMode:', isDarkMode);

  return {
    isDarkMode,
    colors: {
      background: isDarkMode ? '#0D1117' : '#FFFFFF',      
      surface: isDarkMode ? '#1C2128' : '#F8F9FA',
      surfaceVariant: isDarkMode ? '#21262D' : '#E8EAED',

      primary: isDarkMode ? '#F0F6FC' : '#000000',         
      secondary: isDarkMode ? '#8B949E' : '#4A5568',       
      tertiary: isDarkMode ? '#6E7681' : '#718096',
      disabled: isDarkMode ? '#484F58' : '#A0AEC0',

      accent: isDarkMode ? '#58A6FF' : '#2B6CB0',
      success: isDarkMode ? '#3FB950' : '#22543D',
      warning: isDarkMode ? '#D29922' : '#C05621',
      error: isDarkMode ? '#F85149' : '#C53030',

      border: isDarkMode ? '#30363D' : '#CBD5E0',
      divider: isDarkMode ? '#21262D' : '#E2E8F0',
    },
    shadows: isDarkMode ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 5,
    }
  };
};