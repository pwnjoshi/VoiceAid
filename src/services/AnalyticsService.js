/**
 * AnalyticsService — local-only analytics
 *
 * Tracks: task completion rate, offline success %, average latency.
 * ALL data stays on device. Never sent anywhere.
 * Used to improve the app and show impact metrics.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@voiceaid:analytics';

const DEFAULT_STATS = {
  totalQueries:      0,
  offlineQueries:    0,   // answered by local KB or TinyLlama
  cloudQueries:      0,   // needed Bedrock
  llmQueries:        0,   // answered by TinyLlama
  scamBlocked:       0,
  totalLatencyMs:    0,
  sessionCount:      0,
  firstUsed:         null,
  lastUsed:          null,
  languageUsage:     {},  // { en: 5, hi: 3, ... }
  domainUsage:       {},  // { agriculture: 4, health: 2, ... }
};

class AnalyticsService {
  constructor() {
    this.stats = { ...DEFAULT_STATS };
    this._loaded = false;
    this._sessionStart = Date.now();
  }

  async load() {
    if (this._loaded) return;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) this.stats = { ...DEFAULT_STATS, ...JSON.parse(raw) };
    } catch {}
    this._loaded = true;
  }

  async save() {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(this.stats));
    } catch {}
  }

  async recordQuery({ source, latencyMs, language, domain }) {
    await this.load();
    this.stats.totalQueries++;
    this.stats.totalLatencyMs += latencyMs || 0;
    this.stats.lastUsed = new Date().toISOString();
    if (!this.stats.firstUsed) this.stats.firstUsed = this.stats.lastUsed;

    if (source === 'offline' || source === 'tinyllama-local') this.stats.offlineQueries++;
    if (source === 'aws') this.stats.cloudQueries++;
    if (source === 'tinyllama-local') this.stats.llmQueries++;

    if (language) {
      this.stats.languageUsage[language] = (this.stats.languageUsage[language] || 0) + 1;
    }
    if (domain) {
      this.stats.domainUsage[domain] = (this.stats.domainUsage[domain] || 0) + 1;
    }

    await this.save();
  }

  async recordScamBlocked() {
    await this.load();
    this.stats.scamBlocked++;
    await this.save();
  }

  async recordSession() {
    await this.load();
    this.stats.sessionCount++;
    await this.save();
  }

  async getStats() {
    await this.load();
    const total = this.stats.totalQueries || 1;
    return {
      ...this.stats,
      offlineRate:    Math.round((this.stats.offlineQueries / total) * 100),
      cloudRate:      Math.round((this.stats.cloudQueries / total) * 100),
      llmRate:        Math.round((this.stats.llmQueries / total) * 100),
      avgLatencyMs:   Math.round(this.stats.totalLatencyMs / total),
      sessionDuration: Math.round((Date.now() - this._sessionStart) / 1000),
    };
  }

  async reset() {
    this.stats = { ...DEFAULT_STATS };
    await AsyncStorage.removeItem(KEY);
  }
}

export default new AnalyticsService();
