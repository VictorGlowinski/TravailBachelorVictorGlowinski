// styles/screens/ThemeStyle.ts - PLUS DE CONTRASTE pour les couleurs claires

import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  console.log('🎨 ColorScheme détecté:', colorScheme, 'isDarkMode:', isDarkMode);

  return {
    isDarkMode,
    colors: {
      // ✅ COULEURS AVEC PLUS DE CONTRASTE
      background: isDarkMode ? '#0D1117' : '#FFFFFF',      // ✅ Blanc pur au lieu de #F8F9FA
      surface: isDarkMode ? '#1C2128' : '#F8F9FA',         // ✅ Gris clair au lieu de blanc
      surfaceVariant: isDarkMode ? '#21262D' : '#E8EAED',  // ✅ Gris plus foncé et visible
      
      // ✅ TEXTES avec beaucoup plus de contraste en mode clair
      primary: isDarkMode ? '#F0F6FC' : '#000000',         // ✅ Noir pur au lieu de #24292F
      secondary: isDarkMode ? '#8B949E' : '#4A5568',       // ✅ Gris beaucoup plus foncé
      tertiary: isDarkMode ? '#6E7681' : '#718096',        // ✅ Gris moyen plus contrasté
      disabled: isDarkMode ? '#484F58' : '#A0AEC0',        // ✅ Gris désactivé plus visible
      
      // ✅ COULEURS D'ACCENT plus vives en mode clair
      accent: isDarkMode ? '#58A6FF' : '#2B6CB0',          // ✅ Bleu plus foncé et saturé
      success: isDarkMode ? '#3FB950' : '#22543D',         // ✅ Vert très foncé
      warning: isDarkMode ? '#D29922' : '#C05621',         // ✅ Orange foncé
      error: isDarkMode ? '#F85149' : '#C53030',           // ✅ Rouge foncé et saturé
      
      // ✅ BORDURES plus marquées en mode clair
      border: isDarkMode ? '#30363D' : '#CBD5E0',          // ✅ Gris plus foncé pour les bordures
      divider: isDarkMode ? '#21262D' : '#E2E8F0',         // ✅ Séparateurs plus visibles
    },
    shadows: isDarkMode ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    } : {
      // ✅ OMBRES plus marquées en mode clair
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },              // ✅ Offset plus grand
      shadowOpacity: 0.15,                                 // ✅ Plus opaque
      shadowRadius: 10,                                    // ✅ Plus étendu
      elevation: 5,                                        // ✅ Élévation plus haute
    }
  };
};