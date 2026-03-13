# VoiceAid Backend Architecture

Complete system architecture documentation for VoiceAid backend.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App                             │
│              (Voice Input / Text Query)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js API Server                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes: /api/voice, /api/knowledge                 │   │
│  │  Middleware: Validation, Logging, Error Handling    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ S3 Service   │  │ Knowledge    │  │ CloudWatch   │
│              │  │ Service      │  │ Monitoring   │
│ - Upload     │  │              │  │              │
│ - List       │  │ - Retrieve   │  │ - Metrics    │
│ - Delete     │  │ - Generate   │  │ - Logs       │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                 │
       ▼                 ▼
┌──────────────────────────────────────────────────────────────┐
│                    AWS Services                              │
│  ┌──────────────┐  ┌──────────────────────────────────────┐ │
│  │ S3 Bucket    │  │ Bedrock Knowledge Base               │ │
│  │              │  │ - Vector Search                      │ │
│  │ Documents:   │  │ - RAG (Retrieval-Augmented Gen)      │ │
│  │ - Agriculture│  │ - Claude Model                       │ │
│  │ - Health     │  │ - Embeddings                         │ │
│  │ - Safety     │  │                                      │ │
│  └──────────────┘  └──────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. API Layer (Express.js)

**File:** `server.js`

Responsibilities:
- HTTP request handling
- Route management
- Middleware orchestration
- Error handling

**Routes:**
- `/api/voice` - Voice processing
- `/api/knowledge` - Knowledge retrieval
- `/health` - Health check

### 2. Service Layer

**Knowledge Service** (`services/knowledgeService.js`)
- Queries Bedrock Knowledge Base
- Implements RAG (Retrieval-Augmented Generation)
- Handles category-based queries
- Returns structured responses

**S3 Service** (`services/s3Service.js`)
- Uploads documents to S3
- Lists documents by category
- Generates presigned URLs
- Manages document lifecycle

### 3. Middleware Layer

**Validation** (`middleware/validation.js`)
- Request parameter validation
- File type checking
- Size limits
- Category validation

**Logging** (`middleware/logger.js`)
- Request/response logging
- Performance tracking
- Error logging

**Error Handler** (`middleware/errorHandler.js`)
- Centralized error handling
- Error formatting
- Status code mapping

### 4. Configuration Layer

**AWS Config** (`config/awsConfig.js`)
- AWS SDK initialization
- Credentials management
- Service configuration

**Constants** (`constants/`)
- Error messages
- Category definitions
- Configuration values

### 5. Monitoring Layer

**CloudWatch** (`monitoring/cloudwatch.js`)
- Custom metrics
- Performance tracking
- Error monitoring

**Metrics** (`monitoring/metrics.js`)
- Application metrics
- Request statistics
- Query tracking

## Data Flow

### Voice Query Flow

```
1. Mobile App sends voice audio
   ↓
2. Backend receives audio file
   ↓
3. Validation middleware checks file
   ↓
4. Voice route handler processes request
   ↓
5. Knowledge Service queries Bedrock
   ↓
6. Bedrock retrieves relevant documents from S3
   ↓
7. Claude model generates response with citations
   ↓
8. Response formatted and returned to mobile app
```

### Knowledge Retrieval Flow

```
1. Mobile App sends text query
   ↓
2. Backend receives query
   ↓
3. Validation middleware checks query
   ↓
4. Knowledge route handler processes request
   ↓
5. Knowledge Service queries Bedrock Knowledge Base
   ↓
6. Vector search finds relevant documents
   ↓
7. Documents returned with relevance scores
   ↓
8. Response formatted and returned to mobile app
```

### Document Upload Flow

```
1. Admin uploads document
   ↓
2. Validation checks file type and size
   ↓
3. S3 Service uploads to S3 bucket
   ↓
4. Document stored in category folder
   ↓
5. Admin syncs Knowledge Base in AWS Console
   ↓
6. Bedrock ingests and indexes document
   ↓
7. Document available for queries
```

## Technology Stack

### Backend Framework
- **Express.js** - Web framework
- **Node.js** - Runtime

### AWS Services
- **S3** - Document storage
- **Bedrock** - AI/ML service
- **Amplify** - Deployment & hosting
- **CloudWatch** - Monitoring & logging
- **IAM** - Access control

### Libraries
- **@aws-sdk/client-s3** - S3 operations
- **@aws-sdk/client-bedrock-agent-runtime** - Bedrock queries
- **multer** - File uploads
- **cors** - Cross-origin requests
- **dotenv** - Environment variables

## Deployment Architecture

### Development
```
Local Machine
    ↓
npm run dev
    ↓
Express Server (localhost:3000)
    ↓
AWS Services (S3, Bedrock)
```

### Production (Amplify)
```
Git Repository
    ↓
AWS Amplify Console
    ↓
Build & Deploy
    ↓
CloudFront CDN
    ↓
Express Server (Amplify Hosting)
    ↓
AWS Services (S3, Bedrock)
```

### Production (Docker)
```
Docker Image
    ↓
ECR Registry
    ↓
ECS Cluster
    ↓
Load Balancer
    ↓
Express Server (Container)
    ↓
AWS Services (S3, Bedrock)
```

## Security Architecture

### Authentication & Authorization
- API Keys (future)
- AWS IAM roles
- Cognito integration (future)

### Data Protection
- S3 encryption
- HTTPS/TLS
- Input validation
- Rate limiting (future)

### Access Control
- IAM policies
- S3 bucket policies
- VPC security groups

## Scalability Considerations

### Horizontal Scaling
- Amplify auto-scales
- ECS task replication
- Load balancing

### Vertical Scaling
- Increase instance size
- Increase memory
- Increase CPU

### Caching Strategy
- CloudFront for static content
- ElastiCache for frequent queries (future)
- Response caching headers

## Performance Optimization

### API Response Time
- Parallel requests to AWS services
- Response compression
- Connection pooling

### Knowledge Base Queries
- Vector search optimization
- Document chunking
- Caching frequent queries

### S3 Operations
- Multipart uploads
- Batch operations
- Lifecycle policies

## Error Handling Strategy

### Error Types
1. **Validation Errors** (400)
   - Missing parameters
   - Invalid file types
   - Query too long

2. **AWS Errors** (500)
   - S3 access denied
   - Bedrock timeout
   - Service unavailable

3. **Server Errors** (500)
   - Unhandled exceptions
   - Database errors
   - Configuration issues

### Error Recovery
- Retry logic for transient failures
- Fallback responses
- Error logging and alerting

## Monitoring & Observability

### Metrics
- Request count
- Error rate
- Response time
- Knowledge base queries

### Logs
- Request/response logs
- Error logs
- AWS service logs

### Alerts
- High error rate
- High response time
- Service unavailability

## Future Enhancements

1. **Authentication**
   - AWS Cognito integration
   - API key management
   - OAuth 2.0

2. **Caching**
   - Redis for query caching
   - CloudFront distribution
   - Response caching

3. **Database**
   - PostgreSQL for metadata
   - DynamoDB for sessions
   - Query history

4. **Advanced Features**
   - Multi-language support
   - Custom models
   - Analytics dashboard
   - Admin panel

5. **Performance**
   - GraphQL API
   - WebSocket support
   - Real-time updates

## Maintenance & Operations

### Regular Tasks
- Monitor CloudWatch metrics
- Review error logs
- Update dependencies
- Security patches

### Backup & Recovery
- S3 versioning
- Automated backups
- Disaster recovery plan

### Documentation
- API documentation
- Architecture diagrams
- Deployment guides
- Troubleshooting guides
