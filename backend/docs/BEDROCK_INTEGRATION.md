# Amazon Bedrock Integration Guide

Complete guide for integrating Amazon Bedrock with VoiceAid backend.

## Overview

VoiceAid uses Amazon Bedrock for:
1. **Amazon Nova Sonic** - Voice processing and AI response generation
2. **Bedrock Knowledge Base** - Document retrieval and RAG (Retrieval-Augmented Generation)

## Prerequisites

- AWS Account with Bedrock access
- AWS SDK for JavaScript installed
- Node.js 18+
- AWS credentials configured

## Step 1: Enable Bedrock Models

### Access Bedrock Console

1. Go to AWS Console → Amazon Bedrock
2. Click "Get started" if first time
3. Go to "Model access"

### Request Model Access

Request access to:
- **Amazon Nova Lite** (for text generation)
- **Amazon Titan Embeddings G1** (for vector search)

Approval is usually instant.

## Step 2: Create Knowledge Base

### Via AWS Console

1. Go to Amazon Bedrock → Knowledge bases
2. Click "Create knowledge base"

**Configuration:**
- Name: `VoiceAid-Knowledge-Base`
- Description: `Knowledge base for VoiceAid voice assistant`
- Create new IAM role (auto-generated)

### Data Source Setup

- Data source name: `VoiceAid-S3-Documents`
- S3 URI: `s3://voiceaid-knowledge-docs/knowledge/`
- Chunking strategy: Default (512 tokens)
- Metadata: Include file path

### Embeddings Model

- Select: `Amazon Titan Embeddings G1 - Text`

### Vector Database

- Quick create new vector store (OpenSearch Serverless)

### Create and Sync

1. Click "Create knowledge base"
2. Wait for creation (5-10 minutes)
3. Go to "Data sources"
4. Click "Sync" to ingest documents

## Step 3: Configure Backend

### Update .env File

```bash
# Bedrock Configuration
BEDROCK_KNOWLEDGE_BASE_ID=your_kb_id_here
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
BEDROCK_REGION=us-east-1

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Update awsConfig.js

```javascript
const bedrockConfig = {
  knowledgeBaseId: process.env.BEDROCK_KNOWLEDGE_BASE_ID,
  modelId: process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0',
  modelArn: 'arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-lite-v1:0'
};
```

## Step 4: Use Bedrock Services

### Invoke Nova Model

```javascript
const bedrockService = require('./services/bedrockService');

// Generate response
const result = await bedrockService.invokeNovaModel(
  'What is fever treatment?',
  {
    maxTokens: 512,
    temperature: 0.7
  }
);

console.log(result.response);
```

### Query Knowledge Base

```javascript
const knowledgeService = require('./services/knowledgeService');

// Retrieve documents
const result = await knowledgeService.retrieveKnowledge(
  'How to prevent crop pests?',
  'agriculture',
  5
);

console.log(result.documents);
```

### Generate with Context

```javascript
// Combine knowledge retrieval with AI generation
const response = await bedrockService.generateContextualResponse(
  'What is fever treatment?',
  knowledgeDocuments
);

console.log(response.response);
```

## API Endpoints

### Voice Processing

**POST /api/voice/v2/process**

Process voice audio with knowledge retrieval.

Request:
```json
{
  "audioBuffer": "<audio file>",
  "transcribedText": "How to treat fever?",
  "category": "health"
}
```

Response:
```json
{
  "success": true,
  "query": "How to treat fever?",
  "aiResponse": "For fever treatment, rest and stay hydrated...",
  "knowledge": {
    "hasContext": true,
    "sourceCount": 3,
    "documents": [...]
  },
  "category": "health"
}
```

### Knowledge Query

**GET /api/knowledge/v2/query**

Query knowledge base directly.

Parameters:
- `query`: Search query (required)
- `category`: Filter by category (optional)
- `maxResults`: Max results (default: 5)

Example:
```bash
curl "http://localhost:3000/api/knowledge/v2/query?query=pest%20control&category=agriculture"
```

Response:
```json
{
  "success": true,
  "query": "pest control",
  "category": "agriculture",
  "results": [
    {
      "content": "To prevent crop pests...",
      "score": 0.95,
      "category": "agriculture"
    }
  ],
  "count": 1
}
```

## Document Management

### Upload Documents

**POST /api/knowledge/v2/upload**

Upload documents to knowledge base.

```bash
curl -X POST http://localhost:3000/api/knowledge/v2/upload \
  -F "document=@pest-control.pdf" \
  -F "category=agriculture" \
  -F "title=Pest Control Guide" \
  -F "description=Guide for preventing crop pests"
