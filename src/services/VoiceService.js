/**
 * Voice Service
 * Natural text-to-speech with on-device processing
 * Supports multiple languages and voice customization
 */
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VOICE_SETTINGS_KEY = '@voiceaid:voice_settings';

class VoiceService {
  constructor() {
    this.isSpeaking = false;
    this.settings = {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9, // Slightly slower for clarity
      volume: 1.0,
    };
    this.loadSettings();
  }

  /**
   * Load voice settings from storage
   */
  async loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(VOICE_SETTINGS_KEY);
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load voice settings:', error);
    }
  }

  /**
   * Save voice settings
   */
  async saveSettings(settings) {
    try {
      this.settings = { ...this.settings, ...settings };
      await AsyncStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save voice settings:', error);
    }
  }

  /**
   * Speak text with natural voice
   * @param {string} text - Text to speak
   * @param {Object} options - Voice options
   */
  async speak(text, options = {}) {
    try {
      // Stop any ongoing speech
      if (this.isSpeaking) {
        await this.stop();
      }

      const voiceOptions = {
        language: options.language || this.settings.language,
        pitch: options.pitch || this.settings.pitch,
        rate: options.rate || this.settings.rate,
        volume: options.volume || this.settings.volume,
        onStart: () => {
          this.isSpeaking = true;
          if (options.onStart) options.onStart();
        },
        onDone: () => {
          this.isSpeaking = false;
          if (options.onDone) options.onDone();
        },
        onStopped: () => {
          this.isSpeaking = false;
          if (options.onStopped) options.onStopped();
        },
        onError: (error) => {
          this.isSpeaking = false;
          console.error('Speech error:', error);
          if (options.onError) options.onError(error);
        },
      };

      await Speech.speak(text, voiceOptions);
    } catch (error) {
      console.error('Failed to speak:', error);
      this.isSpeaking = false;
      throw error;
    }
  }

  /**
   * Stop speaking
   */
  async stop() {
    try {
      await Speech.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  }

  /**
   * Pause speaking
   */
  async pause() {
    try {
      await Speech.pause();
    } catch (error) {
      console.error('Failed to pause speech:', error);
    }
  }

  /**
   * Resume speaking
   */
  async resume() {
    try {
      await Speech.resume();
    } catch (error) {
      console.error('Failed to resume speech:', error);
    }
  }

  /**
   * Check if speaking
   */
  isSpeakingNow() {
    return this.isSpeaking;
  }

  /**
   * Get available voices
   */
  async getAvailableVoices() {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    } catch (error) {
      console.error('Failed to get voices:', error);
      return [];
    }
  }

  /**
   * Set voice speed
   * @param {string} speed - 'slow', 'normal', 'fast'
   */
  async setSpeed(speed) {
    const rates = {
      slow: 0.7,
      normal: 0.9,
      fast: 1.1,
    };
    
    await this.saveSettings({ rate: rates[speed] || 0.9 });
  }

  /**
   * Set language
   * @param {string} languageCode - Language code (e.g., 'en-US', 'hi-IN')
   */
  async setLanguage(languageCode) {
    const languageMap = {
      en: 'en-US',
      hi: 'hi-IN',
    };
    
    const language = languageMap[languageCode] || languageCode;
    await this.saveSettings({ language });
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Speak with emotion/emphasis
   * @param {string} text - Text to speak
   * @param {string} emotion - 'happy', 'sad', 'urgent', 'calm'
   */
  async speakWithEmotion(text, emotion = 'calm') {
    const emotionSettings = {
      happy: { pitch: 1.2, rate: 1.0 },
      sad: { pitch: 0.8, rate: 0.8 },
      urgent: { pitch: 1.1, rate: 1.2 },
      calm: { pitch: 1.0, rate: 0.9 },
    };

    const settings = emotionSettings[emotion] || emotionSettings.calm;
    await this.speak(text, settings);
  }

  /**
   * Speak with pauses for better comprehension
   * @param {Array} sentences - Array of sentences
   */
  async speakWithPauses(sentences) {
    for (let i = 0; i < sentences.length; i++) {
      await new Promise((resolve) => {
        this.speak(sentences[i], {
          onDone: () => {
            // Pause between sentences
            setTimeout(resolve, 500);
          },
        });
      });
    }
  }
}

export default new VoiceService();
