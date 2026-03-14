/**
 * Typography System
 * Professional, accessible typography
 */

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Text styles — lineHeight must be px in React Native
  styles: {
    h1: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 45,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700',
      lineHeight: 38,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 30,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 30,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 21,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
    },
  },
};

export default typography;
