// Voice Controller - Handles voice processing requests
// Orchestrates voice transcription, knowledge retrieval, and AI response

const bedrockService = require('../services/bedrockService');
const knowledgeService = require('../services/knowledgeService');
const s3Service = require('../services/s3Service');

class VoiceController {
  /**
   * Process voice audio and return AI response with knowledge
   * POST /api/voice
   */
  async processVoiceAudio(req, res) {
    try {
      const { audioBuffer, transcribedText, category } = req.body;

      // Validate input
      if (!transcribedText) {
        return res.status(400).json({
          success: false,
          error: 'Transcribed text is required'
        });
      }

      // Step 1: Retrieve relevant knowledge from knowledge base
      console.log(`[Voice] Retrieving knowledge for query: ${transcribedText}`);
      const knowledgeResult = await knowledgeService.retrieveKnowledge(
        transcribedText,
        category,
        5 // max results
      );

      // Step 2: Generate AI response with knowledge context
      console.log('[Voice] Generating AI response with knowledge context');
      const aiResponse = await bedrockService.processVoiceQuery(
        transcribedText,
        knowledgeResult.documents || []
      );

      // Step 3: Return combined response
      res.json({
        success: true,
        query: transcribedText,
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
      res.json({
        success: true,
        status: 'operational',
        services: {
          bedrock: 'connected',
          knowledge: 'ready',
          s3: 'ready'
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
