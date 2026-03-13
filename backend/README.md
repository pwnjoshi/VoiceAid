# VoiceAid Backend - Knowledge Retrieval System

Backend infrastructure for VoiceAid voice assistant with AWS Bedrock Knowledge Base integration.

## Architecture

```
Mobile App
    ↓
Backend API (Node.js + Express)
    ↓
Knowledge Retrieval (Amazon Bedrock Knowledge Base)
    ↓
Documents (AWS S3)
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Cloud**: AWS Amplify
- **Storage**: AWS S3
- **AI/ML**: Amazon Bedrock Knowledge Bases
- **RAG**: Retrieval-Augmented Generation

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your AWS credentials:

```bash
cp .env.example .env
```

Required variables:
- `AWS_REGION`: Your AWS region (e.g., us-east-1)
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `S3_BUCKET_NAME`: Name of your S3 bucket
- `KNOWLEDGE_BASE_ID`: Your Bedrock Knowledge Base ID

### 3. Create S3 Bucket

```bash
aws s3 mb s3://voiceaid-knowledge-docs --region us-east-1
```

Create folder structure:
- `knowledge/agriculture/` - Pest control, crop care tips
- `knowledge/health/` - Medicine reminders, fever treatment
- `knowledge/safety/` - OTP scam warnings, fraud awareness

### 4. Setup Bedrock Knowledge Base

1. Go to AWS Console → Amazon Bedrock → Knowledge Bases
2. Create new Knowledge Base
3. Connect to your S3 bucket (`voiceaid-knowledge-docs`)
4. Configure data source and sync
5. Copy the Knowledge Base ID to `.env`

### 5. Run the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Voice Processing

**POST /api/voice**
- Receives voice audio from mobile app
- Routes to AI processing
- Retrieves knowledge and returns response

Request:
```json
{
  "audio": "<audio file>",
  "query": "How do I treat fever?",
  "category": "health"
}
```

**POST /api/voice/text**
- Text-only queries (no audio)

### Knowledge Retrieval

**GET /api/knowledge**
- Query knowledge base directly
- Parameters: `query`, `category`, `maxResults`

**POST /api/knowledge/generate**
- Retrieve knowledge and generate AI response (RAG)

**POST /api/knowledge/upload**
- Upload documents to S3 for knowledge base

**GET /api/knowledge/documents**
- List all documents in knowledge base

## Knowledge Categories

1. **Agriculture**
   - Pest control methods
   - Crop care tips
   - Farming best practices

2. **Health**
   - Medicine reminders
   - Fever treatment basics
   - Health tips

3. **Safety**
   - OTP scam warnings
   - Fraud awareness
   - Safety guidelines

## AWS Amplify Deployment

1. Push code to Git repository
2. Connect repository to AWS Amplify
3. Configure build settings (use `amplify.yml`)
4. Set environment variables in Amplify Console
5. Deploy

## Project Structure

```
backend/
├── config/
│   └── awsConfig.js          # AWS SDK configuration
├── routes/
│   ├── voiceRoutes.js        # Voice processing endpoints
│   └── knowledgeRoutes.js    # Knowledge retrieval endpoints
├── services/
│   ├── knowledgeService.js   # Bedrock Knowledge Base integration
│   └── s3Service.js          # S3 document management
├── server.js                 # Express server
├── package.json
└── .env.example
```

## Testing

Test the API:

```bash
# Health check
curl http://localhost:3000/health

# Text query
curl -X POST http://localhost:3000/api/voice/text \
  -H "Content-Type: application/json" \
  -d '{"query": "How to prevent crop pests?", "category": "agriculture"}'

# Knowledge query
curl "http://localhost:3000/api/knowledge?query=fever treatment&category=health"
```

## Notes

- The voice AI transcription system is handled by other teammates
- This backend focuses on knowledge retrieval and API routing
- Documents uploaded to S3 are automatically ingested by Bedrock Knowledge Base
- RAG (Retrieval-Augmented Generation) provides grounded, accurate responses

## Support

For issues or questions, contact the backend team.
