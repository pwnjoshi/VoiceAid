/**
 * OfflineAIService
 * On-device AI with pattern matching.
 * Delegates rich knowledge queries to EnhancedOfflineService,
 * and handles time, emergency, and greeting intents directly.
 */
import EnhancedOfflineService from './EnhancedOfflineService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineAIService {
  constructor() {
    this.isOnline     = false;
    this.batteryLevel = 100;
    this.conversationHistory = [];
  }

  setNetworkStatus(isConnected) {
    this.isOnline = isConnected;
  }

  // ── Intent classification ──────────────────────────────────────────────────
  classifyIntent(text) {
    const lower = text.toLowerCase();

    if (/\btime\b|\bclock\b/.test(lower) && !/emergency/.test(lower)) return 'time';
    if (/emergency|urgent|danger|ambulance/.test(lower) && !/otp|scam|fraud/.test(lower)) return 'emergency';
    if (/crop|farm|pest|plant|seed|soil|fertilizer|harvest|rice|wheat|corn|cassava/.test(lower)) return 'agriculture';
    if (/fever|pain|sick|medicine|doctor|health|cough|cold|headache|malaria|diarrhea/.test(lower)) return 'health';
    if (/otp|scam|fraud|bank|password|pin|upi|phishing/.test(lower)) return 'safety';
    if (/\bdate\b|\bday\b|\btoday\b/.test(lower)) return 'time';
    if (/police|fire brigade|fire department/.test(lower)) return 'emergency';

    return 'general';
  }

  // ── Main offline processing ────────────────────────────────────────────────
  async processOffline(query) {
    const intent = this.classifyIntent(query);

    // Handle time intent directly
    if (intent === 'time') {
      const now = new Date();
      const isDateQuery = /date|day|today/.test(query.toLowerCase());
      const response = isDateQuery
        ? `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
        : `Current time is ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      return { success: true, response, category: 'time', confidence: 1.0, offline: true, source: 'on-device' };
    }

    // Handle emergency intent directly
    if (intent === 'emergency') {
      return {
        success: true,
        response: 'For emergency: Call 112 (international), 108 for ambulance, 100 for police, 101 for fire. Stay calm and speak clearly.',
        category: 'emergency',
        confidence: 1.0,
        offline: true,
        source: 'on-device',
      };
    }

    // Delegate everything else to EnhancedOfflineService
    const result = await EnhancedOfflineService.search(query);
    return {
      success:    result.success,
      response:   result.response,
      category:   intent !== 'general' ? intent : (EnhancedOfflineService.detectCategory(query) || 'general'),
      confidence: result.confidence ?? 0.3,
      offline:    true,
      source:     result.source || 'on-device',
    };
  }

  // ── Processing mode ────────────────────────────────────────────────────────
  async getProcessingMode() {
    if (this.batteryLevel < 20) return 'low-power';
    if (!this.isOnline)         return 'offline';
    return 'online';
  }

  // ── Network status ─────────────────────────────────────────────────────────
  getNetworkStatus() {
    return {
      isOnline:     this.isOnline,
      batteryLevel: this.batteryLevel,
      mode:         this.isOnline ? 'online' : 'offline',
    };
  }

  // ── History ────────────────────────────────────────────────────────────────
  async getHistory() {
    try {
      const stored = await AsyncStorage.getItem('conversation_history');
      return stored ? JSON.parse(stored) : this.conversationHistory;
    } catch { return this.conversationHistory; }
  }

  async clearHistory() {
    this.conversationHistory = [];
    await AsyncStorage.removeItem('conversation_history');
  }
}

export default new OfflineAIService();
