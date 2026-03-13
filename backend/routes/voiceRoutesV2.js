// Voice Routes V2 - Enhanced voice processing endpoints
// Integrates Bedrock, Knowledge Base, and S3

const express = require('express');
const multer = require('multer');
const voiceController = require('../controllers/voiceController');
const { validateVoiceRequest } = require('../middleware/validation');

const router = express.Router();

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit for audio
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
 * POST /api/voice/process
 * Process voice audio with knowledge retrieval
 * 
 * Request body:
 * - audioBuffer: Audio file (multipart)
 * - transcribedText: Text from voice transcription
 * - category: Optional (agriculture, health, safety)
 */
router.post('/process', upload.single('audio'), validateVoiceRequest, async (req, res) => {
  await voiceController.processVoiceAudio(req, res);
});

/**
 * POST /api/voice/text
 * Process text query (alternative to voice)
 * 
 * Request body:
 * - query: Text query
 * - category: Optional (agriculture, health, safety)
 */
router.post('/text', async (req, res) => {
  await voiceController.processTextQuery(req, res);
});

/**
 * GET /api/voice/status
 * Get voice processing service status
 */
router.get('/status', async (req, res) => {
  await voiceController.getStatus(req, res);
});

module.exports = router;
