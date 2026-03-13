// Request Validation Middleware
// Validates incoming requests before processing

const validateVoiceRequest = (req, res, next) => {
  const { query, category } = req.body;
  const audioFile = req.file;

  // Either audio file or text query must be provided
  if (!audioFile && !query) {
    return res.status(400).json({
      success: false,
      error: 'Either audio file or text query is required'
    });
  }

  // Validate category if provided
  const validCategories = ['agriculture', 'health', 'safety'];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
    });
  }

  next();
};

const validateKnowledgeQuery = (req, res, next) => {
  const { query } = req.query || req.body;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Query parameter is required and cannot be empty'
    });
  }

  if (query.length > 500) {
    return res.status(400).json({
      success: false,
      error: 'Query is too long. Maximum 500 characters allowed'
    });
  }

  next();
};

const validateDocumentUpload = (req, res, next) => {
  const document = req.file;

  if (!document) {
    return res.status(400).json({
      success: false,
      error: 'Document file is required'
    });
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
  if (!allowedTypes.includes(document.mimetype)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type. Only PDF, TXT, and MD files are allowed'
    });
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (document.size > maxSize) {
    return res.status(400).json({
      success: false,
      error: 'File size exceeds 10MB limit'
    });
  }

  next();
};

module.exports = {
  validateVoiceRequest,
  validateKnowledgeQuery,
  validateDocumentUpload
};
