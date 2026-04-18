/**
 * ApiService — communicates with the VoiceAid backend
 * Falls back gracefully to offline mode when backend is unreachable
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

const REQUEST_TIMEOUT_MS = 8000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    ),
  ]);
}

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.isAvailable = null; // null = unknown, true/false = checked
  }

  // ── Health check ──────────────────────────────────────────────────────────
  async checkHealth() {
    try {
      const res = await withTimeout(
        fetch(`${this.baseUrl}${ENDPOINTS.HEALTH}`),
        3000
      );
      this.isAvailable = res.ok;
      return res.ok;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }

  // ── Text query → backend AI (Bedrock RAG) ─────────────────────────────────
  async queryText(text, language = 'en') {
    try {
      const res = await withTimeout(
        fetch(`${this.baseUrl}${ENDPOINTS.VOICE_V2_TEXT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text, language }),
        }),
        REQUEST_TIMEOUT_MS
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      return {
        success: true,
        response: data.response || data.aiResponse || data.answer,
        source: 'aws-bedrock',
        confidence: 1.0,
      };
    } catch (err) {
      console.warn('ApiService.queryText failed:', err.message);
      return null; // caller falls back to offline
    }
  }

  // ── Knowledge base query ──────────────────────────────────────────────────
  async queryKnowledge(text, category = null) {
    try {
      const params = new URLSearchParams({ query: text });
      if (category) params.append('category', category);

      const res = await withTimeout(
        fetch(`${this.baseUrl}${ENDPOINTS.KNOWLEDGE_QUERY}?${params}`),
        REQUEST_TIMEOUT_MS
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      return {
        success: true,
        response: data.answer || data.response,
        citations: data.citations || [],
        source: 'aws-knowledge-base',
        confidence: 1.0,
      };
    } catch (err) {
      console.warn('ApiService.queryKnowledge failed:', err.message);
      return null;
    }
  }

  // ── Save query history for analytics ─────────────────────────────────────
  async logQuery(query, response, source) {
    try {
      const key = '@voiceaid:query_log';
      const existing = await AsyncStorage.getItem(key);
      const log = existing ? JSON.parse(existing) : [];
      log.push({
        query,
        response: response?.substring(0, 100),
        source,
        ts: Date.now(),
      });
      // Keep last 200 entries
      await AsyncStorage.setItem(key, JSON.stringify(log.slice(-200)));
    } catch {
      // non-critical
    }
  }
}

export default new ApiService();
