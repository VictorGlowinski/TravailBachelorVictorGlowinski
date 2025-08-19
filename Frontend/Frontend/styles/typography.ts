// styles/typography.ts
import { TextStyle } from 'react-native';

export const typography = {
  // Tailles de police
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  
  // Poids de police
  fontWeight: {
    normal: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },
  
  // Styles de texte prédéfinis
  heading: {
    h1: {
      fontSize: 28,
      fontWeight: '700' as TextStyle['fontWeight'],
      lineHeight: 34,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as TextStyle['fontWeight'],
      lineHeight: 30,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 26,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 24,
    },
  },
  
  body: {
    large: {
      fontSize: 18,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 24,
    },
    base: {
      fontSize: 16,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 22,
    },
    small: {
      fontSize: 14,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 20,
    },
    xs: {
      fontSize: 12,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 18,
    },
  },
  
  button: {
    large: {
      fontSize: 18,
      fontWeight: '700' as TextStyle['fontWeight'],
    },
    medium: {
      fontSize: 16,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
    small: {
      fontSize: 14,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
  },
  
  label: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    marginBottom: 8,
  }
};