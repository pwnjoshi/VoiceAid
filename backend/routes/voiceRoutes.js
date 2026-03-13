// Voice Routes - Handle voice audio processing
const express = require('express');
const multer = require('multer');
const knowledgeService = require('../services/knowledgeService');

const router = express.Router();

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

/**
 * POST /api/voice
 * Receives voice audio from mobile app
 * Routes to AI processing and retrieves knowledge
 */
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;
    const { query, category } = req.body;

    if (!audioFile && !query) {
      return res.status(400).json({
        success: false,
        error: 'Either audio file or text query is required'
      });
    }

    // TODO: In production, send audioFile to voice AI system for transcription
    // For now, we'll use the text query directly
    const userQuery = query || 'Default query from audio transcription';

    // Retrieve knowledge based on query
    let knowledgeResponse;
    if (category) {
      knowledgeResponse = await knowledgeService.queryByCategory(userQuery, category);
    } else {
      knowledgeResponse = await knowledgeService.retrieveAndGenerate(userQuery);
    }

    // Return response to mobile app
    res.json({
      success: true,
      query: userQuery,
      answer: knowledgeResponse.answer,
      citations: knowledgeResponse.citations,
      category: category || 'general',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Voice Processing Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/voice/text
 * Alternative endpoint for text-only queries (no audio)
 */
router.post('/text', async (req, res) => {
  try {
    const { query, category } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query text is required'
      });
    }

    let knowledgeResponse;
    if (category) {
      knowledgeResponse = await knowledgeService.queryByCategory(query, category);
    } else {
      knowledgeResponse = await knowledgeService.retrieveAndGenerate(query);
    }

    res.json({
      success: true,
      query: query,
      answer: knowledgeResponse.answer,
      citations: knowledgeResponse.citations,
      category: category || 'general'
    });

  } catch (error) {
    console.error('Text Query Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
