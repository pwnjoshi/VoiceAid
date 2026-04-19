/**
 * ScamGuardService — Real-time scam detection
 *
 * Detects scam patterns in user speech and triggers immediate voice warning.
 * Works 100% offline — no API calls needed.
 *
 * Scam patterns are keyword + context based.
 * When triggered: speaks warning immediately, logs incident, offers report option.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

const SCAM_LOG_KEY = '@voiceaid:scam_log';

// High-confidence scam triggers — immediate STOP warning
const CRITICAL_PATTERNS = [
  /\botp\b/i,
  /one.?time.?password/i,
  /share.*code/i,
  /tell.*code/i,
  /verify.*account/i,
  /account.*blocked/i,
  /arrest.*warrant/i,
  /aadhaar.*blocked/i,
  /sim.*blocked/i,
  /send.*money.*urgent/i,
  /transfer.*now/i,
  /lottery.*won/i,
  /prize.*claim/i,
  /customs.*package/i,
  /income.?tax.*notice/i,
  /police.*case.*filed/i,
  /cyber.*crime.*department/i,
  /refund.*process/i,
  /remote.*access/i,
  /anydesk/i,
  /teamviewer/i,
  /screen.*share/i,
];

// Medium-confidence — ask user if they want to continue
const WARNING_PATTERNS = [
  /bank.*call/i,
  /rbi.*calling/i,
  /government.*scheme/i,
  /free.*money/i,
  /double.*money/i,
  /investment.*guarantee/i,
  /100.*percent.*return/i,
  /kyc.*update/i,
  /pin.*number/i,
  /cvv/i,
  /card.*number/i,
  /account.*number.*verify/i,
];

const SCAM_WARNING_EN = 'STOP! This sounds like a scam. Do not share any code or money. Hang up immediately and call your family or local police at 100.';
const SCAM_WARNING_HI = 'रुकिए! यह एक धोखा लग रहा है। कोई भी कोड या पैसे मत दीजिए। तुरंत फोन काटिए और परिवार या पुलिस को 100 पर फोन करिए।';

class ScamGuardService {
  constructor() {
    this.isActive = true;
    this.lastWarningTime = 0;
    this.warningCooldownMs = 30000; // don't repeat warning within 30s
  }

  /**
   * Check text for scam patterns.
   * @param {string} text — user's spoken text
   * @param {string} language — current app language
   * @returns {{ isScam: boolean, isCritical: boolean, pattern: string|null }}
   */
  check(text) {
    if (!this.isActive || !text) return { isScam: false, isCritical: false, pattern: null };

    const lower = text.toLowerCase();

    // Check critical patterns first
    for (const pattern of CRITICAL_PATTERNS) {
      if (pattern.test(lower)) {
        return { isScam: true, isCritical: true, pattern: pattern.toString() };
      }
    }

    // Check warning patterns
    for (const pattern of WARNING_PATTERNS) {
      if (pattern.test(lower)) {
        return { isScam: true, isCritical: false, pattern: pattern.toString() };
      }
    }

    return { isScam: false, isCritical: false, pattern: null };
  }

  /**
   * Trigger scam warning — speaks immediately, logs incident.
   * @param {string} language — 'hi' for Hindi, 'en' for English
   * @param {string} triggerText — what triggered the warning
   */
  async triggerWarning(language = 'en', triggerText = '') {
    const now = Date.now();
    if (now - this.lastWarningTime < this.warningCooldownMs) return;
    this.lastWarningTime = now;

    const warning = language === 'hi' ? SCAM_WARNING_HI : SCAM_WARNING_EN;

    // Stop any current speech and speak warning immediately
    try { await Speech.stop(); } catch {}

    Speech.speak(warning, {
      language: language === 'hi' ? 'hi-IN' : 'en-US',
      rate: 0.82,
      pitch: 1.1, // slightly higher pitch for urgency
    });

    // Log the incident
    await this.logIncident(triggerText, language);
  }

  /**
   * Log scam incident locally (privacy-preserving — no PII)
   */
  async logIncident(triggerText, language) {
    try {
      const raw = await AsyncStorage.getItem(SCAM_LOG_KEY);
      const log = raw ? JSON.parse(raw) : [];

      log.push({
        ts:       Date.now(),
        lang:     language,
        // Store only keyword that triggered, not full text
        trigger:  triggerText.substring(0, 50),
        reported: false,
      });

      // Keep last 50 incidents
      await AsyncStorage.setItem(SCAM_LOG_KEY, JSON.stringify(log.slice(-50)));
    } catch {}
  }

  /**
   * Get scam incident log
   */
  async getLog() {
    try {
      const raw = await AsyncStorage.getItem(SCAM_LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  /**
   * Get count of scam attempts blocked
   */
  async getBlockedCount() {
    const log = await this.getLog();
    return log.length;
  }

  setActive(active) { this.isActive = active; }
}

export default new ScamGuardService();
