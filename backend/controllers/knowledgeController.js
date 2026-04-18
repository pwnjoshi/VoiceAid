/**
 * KnowledgeController
 * Handles knowledge base queries and document management.
 * Uses Bedrock RAG when configured, falls back to local JSON.
 */
const path = require('path');
const fs   = require('fs');

let localKnowledge = {};
try {
  const kbPath = path.join(__dirname, '../../src/data/offlineKnowledge.json');
  localKnowledge = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
} catch (e) {
  console.warn('[KnowledgeController] Could not load local knowledge base:', e.message);
}

let knowledgeService = null;
let s3Service        = null;

function getKnowledgeService() {
  if (!knowledgeService) {
    try { knowledgeService = require('../services/knowledgeService'); } catch {}
  }
  return knowledgeService;
}

function getS3Service() {
  if (!s3Service) {
    try { s3Service = require('../services/s3Service'); } catch {}
  }
  return s3Service;
}

// Simple offline search
function offlineSearch(query) {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/).filter(w => w.length > 2);
  const candidates = [];

  function walk(obj, pathStr) {
    if (typeof obj === 'string') {
      const score = words.filter(w => obj.toLowerCase().includes(w)).length;
      if (score > 0) candidates.push({ content: obj, score });
    } else if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) walk(v, pathStr ? `${pathStr}.${k}` : k);
    }
  }

  walk(localKnowledge, '');
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.content || null;
}

class KnowledgeController {

  /**
   * GET /api/knowledge/v2/query?query=...&category=...
   */
  async queryKnowledge(req, res) {
    const { query, category } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, error: 'query is required' });
    }

    console.log(`[Knowledge] query: "${query}" category=${category || 'any'}`);

    // 1. Try Bedrock RAG
    const ks = getKnowledgeService();
    if (ks && process.env.KNOWLEDGE_BASE_ID) {
      try {
        const result = await ks.retrieveAndGenerate(query, category || null);
        if (result?.answer) {
          return res.json({
            success:  true,
            answer:   result.answer,
            citations: result.citations || [],
            source:   'aws-bedrock-rag',
            query,
          });
        }
      } catch (err) {
        console.warn('[Knowledge] Bedrock failed, using offline:', err.message);
      }
    }

    // 2. Offline fallback
    const answer = offlineSearch(query);
    return res.json({
      success: true,
      answer:  answer || 'No information found for that query.',
      source:  'offline-knowledge-base',
      query,
    });
  }

  /**
   * POST /api/knowledge/v2/upload
   */
  async uploadDocument(req, res) {
    const file = req.file;
    const { category = 'general', title } = req.body || {};

    if (!file) {
      return res.status(400).json({ success: false, error: 'Document file is required' });
    }

    const s3 = getS3Service();
    if (!s3) {
      return res.status(503).json({ success: false, error: 'S3 service not configured' });
    }

    try {
      const s3Result = await s3.uploadDocument(file.buffer, file.originalname, category);
      return res.json({
        success: true,
        message: 'Document uploaded. It will be indexed in the knowledge base automatically.',
        document: {
          key:      s3Result.key,
          filename: file.originalname,
          size:     file.size,
          category,
          title:    title || file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error('[Knowledge] Upload error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/knowledge/v2/stats
   */
  async getStats(req, res) {
    const awsConfigured = !!(process.env.KNOWLEDGE_BASE_ID && process.env.AWS_ACCESS_KEY_ID);

    // Count local knowledge entries
    let localCount = 0;
    function countEntries(obj) {
      if (typeof obj === 'string') { localCount++; return; }
      if (obj && typeof obj === 'object') Object.values(obj).forEach(countEntries);
    }
    countEntries(localKnowledge);

    return res.json({
      success: true,
      stats: {
        awsConfigured,
        localKnowledgeEntries: localCount,
        crops:    Object.keys(localKnowledge.agriculture?.crops || {}).length,
        ailments: Object.keys(localKnowledge.health?.common_ailments || {}).length,
        languages: 11,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new KnowledgeController();
