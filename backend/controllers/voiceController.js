/**
 * VoiceController
 * Handles text and voice queries.
 * Uses Bedrock RAG when AWS is configured, falls back to local knowledge JSON.
 */
const path = require('path');
const fs   = require('fs');

// Load local knowledge base as offline fallback
let localKnowledge = {};
try {
  const kbPath = path.join(__dirname, '../../src/data/offlineKnowledge.json');
  localKnowledge = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
} catch (e) {
  console.warn('[VoiceController] Could not load local knowledge base:', e.message);
}

// Lazy-load AWS services — they throw at require-time if SDK is missing
let bedrockService   = null;
let knowledgeService = null;

function getBedrockService() {
  if (!bedrockService) {
    try { bedrockService = require('../services/bedrockService'); } catch {}
  }
  return bedrockService;
}

function getKnowledgeService() {
  if (!knowledgeService) {
    try { knowledgeService = require('../services/knowledgeService'); } catch {}
  }
  return knowledgeService;
}

// ── Simple offline keyword search (same logic as EnhancedOfflineService) ──────
function offlineSearch(query) {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/).filter(w => w.length > 2);

  const candidates = [];

  function walk(obj, path) {
    if (typeof obj === 'string') {
      const score = words.filter(w => obj.toLowerCase().includes(w) || w.includes(path.split('.').pop())).length;
      if (score > 0) candidates.push({ path, content: obj, score });
    } else if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) walk(v, path ? `${path}.${k}` : k);
    }
  }

  walk(localKnowledge, '');
  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length > 0) return candidates[0].content;

  // Category fallback
  if (/farm|crop|rice|wheat|pest|soil|fertilizer/.test(lower))
    return 'I can help with farming. Ask about specific crops like rice, wheat, cassava, or sorghum — planting, pests, fertilizer, or harvest.';
  if (/fever|sick|pain|medicine|health|malaria|diarrhea/.test(lower))
    return 'I can help with health questions. Ask about fever, diarrhea, malaria, diabetes, blood pressure, or medicines like paracetamol and ORS.';
  if (/scam|otp|fraud|bank|emergency|police/.test(lower))
    return 'I can help with safety. Ask about OTP scams, mobile money fraud, or emergency numbers for your country.';

  return 'I can help with farming, health, safety, livelihoods, and climate topics. Please ask a specific question.';
}

// ── Controller ────────────────────────────────────────────────────────────────
class VoiceController {

  /**
   * POST /api/voice/v2/text
   * Body: { query: string, language?: string, category?: string }
   */
  async processTextQuery(req, res) {
    const { query, language = 'en', category } = req.body || {};

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, error: 'query is required' });
    }

    const trimmed = query.trim();
    console.log(`[Voice] text query: "${trimmed}" lang=${language}`);

    // 1. Try Bedrock RAG
    const ks = getKnowledgeService();
    const bs = getBedrockService();

    if (ks && bs && process.env.KNOWLEDGE_BASE_ID) {
      try {
        const ragResult = await ks.retrieveAndGenerate(trimmed, category || null);
        if (ragResult?.answer) {
          return res.json({
            success:  true,
            response: ragResult.answer,
            source:   'aws-bedrock-rag',
            query:    trimmed,
          });
        }
      } catch (err) {
        console.warn('[Voice] Bedrock RAG failed, falling back to offline:', err.message);
      }
    }

    // 2. Offline fallback
    const answer = offlineSearch(trimmed);
    return res.json({
      success:  true,
      response: answer,
      source:   'offline-knowledge-base',
      query:    trimmed,
    });
  }

  /**
   * POST /api/voice/v2/process
   * Multipart: audio file + optional transcribedText
   */
  async processVoiceAudio(req, res) {
    const { transcribedText, category } = req.body || {};

    if (!transcribedText) {
      return res.status(400).json({ success: false, error: 'transcribedText is required' });
    }

    // Delegate to text handler
    req.body.query = transcribedText;
    return this.processTextQuery(req, res);
  }

  /**
   * GET /api/voice/v2/status
   */
  async getStatus(req, res) {
    const awsConfigured = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.KNOWLEDGE_BASE_ID
    );

    res.json({
      success: true,
      status:  'operational',
      services: {
        bedrock:       awsConfigured ? 'configured' : 'not-configured',
        knowledgeBase: awsConfigured ? 'configured' : 'not-configured',
        offlineFallback: 'ready',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new VoiceController();
