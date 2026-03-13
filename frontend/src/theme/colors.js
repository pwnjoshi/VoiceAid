/**
 * Professional Color Palette
 * Modern, accessible colors for VoiceAid
 */

export const colors = {
  // Primary colors
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main primary
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  
  // Status colors
  success: {
    light: '#10B981',
    main: '#059669',
    dark: '#047857',
  },
  
  warning: {
    light: '#F59E0B',
    main: '#D97706',
    dark: '#B45309',
  },
  
  error: {
    light: '#EF4444',
    main: '#DC2626',
    dark: '#B91C1C',
  },
  
  info: {
    light: '#3B82F6',
    main: '#2563EB',
    dark: '#1D4ED8',
  },
  
  // Neutral colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Background
  background: {
    default: '#FFFFFF',
    paper: '#F9FAFB',
    dark: '#111827',
  },
  
  // Text
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  
  // Voice button states
  voice: {
    idle: '#6B7280',
    listening: '#3B82F6',
    processing: '#10B981',
    speaking: '#F59E0B',
    offline: '#8B5CF6',
    error: '#EF4444',
  },
  
  // Semantic colors
  online: '#10B981',
  offline: '#8B5CF6',
  battery: {
    high: '#10B981',
    medium: '#F59E0B',
    low: '#EF4444',
  },
};

export default colors;
