# VoiceAid Backend API Documentation

Complete API reference for VoiceAid backend services.

## Base URL

Development: `http://localhost:3000`
Production: `https://your-amplify-url.amplifyapp.com`

## Authentication

Currently, the API is open. For production, implement authentication using:
- AWS Cognito
- API Keys
- JWT tokens

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Endpoints

### Health Check

**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "VoiceAid Backend",
  "timestamp": "2026-03-10T12:00:00.000Z"
}
```

---

## Voice Processing APIs

### Process Voice Audio

**POST** `/api/voice`

Receives voice audio from mobile app and returns AI-generated response with knowledge.

**Request:**
- Content-Type: `multipart/form-data`

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| audio | File | No* | Audio file (mp3, wav, m4a) |
| query | String | No* | Text query (if no audio) |
| category | String | No | Category: agriculture, health, safety |

*Either audio or query is required

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/voice \
  -F "audio=@voice.mp3" \
  -F "category=health"
```

**Response:**
```json
{
  "success": true,
  "query": "How to treat fever?",
  "answer": "For fever treatment, rest and stay hydrated. Take paracetamol as directed...",
  "citations": [
    {
      "content": "Fever treatment basics...",
      "location": "s3://voiceaid-knowledge-docs/knowledge/health/fever-treatment.pdf"
    }
  ],
  "category": "health",
  "timestamp": "2026-03-10T12:00:00.000Z"
}
```

### Process Text Query

**POST** `/api/voice/text`

Alternative endpoint for text-only queries (no audio file).

**Request:**
- Content-Type: `application/json`

**Body:**
```json
{
  "query": "How to prevent crop pests?",
  "category": "agriculture"
}
```

**Response:**
```json
{
  "success": true,
  "query": "How to prevent crop pests?",
  "answer": "To prevent crop pests, use integrated pest management...",
  "citations": [...],
  "category": "agriculture"
}
```

---

## Knowledge Base APIs

### Query Knowledge Base

**GET** `/api/knowledge`

Retrieve relevant documents from knowledge base without AI generation.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | String | Yes | Search query |
| category | String | No | Filter by category |
| maxResults | Number | No | Max results (default: 5) |

**Example Request:**
```bash
curl "http://localhost:3000/api/knowledge?query=OTP%20scam&category=safety&maxResults=3"
```

**Response:**
```json
{
  "success": true,
  "query": "OTP scam",
  "results": [
    {
      "content": "Never share your OTP with anyone...",
      "score": 0.95,
      "location": {
        "s3Location": {
          "uri": "s3://voiceaid-knowledge-docs/knowledge/safety/otp-scam-warnings.pdf"
        }
      },
      "metadata": {
        "category": "safety"
      }
    }
  ],
  "count": 3
}
```

### Generate AI Response (RAG)

**POST** `/api/knowledge/generate`

Retrieve knowledge and generate AI response using Retrieval-Augmented Generation.

**Request:**
- Content-Type: `application/json`

**Body:**
```json
{
  "query": "What are the symptoms of crop disease?",
  "category": "agriculture"
}
```

**Response:**
```json
{
  "success": true,
  "query": "What are the symptoms of crop disease?",
  "answer": "Common symptoms of crop disease include yellowing leaves...",
  "citations": [
    {
      "retrievedReferences": [
        {
          "content": {
            "text": "Crop disease symptoms..."
          },
          "location": {
            "s3Location": {
              "uri": "s3://..."
            }
          }
        }
      ]
    }
  ],
  "sessionId": "session-123"
}
```

### Upload Document

**POST** `/api/knowledge/upload`

Upload a new document to the knowledge base.

**Request:**
- Content-Type: `multipart/form-data`

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| document | File | Yes | PDF, TXT, or MD file |
| category | String | No | agriculture, health, or safety |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/knowledge/upload \
  -F "document=@new-guide.pdf" \
  -F "category=health"
```

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "key": "knowledge/health/new-guide.pdf",
  "category": "health",
  "note": "Document will be ingested into Knowledge Base automatically"
}
```

**Note:** After upload, sync the knowledge base in AWS Console to make the document searchable.

### List Documents

**GET** `/api/knowledge/documents`

List all documents in the knowledge base.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | String | No | Filter by category |

**Example Request:**
```bash
curl "http://localhost:3000/api/knowledge/documents?category=agriculture"
```

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "Key": "knowledge/agriculture/pest-control.pdf",
      "LastModified": "2026-03-10T12:00:00.000Z",
      "Size": 1024000
    }
  ],
  "count": 1
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Query parameter is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Endpoint not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to retrieve knowledge: Connection timeout"
}
```

---

## Rate Limiting

Currently no rate limiting. For production, implement:
- API Gateway throttling
- Redis-based rate limiting
- Per-user quotas

---

## Categories

The system supports three knowledge categories:

1. **agriculture**
   - Pest control
   - Crop care
   - Farming techniques

2. **health**
   - Medicine information
   - Treatment guidelines
   - Health tips

3. **safety**
   - Scam warnings
   - Fraud prevention
   - Safety guidelines

---

## Testing Examples

### Test Voice Processing
```bash
# With text query
curl -X POST http://localhost:3000/api/voice/text \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How to identify fake medicine?",
    "category": "health"
  }'
```

### Test Knowledge Retrieval
```bash
# Simple query
curl "http://localhost:3000/api/knowledge?query=crop%20disease"

# With category filter
curl "http://localhost:3000/api/knowledge?query=fever&category=health&maxResults=3"
```

### Test Document Upload
```bash
curl -X POST http://localhost:3000/api/knowledge/upload \
  -F "document=@sample.pdf" \
  -F "category=safety"
```

---

## Integration with Mobile App

### Example React Native Integration

```javascript
// Voice query example
const queryVoiceAid = async (audioUri, category) => {
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    type: 'audio/mp3',
    name: 'voice.mp3'
  });
  formData.append('category', category);

  const response = await fetch('https://your-api.com/api/voice', {
    method: 'POST',
    body: formData
  });

  return await response.json();
};

// Text query example
const queryText = async (text, category) => {
  const response = await fetch('https://your-api.com/api/voice/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: text, category })
  });

  return await response.json();
};
```

---

## Webhooks (Future)

Plan to implement webhooks for:
- Document ingestion completion
- Knowledge base sync status
- Error notifications

---

## Support

For API issues or questions:
- Check server logs
- Review AWS CloudWatch logs
- Contact backend team
