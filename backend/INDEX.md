# VoiceAid Backend - Complete Index

Master index and navigation guide for all backend documentation and code.

## 📚 Documentation

### Getting Started
- **[README.md](README.md)** - Quick start guide and overview
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Fast lookup guide

### Architecture & Design
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[docs/AWS_SETUP.md](docs/AWS_SETUP.md)** - AWS infrastructure setup
- **[docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide and options

### Knowledge Base
- **[docs/SAMPLE_DOCUMENTS.md](docs/SAMPLE_DOCUMENTS.md)** - Sample knowledge documents

## 🗂️ Project Structure

### Core Application
```
backend/
├── server.js                    # Main Express server
├── package.json                 # Dependencies and scripts
├── .env.example                 # Environment template
├── .env.production              # Production config
└── amplify.yml                  # AWS Amplify config
```

### Routes (API Endpoints)
```
routes/
├── voiceRoutes.js              # Voice processing endpoints
│   ├── POST /api/voice         # Process voice audio
│   └── POST /api/voice/text    # Process text query
└── knowledgeRoutes.js          # Knowledge retrieval endpoints
    ├── GET /api/knowledge      # Query knowledge base
    ├── POST /api/knowledge/generate  # Generate AI response
    ├── POST /api/knowledge/upload    # Upload documents
    └── GET /api/knowledge/documents  # List documents
```

### Services (Business Logic)
```
services/
├── knowledgeService.js         # Bedrock Knowledge Base integration
│   ├── retrieveKnowledge()     # Retrieve documents
│   ├── retrieveAndGenerate()   # RAG implementation
│   └── queryByCategory()       # Category-based queries
└── s3Service.js                # S3 document management
    ├── uploadDocument()        # Upload to S3
    ├── listDocuments()         # List documents
    └── getDocumentUrl()        # Generate presigned URLs
```

### Configuration
```
config/
├── awsConfig.js                # AWS SDK configuration
└── database.js                 # Database config (future)

constants/
├── categories.js               # Knowledge categories
└── errors.js                   # Error messages
```

### Middleware
```
middleware/
├── validation.js               # Request validation
├── logger.js                   # Request logging
└── errorHandler.js             # Error handling
```

### Monitoring
```
monitoring/
├── cloudwatch.js               # CloudWatch integration
└── metrics.js                  # Application metrics
```

### Utilities
```
utils/
└── responseFormatter.js        # Response formatting
```

### Testing
```
tests/
├── api.test.js                 # API endpoint tests
└── services.test.js            # Service unit tests
```

### Deployment
```
docker/
├── Dockerfile                  # Docker image
└── docker-compose.yml          # Docker compose config

scripts/
├── setup.sh                    # Setup script
└── deploy.sh                   # Deployment script
```

## 🚀 Quick Start

### 1. Installation
```bash
cd backend
npm install
cp .env.example .env
```

### 2. Configuration
Edit `.env` with your AWS credentials:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=voiceaid-knowledge-docs
KNOWLEDGE_BASE_ID=your_kb_id
```

### 3. Run Server
```bash
npm run dev
```

### 4. Test API
```bash
curl http://localhost:3000/health
```

## 📖 API Reference

### Voice Processing
- **POST /api/voice** - Process voice audio with knowledge retrieval
- **POST /api/voice/text** - Process text query

### Knowledge Retrieval
- **GET /api/knowledge** - Query knowledge base
- **POST /api/knowledge/generate** - Generate AI response (RAG)
- **POST /api/knowledge/upload** - Upload documents
- **GET /api/knowledge/documents** - List documents

### System
- **GET /health** - Health check
- **GET /** - API information

See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for detailed reference.

## 🏗️ Architecture Overview

```
Mobile App
    ↓
Express.js API Server
    ├── Voice Routes
    ├── Knowledge Routes
    └── Middleware (Validation, Logging, Error Handling)
    ↓
AWS Services
    ├── S3 (Document Storage)
    ├── Bedrock (Knowledge Base & RAG)
    └── CloudWatch (Monitoring)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture.

## 🔧 Configuration

### Environment Variables
- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `S3_BUCKET_NAME` - S3 bucket name
- `KNOWLEDGE_BASE_ID` - Bedrock Knowledge Base ID
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### AWS Configuration
See [docs/AWS_SETUP.md](docs/AWS_SETUP.md) for complete AWS setup instructions.

## 📦 Dependencies

### Core
- `express` - Web framework
- `cors` - Cross-origin requests
- `multer` - File uploads
- `dotenv` - Environment variables

### AWS SDK
- `@aws-sdk/client-s3` - S3 operations
- `@aws-sdk/client-bedrock-agent-runtime` - Bedrock queries
- `@aws-sdk/s3-request-presigner` - Presigned URLs

### Development
- `nodemon` - Auto-reload

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Voice query
curl -X POST http://localhost:3000/api/voice/text \
  -H "Content-Type: application/json" \
  -d '{"query": "How to treat fever?", "category": "health"}'

# Knowledge query
curl "http://localhost:3000/api/knowledge?query=pest%20control"
```

## 🚢 Deployment

### Amplify (Recommended)
```bash
git push origin main
# Amplify auto-deploys
```

### Docker
```bash
docker-compose up
```

### Manual
```bash
npm start
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment options.

## 📊 Monitoring

### CloudWatch Metrics
- Request count
- Error rate
- Response time
- Knowledge base queries

### Logs
- Request/response logs
- Error logs
- AWS service logs

See [monitoring/](monitoring/) for monitoring implementation.

## 🔐 Security

- ✅ Input validation
- ✅ Error handling
- ✅ AWS IAM integration
- ✅ S3 encryption
- ✅ HTTPS/TLS support
- ✅ CORS configuration

## 📝 Knowledge Categories

1. **Agriculture**
   - Pest control
   - Crop care
   - Farming techniques

2. **Health**
   - Medicine information
   - Treatment guidelines
   - Health tips

3. **Safety**
   - Scam warnings
   - Fraud prevention
   - Safety guidelines

## 🛠️ Development Workflow

### Local Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Deploy
```bash
bash scripts/deploy.sh
```

### Run with Docker
```bash
docker-compose up
```

## 📚 Additional Resources

### AWS Documentation
- [AWS Bedrock](https://docs.aws.amazon.com/bedrock/)
- [AWS S3](https://docs.aws.amazon.com/s3/)
- [AWS Amplify](https://docs.aws.amazon.com/amplify/)
- [AWS CloudWatch](https://docs.aws.amazon.com/cloudwatch/)

### Framework Documentation
- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)

## 🐛 Troubleshooting

### Common Issues
- Port already in use → Kill process on port 3000
- AWS credentials not found → Set environment variables
- S3 bucket not found → Create bucket via AWS CLI
- Bedrock timeout → Check knowledge base sync status

See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for more troubleshooting tips.

## 📋 Checklist

### Before Deployment
- [ ] All environment variables configured
- [ ] AWS credentials set up
- [ ] S3 bucket created
- [ ] Bedrock Knowledge Base created
- [ ] Documents uploaded to S3
- [ ] Tests passing
- [ ] Code committed to Git

### After Deployment
- [ ] API endpoints responding
- [ ] Knowledge base queries working
- [ ] Monitoring configured
- [ ] Logs being collected
- [ ] Alerts set up

## 🔄 Maintenance

### Regular Tasks
- Monitor CloudWatch metrics
- Review error logs
- Update dependencies
- Security patches

### Backup & Recovery
- S3 versioning enabled
- Automated backups
- Disaster recovery plan

## 📞 Support

### Documentation
- Quick Start: [README.md](README.md)
- API Reference: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Deployment: [DEPLOYMENT.md](DEPLOYMENT.md)

### AWS Support
- [AWS Support Center](https://console.aws.amazon.com/support/)
- [AWS Documentation](https://docs.aws.amazon.com/)

## 📄 File Navigation

| File | Purpose |
|------|---------|
| [server.js](server.js) | Main Express server |
| [package.json](package.json) | Dependencies |
| [.env.example](.env.example) | Environment template |
| [amplify.yml](amplify.yml) | Amplify config |
| [README.md](README.md) | Quick start |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture docs |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment guide |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick lookup |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Project overview |

## 🎯 Next Steps

1. **Setup**: Follow [README.md](README.md)
2. **Configure**: Set up AWS using [docs/AWS_SETUP.md](docs/AWS_SETUP.md)
3. **Develop**: Use [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
4. **Deploy**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)
5. **Monitor**: Check [monitoring/](monitoring/)

## 📈 Performance Targets

- Response Time: < 2 seconds
- Availability: 99.9%
- Error Rate: < 1%
- Throughput: 100+ requests/second

## 💰 Cost Estimation

- S3 Storage: ~$1/month
- Bedrock Queries: ~$10/month
- Amplify Hosting: ~$5/month
- CloudWatch: ~$5/month
- **Total**: ~$20/month

---

**Last Updated**: March 2026
**Version**: 1.0.0
**Status**: Production Ready

For questions or issues, refer to the appropriate documentation file or contact the backend team.
