// Knowledge Controller - Handles knowledge base operations
// Manages document retrieval, upload, and knowledge queries

const knowledgeService = require('../services/knowledgeService');
const s3Service = require('../services/s3Service');

class KnowledgeController {
  /**
   * Query knowledge base
   * GET /api/knowledge/query
   */
  async queryKnowledge(req, res) {
    try {
      const { query, category, maxResults = 5 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required'
        });
      }

      const result = await knowledgeService.retrieveKnowledge(
        query,
        category,
        parseInt(maxResults)
      );

      res.json({
        success: true,
        query: query,
        category: category || 'all',
        results: result.documents || [],
        count: result.count || 0,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Knowledge Query Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Upload document to knowledge base
   * POST /api/knowledge/upload
   */
  async uploadDocument(req, res) {
    try {
      const file = req.file;
      const { category = 'general', title, description } = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Document file is required'
        });
      }

      // Upload to S3
      const s3Result = await s3Service.uploadDocument(
        file.buffer,
        file.originalname,
        category
      );

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        document: {
          key: s3Result.key,
          filename: file.originalname,
          size: file.size,
          category: category,
          title: title || file.originalname,
          description: description || '',
          uploadedAt: new Date().toISOString()
        },
        note: 'Document will be indexed in knowledge base automatically'
      });

    } catch (error) {
      console.error('Document Upload Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * List documents in knowledge base
   * GET /api/knowledge/documents
   */
  async listDocuments(req, res) {
    try {
      const { category } = req.query;

      const result = await s3Service.listDocuments(category);

      res.json({
        success: true,
        category: category || 'all',
        documents: result.documents || [],
        count: result.count || 0,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('List Documents Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get document details
   * GET /api/knowledge/documents/:key
   */
  async getDocumentDetails(req, res) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({
          success: false,
          error: 'Document key is required'
        });
      }

      // Get presigned URL for document access
      const urlResult = await s3Service.getDocumentUrl(key);

      res.json({
        success: true,
        document: {
          key: key,
          url: urlResult.url,
          expiresIn: 3600,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Get Document Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get knowledge base statistics
   * GET /api/knowledge/stats
   */
  async getStats(req, res) {
    try {
      const result = await s3Service.listDocuments();

      // Count documents by category
      const stats = {
        totalDocuments: result.count || 0,
        byCategory: {
          agriculture: 0,
          health: 0,
          safety: 0,
          other: 0
        }
      };

      if (result.documents) {
        result.documents.forEach(doc => {
          if (doc.Key.includes('agriculture')) stats.byCategory.agriculture++;
          else if (doc.Key.includes('health')) stats.byCategory.health++;
          else if (doc.Key.includes('safety')) stats.byCategory.safety++;
          else stats.byCategory.other++;
        });
      }

      res.json({
        success: true,
        stats: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Stats Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new KnowledgeController();
