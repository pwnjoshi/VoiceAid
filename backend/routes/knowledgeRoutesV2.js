// Knowledge Routes V2 - Enhanced knowledge base endpoints
// Includes document management, search, and statistics

const express = require('express');
const multer = require('multer');
const knowledgeController = require('../controllers/knowledgeController');
const { validateKnowledgeQuery, validateDocumentUpload } = require('../middleware/validation');

const router = express.Router();

// Configure multer for document uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, TXT, MD, DOC, DOCX
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, MD, DOC, and DOCX files are allowed'));
    }
  }
});

/**
 * GET /api/knowledge/query
 * Query knowledge base
 * 
 * Query parameters:
 * - query: Search query (required)
 * - category: Optional filter (agriculture, health, safety)
 * - maxResults: Max results to return (default: 5)
 */
router.get('/query', validateKnowledgeQuery, async (req, res) => {
  await knowledgeController.queryKnowledge(req, res);
});

/**
 * POST /api/knowledge/upload
 * Upload document to knowledge base
 * 
 * Form data:
 * - document: File to upload (required)
 * - category: Document category (optional)
 * - title: Document title (optional)
 * - description: Document description (optional)
 */
router.post('/upload', upload.single('document'), validateDocumentUpload, async (req, res) => {
  await knowledgeController.uploadDocument(req, res);
});

/**
 * GET /api/knowledge/documents
 * List all documents in knowledge base
 * 
 * Query parameters:
 * - category: Optional filter (agriculture, health, safety)
 */
router.get('/documents', async (req, res) => {
  await knowledgeController.listDocuments(req, res);
});

/**
 * GET /api/knowledge/documents/:key
 * Get document details and presigned URL
 * 
 * URL parameters:
 * - key: Document S3 key
 */
router.get('/documents/:key', async (req, res) => {
  await knowledgeController.getDocumentDetails(req, res);
});

/**
 * GET /api/knowledge/stats
 * Get knowledge base statistics
 */
router.get('/stats', async (req, res) => {
  await knowledgeController.getStats(req, res);
});

module.exports = router;
