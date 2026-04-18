import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';
import ta from '../locales/ta.json';
import bn from '../locales/bn.json';
import te from '../locales/te.json';
import sw from '../locales/sw.json';
import ar from '../locales/ar.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import id from '../locales/id.json';

const LANGUAGE_KEY = '@voiceaid:language';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  ta: { translation: ta },
  bn: { translation: bn },
  te: { translation: te },
  sw: { translation: sw },
  ar: { translation: ar },
  es: { translation: es },
  fr: { translation: fr },
  id: { translation: id },
};

const deviceLang = Localization.locale?.split('-')[0] || 'en';
const initialLang = resources[deviceLang] ? deviceLang : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

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
  { code: 'en', name: 'English',    nativeName: 'English',    region: 'Global' },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिंदी',       region: 'South Asia' },
  { code: 'mr', name: 'Marathi',    nativeName: 'मराठी',       region: 'South Asia' },
  { code: 'ta', name: 'Tamil',      nativeName: 'தமிழ்',       region: 'South Asia' },
  { code: 'bn', name: 'Bengali',    nativeName: 'বাংলা',       region: 'South Asia' },
  { code: 'te', name: 'Telugu',     nativeName: 'తెలుగు',      region: 'South Asia' },
  { code: 'sw', name: 'Swahili',    nativeName: 'Kiswahili',   region: 'Africa' },
  { code: 'ar', name: 'Arabic',     nativeName: 'العربية',     region: 'Middle East & Africa' },
  { code: 'es', name: 'Spanish',    nativeName: 'Español',     region: 'Latin America' },
  { code: 'fr', name: 'French',     nativeName: 'Français',    region: 'Africa & Global' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'SE Asia' },
];

export default i18n;
