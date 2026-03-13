// API Tests
// Basic test suite for VoiceAid Backend APIs

const request = require('supertest');
const app = require('../server');

describe('VoiceAid Backend API Tests', () => {
  
  // Health Check Tests
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'VoiceAid Backend');
    });
  });

  // Root Endpoint Tests
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'VoiceAid Backend API');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  // Voice Routes Tests
  describe('POST /api/voice/text', () => {
    it('should return error without query', async () => {
      const response = await request(app)
        .post('/api/voice/text')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept valid query', async () => {
      const response = await request(app)
        .post('/api/voice/text')
        .send({
          query: 'How to treat fever?',
          category: 'health'
        });

      // Response may fail due to AWS credentials, but should be 500 not 400
      expect([200, 500]).toContain(response.status);
    });

    it('should reject invalid category', async () => {
      const response = await request(app)
        .post('/api/voice/text')
        .send({
          query: 'Test query',
          category: 'invalid'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  // Knowledge Routes Tests
  describe('GET /api/knowledge', () => {
    it('should return error without query', async () => {
      const response = await request(app)
        .get('/api/knowledge')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should accept valid query', async () => {
      const response = await request(app)
        .get('/api/knowledge')
        .query({ query: 'pest control' });

      // Response may fail due to AWS credentials, but should be 500 not 400
      expect([200, 500]).toContain(response.status);
    });
  });

  // 404 Tests
  describe('404 Handling', () => {
    it('should return 404 for unknown endpoint', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Endpoint not found');
    });
  });
});
