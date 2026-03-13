// Error Messages Constants
// Centralized error messages for consistency

const ERRORS = {
  // Validation Errors
  MISSING_QUERY: 'Query parameter is required',
  MISSING_AUDIO_OR_QUERY: 'Either audio file or text query is required',
  INVALID_CATEGORY: 'Invalid category. Must be one of: agriculture, health, safety',
  QUERY_TOO_LONG: 'Query is too long. Maximum 500 characters allowed',
  MISSING_DOCUMENT: 'Document file is required',
  INVALID_FILE_TYPE: 'Invalid file type. Only PDF, TXT, and MD files are allowed',
  FILE_TOO_LARGE: 'File size exceeds 10MB limit',

  // AWS Errors
  S3_UPLOAD_FAILED: 'Failed to upload document to S3',
  S3_LIST_FAILED: 'Failed to list documents from S3',
  BEDROCK_QUERY_FAILED: 'Failed to query knowledge base',
  BEDROCK_GENERATE_FAILED: 'Failed to generate response',

  // Server Errors
  INTERNAL_ERROR: 'Internal server error',
  ENDPOINT_NOT_FOUND: 'Endpoint not found',
  INVALID_REQUEST: 'Invalid request'
};

const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AWS_ERROR: 'AWS_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND'
};

module.exports = {
  ERRORS,
  ERROR_CODES
};
