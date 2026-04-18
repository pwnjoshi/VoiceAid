/**
 * API Configuration
 * EXPO_PUBLIC_API_URL is set in .env — defaults to localhost for dev
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000'; // 10.0.2.2 = Android emulator → host machine

export const ENDPOINTS = {
  HEALTH:            '/health',
  VOICE_V2_TEXT:     '/api/voice/v2/text',
  VOICE_V2_PROCESS:  '/api/voice/v2/process',
  VOICE_V2_STATUS:   '/api/voice/v2/status',
  KNOWLEDGE_QUERY:   '/api/knowledge/v2/query',
  KNOWLEDGE_UPLOAD:  '/api/knowledge/v2/upload',
  KNOWLEDGE_STATS:   '/api/knowledge/v2/stats',
};
