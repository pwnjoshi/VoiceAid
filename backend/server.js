// VoiceAid Backend Server
// Main Express server for handling API requests
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const voiceRoutes = require('./routes/voiceRoutes');
const voiceRoutesV2 = require('./routes/voiceRoutesV2');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const knowledgeRoutesV2 = require('./routes/knowledgeRoutesV2');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'VoiceAid Backend',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/voice', voiceRoutes);
app.use('/api/voice/v2', voiceRoutesV2);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/knowledge/v2', knowledgeRoutesV2);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'VoiceAid Backend API',
    version: '2.0.0',
    endpoints: {
      voice: {
        'POST /api/voice': 'Process voice audio (legacy)',
        'POST /api/voice/v2/process': 'Process voice audio with knowledge',
        'POST /api/voice/v2/text': 'Process text query',
        'GET /api/voice/v2/status': 'Get voice service status'
      },
      knowledge: {
        'GET /api/knowledge': 'Query knowledge base (legacy)',
        'GET /api/knowledge/v2/query': 'Query knowledge base',
        'POST /api/knowledge/v2/upload': 'Upload documents',
        'GET /api/knowledge/v2/documents': 'List documents',
        'GET /api/knowledge/v2/stats': 'Get statistics'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VoiceAid Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/`);
});

module.exports = app;
