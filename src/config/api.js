/**
 * API Configuration
 * Update this file with your backend API URL
 */

// Use environment variable or fallback to localhost for development
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// API endpoints - aligned with backend routes
export const ENDPOINTS = {
  // Voice endpoints
  VOICE: '/api/voice',
  VOICE_V2_PROCESS: '/api/voice/v2/process',
  VOICE_V2_TEXT: '/api/voice/v2/text',
  VOICE_V2_STATUS: '/api/voice/v2/status',
  
  // Knowledge base endpoints
  KNOWLEDGE_QUERY: '/api/knowledge/v2/query',
  KNOWLEDGE_UPLOAD: '/api/knowledge/v2/upload',
  KNOWLEDGE_DOCUMENTS: '/api/knowledge/v2/documents',
  KNOWLEDGE_STATS: '/api/knowledge/v2/stats',
  
  // Health check
  HEALTH: '/health',
};

export default {
  API_BASE_URL,
  ENDPOINTS,
};
