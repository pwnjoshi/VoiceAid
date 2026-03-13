// Voice Controller - Handles voice processing requests
// Orchestrates voice transcription, knowledge retrieval, and AI response

const bedrockService = require('../services/bedrockService');
const knowledgeService = require('../services/knowledgeService');
const s3Service = require('../services/s3Service');
const voiceAiIntegration = require('../services/voiceAiIntegration');

class VoiceController {
  /**
   * Process voice audio and return AI response with knowledge
   * POST /api/voice
   */
  async processVoiceAudio(req, res) {
    try {
      const { audioBuffer, transcribedText, category } = req.body;

      let finalTranscribedText = transcribedText;

      // If audio file is provided but no transcription, use Voice AI service
      if (!transcribedText && req.file) {
        console.log('[Voice] Transcribing audio using Voice AI service');
        const voiceAiResult = await voiceAiIntegration.processAudio(req.file.path);
        finalTranscribedText = voiceAiResult.transcription;
      }

      // Validate input
      if (!finalTranscribedText) {
        return res.status(400).json({
          success: false,
          error: 'Transcribed text or audio file is required'
        });
      }

      // Step 1: Retrieve relevant knowledge from knowledge base
      console.log(`[Voice] Retrieving knowledge for query: ${finalTranscribedText}`);
      const knowledgeResult = await knowledgeService.retrieveKnowledge(
        finalTranscribedText,
        category,
        5 // max results
      );

      // Step 2: Generate AI response with knowledge context
      console.log('[Voice] Generating AI response with knowledge context');
      const aiResponse = await bedrockService.processVoiceQuery(
        finalTranscribedText,
        knowledgeResult.documents || []
      );

      // Step 3: Return combined response
      res.json({
        success: true,
        query: finalTranscribedText,
        aiResponse: aiResponse.aiResponse,
        knowledge: {
          hasContext: aiResponse.hasKnowledgeContext,
          sourceCount: aiResponse.sourceCount,
          documents: knowledgeResult.documents || []
        },
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
  }

  /**
   * Process text query (alternative to voice)
   * POST /api/voice/text
   */
  async processTextQuery(req, res) {
    try {
      const { query, category } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query is required'
        });
      }

      // Retrieve knowledge
      const knowledgeResult = await knowledgeService.retrieveKnowledge(
        query,
        category,
        5
      );

      // Generate response
      const aiResponse = await bedrockService.processVoiceQuery(
        query,
        knowledgeResult.documents || []
      );

      res.json({
        success: true,
        query: query,
        aiResponse: aiResponse.aiResponse,
        knowledge: {
          hasContext: aiResponse.hasKnowledgeContext,
          sourceCount: aiResponse.sourceCount,
          documents: knowledgeResult.documents || []
        },
        category: category || 'general'
      });

    } catch (error) {
      console.error('Text Query Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get voice processing status
   * GET /api/voice/status
   */
  async getStatus(req, res) {
    try {
      const voiceAiStatus = voiceAiIntegration.getStatus();
      
      res.json({
        success: true,
        status: 'operational',
        services: {
          bedrock: 'connected',
          knowledge: 'ready',
          s3: 'ready',
          voiceAi: voiceAiStatus.available ? 'available' : 'unavailable'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new VoiceController();
