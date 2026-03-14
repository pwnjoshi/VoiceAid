import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import hi from '../locales/hi.json';

const LANGUAGE_KEY = '@voiceaid:language';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

// Detect device language synchronously for initial render
const deviceLang = Localization.locale?.split('-')[0] || 'en';
const initialLang = resources[deviceLang] ? deviceLang : 'en';

// Initialize synchronously so useTranslation() works on first render
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

// Then async-load the saved preference and switch if needed
AsyncStorage.getItem(LANGUAGE_KEY).then((saved) => {
  if (saved && saved !== i18n.language && resources[saved]) {
    i18n.changeLanguage(saved);
  }
}).catch(() => {});

export const changeLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

export const getCurrentLanguage = () => i18n.language;

export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
];

export default i18n;
