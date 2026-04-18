/**
 * VoiceService — natural TTS using expo-speech
 * Supports all 11 app languages with tuned rate/pitch per language
 */
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VOICE_SETTINGS_KEY = '@voiceaid:voice_settings';

// BCP-47 locale per i18n language code
const LOCALE_MAP = {
  en: 'en-US',
  hi: 'hi-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  sw: 'sw-KE',
  ar: 'ar-SA',
  es: 'es-ES',
  fr: 'fr-FR',
  id: 'id-ID',
};

// Some languages need slightly different rate for natural delivery
const RATE_OVERRIDES = {
  hi: 0.88,
  mr: 0.88,
  ta: 0.85,
  bn: 0.88,
  te: 0.85,
  ar: 0.85,
  id: 0.90,
};

class VoiceService {
  constructor() {
    this.isSpeaking = false;
    this.settings = {
      language: 'en',
      pitch: 1.0,
      rate: 0.9,
    };
    this.loadSettings();
  }

  async loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(VOICE_SETTINGS_KEY);
      if (stored) this.settings = { ...this.settings, ...JSON.parse(stored) };
    } catch (e) {
      console.warn('Failed to load voice settings:', e);
    }
  }

  async saveSettings(patch) {
    try {
      this.settings = { ...this.settings, ...patch };
      await AsyncStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save voice settings:', e);
    }
  }

  /**
   * Speak text aloud.
   * @param {string} text
   * @param {object} options  — language (BCP-47 or i18n code), rate, pitch, onDone, onError, onStopped
   */
  async speak(text, options = {}) {
    if (!text) return;
    try {
      if (this.isSpeaking) await this.stop();

      // Resolve language to BCP-47
      const langCode = options.language || this.settings.language || 'en';
      const locale = LOCALE_MAP[langCode] || langCode; // accept both 'hi' and 'hi-IN'

      // Rate: option > language override > saved setting > default
      const rate =
        options.rate ??
        RATE_OVERRIDES[langCode.split('-')[0]] ??
        this.settings.rate ??
        0.9;

      const pitch = options.pitch ?? this.settings.pitch ?? 1.0;

      await Speech.speak(text, {
        language: locale,
        rate,
        pitch,
        onStart:   () => { this.isSpeaking = true;  options.onStart?.(); },
        onDone:    () => { this.isSpeaking = false; options.onDone?.(); },
        onStopped: () => { this.isSpeaking = false; options.onStopped?.(); },
        onError:   (err) => {
          this.isSpeaking = false;
          console.warn('TTS error:', err);
          options.onError?.(err);
        },
      });
    } catch (err) {
      this.isSpeaking = false;
      console.error('VoiceService.speak error:', err);
      options.onError?.(err);
    }
  }

  async stop() {
    try {
      await Speech.stop();
    } catch {}
    this.isSpeaking = false;
  }

  async pause()  { try { await Speech.pause();  } catch {} }
  async resume() { try { await Speech.resume(); } catch {} }

  isSpeakingNow() { return this.isSpeaking; }

  async getAvailableVoices() {
    try { return await Speech.getAvailableVoicesAsync(); }
    catch { return []; }
  }

  /** @param {'slow'|'normal'|'fast'} speed */
  async setSpeed(speed) {
    const rates = { slow: 0.72, normal: 0.9, fast: 1.12 };
    await this.saveSettings({ rate: rates[speed] ?? 0.9 });
  }

  /** @param {string} langCode — i18n code like 'hi' or BCP-47 like 'hi-IN' */
  async setLanguage(langCode) {
    await this.saveSettings({ language: langCode });
  }

  getSettings() { return { ...this.settings }; }
}

export default new VoiceService();