```

### List Documents

**GET /api/knowledge/v2/documents**

List all documents.

```bash
curl "http://localhost:3000/api/knowledge/v2/documents?category=agriculture"
```

### Get Document URL

**GET /api/knowledge/v2/documents/:key**

Get presigned URL for document access.

```bash
curl "http://localhost:3000/api/knowledge/v2/documents/knowledge%2Fagriculture%2F1234567890-pest-control.pdf"
```

## Knowledge Categories

### Agriculture
- Pest control methods
- Crop care tips
- Farming techniques
- Soil management

### Health
- Medicine information
- Treatment guidelines
- Health tips
- Disease prevention

### Safety
- Scam warnings
- Fraud prevention
- Safety guidelines
- Emergency procedures

## Best Practices

### Document Organization

```
s3://voiceaid-knowledge-docs/
├── knowledge/
│   ├── agriculture/
│   │   ├── pest-control.pdf
│   │   └── crop-care.pdf
│   ├── health/
│   │   ├── fever-treatment.pdf
│   │   └── medicine-reminders.pdf
│   └── safety/
│       ├── otp-scams.pdf
│       └── fraud-awareness.pdf
```

### Document Format

- **PDF**: Best for formatted documents
- **TXT**: Plain text documents
- **MD**: Markdown documents
- **DOC/DOCX**: Microsoft Word documents

### Chunking Strategy

Default chunking (512 tokens) works well for:
- Medical documents
- Technical guides
- FAQ documents

For longer documents, consider:
- Increasing chunk size to 1024 tokens
- Using semantic chunking

### Query Optimization

1. **Be specific**: "How to treat fever?" vs "fever"
2. **Use categories**: Filter by category when possible
3. **Provide context**: Include relevant details in query

## Troubleshooting

### Issue: Knowledge Base not returning results

**Solution:**
1. Verify documents are uploaded to S3
2. Check data source sync status
3. Ensure documents are in correct format
4. Verify IAM permissions

### Issue: Bedrock model not responding

**Solution:**
1. Check model access in Bedrock console
2. Verify region is correct
3. Check AWS credentials
4. Review CloudWatch logs

### Issue: Slow response times

**Solution:**
1. Reduce maxResults parameter
2. Use category filtering
3. Optimize document chunking
4. Consider caching frequent queries

## Monitoring

### CloudWatch Metrics

Monitor:
- Bedrock API calls
- Knowledge base queries
- Response times
- Error rates

### Logs

Check logs in:
- CloudWatch Logs
- Application logs
- AWS SDK debug logs

## Cost Optimization

### Bedrock Pricing

- **On-demand**: Pay per API call
- **Provisioned throughput**: Fixed monthly cost

### Knowledge Base Pricing

- **Storage**: Per GB stored
- **Queries**: Per 1000 queries
- **Vector database**: OpenSearch Serverless pricing

### Cost Reduction Tips

1. Cache frequent queries
2. Use category filtering
3. Optimize document chunking
4. Batch API calls
5. Use provisioned throughput for high volume

## Advanced Features

### Custom Models

To use custom models:

```javascript
const customModelArn = 'arn:aws:bedrock:region:account:custom-model/model-id';

const result = await bedrockService.invokeNovaModel(prompt, {
  modelArn: customModelArn
});
```

### Fine-tuning

Fine-tune models for specific domains:

1. Prepare training data
2. Use Bedrock fine-tuning API
3. Deploy custom model
4. Update configuration

### Streaming Responses

For real-time responses:

```javascript
const stream = await bedrockService.invokeModelStream(prompt);

stream.on('data', (chunk) => {
  console.log(chunk.text);
});
```

## Security

### IAM Permissions

Required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:RetrieveAndGenerate",
        "bedrock:Retrieve"
      ],
      "Resource": "*"
    }
  ]
}
```

### Data Protection

- Enable encryption at rest
- Use VPC endpoints
- Enable CloudTrail logging
- Implement access controls

## Support

- AWS Bedrock Documentation: https://docs.aws.amazon.com/bedrock/
- AWS Support: https://console.aws.amazon.com/support/
- Community: AWS Forums

---

**Last Updated**: March 2026
**Version**: 2.0.0
