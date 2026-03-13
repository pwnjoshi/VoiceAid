// Knowledge Routes - Direct knowledge base queries
const express = require('express');
const knowledgeService = require('../services/knowledgeService');
const s3Service = require('../services/s3Service');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/knowledge
 * Query knowledge base and retrieve relevant documents
 */
router.get('/', async (req, res) => {
  try {
    const { query, category, maxResults } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    let response;
    if (category) {
      response = await knowledgeService.queryByCategory(query, category);
    } else {
      response = await knowledgeService.retrieveKnowledge(query, parseInt(maxResults) || 5);
    }

    res.json(response);

  } catch (error) {
    console.error('Knowledge Query Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/knowledge/generate
 * Retrieve knowledge and generate AI response (RAG)
 */
router.post('/generate', async (req, res) => {
  try {
    const { query, category } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    let response;
    if (category) {
      response = await knowledgeService.queryByCategory(query, category);
    } else {
      response = await knowledgeService.retrieveAndGenerate(query);
    }

    res.json(response);

  } catch (error) {
    console.error('Generate Response Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/knowledge/upload
 * Upload documents to S3 for knowledge base ingestion
 */
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    const document = req.file;
    const { category } = req.body;

    if (!document) {
      return res.status(400).json({
        success: false,
        error: 'Document file is required'
      });
    }

    const result = await s3Service.uploadDocument(
      document.buffer,
      document.originalname,
      category || 'general'
    );

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      key: result.key,
      category: category || 'general',
      note: 'Document will be ingested into Knowledge Base automatically'
    });

  } catch (error) {
    console.error('Document Upload Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/knowledge/documents
 * List all documents in the knowledge base
 */
router.get('/documents', async (req, res) => {
  try {
    const { category } = req.query;
    
    const result = await s3Service.listDocuments(category);

    res.json(result);

  } catch (error) {
    console.error('List Documents Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
