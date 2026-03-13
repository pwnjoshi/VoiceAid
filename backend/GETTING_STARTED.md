# VoiceAid Backend - Getting Started Guide

Step-by-step guide to get the VoiceAid backend up and running.

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] AWS Account with appropriate permissions
- [ ] Git installed
- [ ] Text editor or IDE (VS Code recommended)
- [ ] AWS CLI installed (optional but recommended)

### Verify Prerequisites

```bash
# Check Node.js
node --version  # Should be v18.0.0 or higher

# Check npm
npm --version   # Should be 9.0.0 or higher

# Check Git
git --version   # Should be 2.0.0 or higher
```

## Step 1: Clone Repository

```bash
# Clone the repository
git clone <repository-url>

# Navigate to backend directory
cd backend

# Verify structure
ls -la
```

Expected files:
- `server.js`
- `package.json`
- `.env.example`
- `README.md`

## Step 2: Install Dependencies

```bash
# Install npm packages
npm install

# Verify installation
npm list

# Check for vulnerabilities
npm audit
```

This will install:
- Express.js
- AWS SDK
- Multer
- CORS
- Dotenv
- And other dependencies

## Step 3: Configure Environment Variables

### Create .env File

```bash
# Copy the example file
cp .env.example .env

# Edit the file with your editor
nano .env
# or
code .env
```

### Set AWS Credentials

You need to obtain AWS credentials. Follow these steps:

1. **Go to AWS Console**
   - Visit https://console.aws.amazon.com/
   - Sign in with your AWS account

2. **Create IAM User** (if needed)
   - Go to IAM → Users
   - Click "Create user"
   - User name: `voiceaid-backend`
   - Attach policy: `AmazonS3FullAccess` + `AmazonBedrockFullAccess`

3. **Get Access Keys**
   - Go to IAM → Users → voiceaid-backend
   - Click "Security credentials"
   - Click "Create access key"
   - Copy Access Key ID and Secret Access Key

4. **Update .env File**

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=voiceaid-knowledge-docs
KNOWLEDGE_BASE_ID=XXXXXXXXXX
PORT=3000
NODE_ENV=development
```

## Step 4: Setup AWS Infrastructure

### Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://voiceaid-knowledge-docs --region us-east-1

# Verify bucket creation
aws s3 ls | grep voiceaid-knowledge-docs
```

### Create Folder Structure

```bash
# Create category folders
aws s3api put-object --bucket voiceaid-knowledge-docs --key knowledge/agriculture/
aws s3api put-object --bucket voiceaid-knowledge-docs --key knowledge/health/
aws s3api put-object --bucket voiceaid-knowledge-docs --key knowledge/safety/

# Verify folders
aws s3 ls s3://voiceaid-knowledge-docs/knowledge/ --recursive
```

### Enable S3 Versioning

```bash
aws s3api put-bucket-versioning \
  --bucket voiceaid-knowledge-docs \
  --versioning-configuration Status=Enabled
```

### Create Bedrock Knowledge Base

1. **Go to AWS Console**
   - Navigate to Amazon Bedrock
   - Click "Get started" if first time

2. **Request Model Access**
   - Go to Model access
   - Request access to:
     - Anthropic Claude (for generation)
     - Amazon Titan Embeddings (for vector search)
   - Wait for approval (usually instant)

3. **Create Knowledge Base**
   - Go to Knowledge bases
   - Click "Create knowledge base"
   - Name: `VoiceAid-Knowledge-Base`
   - Description: `Knowledge base for VoiceAid voice assistant`
   - Create new IAM role (auto-generated)

4. **Configure Data Source**
   - Data source name: `VoiceAid-S3-Documents`
   - S3 URI: `s3://voiceaid-knowledge-docs/knowledge/`
   - Chunking strategy: Default
   - Metadata: Include file path

5. **Select Embeddings Model**
   - Model: `Amazon Titan Embeddings G1 - Text`

6. **Create Vector Store**
   - Quick create new vector store (OpenSearch Serverless)

7. **Create Knowledge Base**
   - Click "Create knowledge base"
   - Wait for creation (5-10 minutes)

8. **Get Knowledge Base ID**
   - After creation, copy the Knowledge Base ID
   - Add to `.env` file:
   ```
   KNOWLEDGE_BASE_ID=XXXXXXXXXX
   ```

### Upload Sample Documents

```bash
# Create sample documents (see docs/SAMPLE_DOCUMENTS.md)
# Then upload them

# Agriculture
aws s3 cp pest-control.txt s3://voiceaid-knowledge-docs/knowledge/agriculture/
aws s3 cp crop-care.txt s3://voiceaid-knowledge-docs/knowledge/agriculture/

# Health
aws s3 cp fever-treatment.txt s3://voiceaid-knowledge-docs/knowledge/health/
aws s3 cp medicine-reminders.txt s3://voiceaid-knowledge-docs/knowledge/health/

# Safety
aws s3 cp otp-scam-warnings.txt s3://voiceaid-knowledge-docs/knowledge/safety/
aws s3 cp fraud-awareness.txt s3://voiceaid-knowledge-docs/knowledge/safety/
```

### Sync Knowledge Base

1. Go to AWS Console → Bedrock → Knowledge bases
2. Select your knowledge base
3. Click "Data sources"
4. Click "Sync" to ingest documents
5. Wait for sync to complete

## Step 5: Verify AWS Setup

```bash
# Test S3 access
aws s3 ls s3://voiceaid-knowledge-docs/

# Test Bedrock access
aws bedrock list-knowledge-bases --region us-east-1

# Test credentials
aws sts get-caller-identity
```

Expected output:
```json
{
  "UserId": "AIDAI...",
  "Account": "123456789012",
  "Arn": "arn:aws:iam::123456789012:user/voiceaid-backend"
}
```

## Step 6: Start the Server

### Development Mode

```bash
# Start with auto-reload
npm run dev

# Expected output:
# 🚀 VoiceAid Backend running on port 3000
# 📍 Environment: development
# 🌍 Health check: http://localhost:3000/health
```

### Production Mode

```bash
# Start server
npm start
```

## Step 7: Test the API

### Health Check

```bash
# Test if server is running
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "VoiceAid Backend",
#   "timestamp": "2026-03-10T12:00:00.000Z"
# }
```

### Test Voice Endpoint

```bash
# Test text query
curl -X POST http://localhost:3000/api/voice/text \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How to treat fever?",
    "category": "health"
  }'

# Expected response:
# {
#   "success": true,
#   "query": "How to treat fever?",
#   "answer": "For fever treatment, rest and stay hydrated...",
#   "citations": [...],
#   "category": "health",
#   "timestamp": "2026-03-10T12:00:00.000Z"
# }
```

### Test Knowledge Endpoint

```bash
# Query knowledge base
curl "http://localhost:3000/api/knowledge?query=pest%20control&category=agriculture"

# Expected response:
# {
#   "success": true,
#   "query": "pest control",
#   "results": [...],
#   "count": 5
# }
```

## Step 8: Run Tests

```bash
# Run test suite
npm test

# Expected output:
# PASS  tests/api.test.js
# PASS  tests/services.test.js
# Tests: 10 passed, 10 total
```

## Step 9: Explore Documentation

Read the following documentation to understand the system:

1. **[README.md](README.md)** - Quick overview
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design
3. **[docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)** - API reference
4. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Common commands

## Step 10: Deploy (Optional)

### Deploy to AWS Amplify

```bash
# Push to Git
git add .
git commit -m "Initial VoiceAid backend setup"
git push origin main

# Deploy via Amplify Console
# 1. Go to AWS Amplify Console
# 2. Connect your Git repository
# 3. Configure build settings
# 4. Deploy
```

### Deploy with Docker

```bash
# Build Docker image
docker build -f docker/Dockerfile -t voiceaid-backend:latest .

# Run container
docker-compose up
```

## Troubleshooting

### Issue: "Cannot find module 'express'"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "AWS credentials not found"

**Solution:**
```bash
# Verify .env file exists and has correct values
cat .env

# Or configure AWS CLI
aws configure
```

### Issue: "S3 bucket not found"

**Solution:**
```bash
# Create bucket
aws s3 mb s3://voiceaid-knowledge-docs --region us-east-1

# Verify
aws s3 ls | grep voiceaid-knowledge-docs
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Issue: "Bedrock Knowledge Base not responding"

**Solution:**
```bash
# Check knowledge base status
aws bedrock describe-knowledge-base --knowledge-base-id YOUR_KB_ID

# Check data source sync
aws bedrock list-data-sources --knowledge-base-id YOUR_KB_ID

# Sync data source
# Go to AWS Console → Bedrock → Knowledge bases → Sync
```

## Next Steps

After successful setup:

1. **Explore the Code**
   - Read `server.js` to understand the main server
   - Check `routes/` for API endpoints
   - Review `services/` for business logic

2. **Customize**
   - Add more knowledge documents
   - Customize error messages
   - Add authentication

3. **Deploy**
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md)
   - Set up monitoring
   - Configure alerts

4. **Integrate with Mobile App**
   - Share API endpoint with mobile team
   - Provide API documentation
   - Test integration

## Useful Commands

```bash
# Development
npm run dev              # Start with auto-reload
npm test                 # Run tests
npm start                # Start production server

# AWS
aws s3 ls               # List S3 buckets
aws bedrock list-knowledge-bases  # List knowledge bases

# Docker
docker-compose up       # Start with Docker
docker-compose down     # Stop Docker

# Git
git status              # Check status
git add .               # Stage changes
git commit -m "message" # Commit changes
git push                # Push to remote
```

## Verification Checklist

- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] .env file created and configured
- [ ] AWS credentials set up
- [ ] S3 bucket created
- [ ] Bedrock Knowledge Base created
- [ ] Documents uploaded to S3
- [ ] Knowledge Base synced
- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] API endpoints working
- [ ] Tests passing

## Support

If you encounter issues:

1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for troubleshooting
2. Review [docs/AWS_SETUP.md](docs/AWS_SETUP.md) for AWS configuration
3. Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
4. Contact the backend team

## Resources

- **AWS Documentation**: https://docs.aws.amazon.com/
- **Express.js**: https://expressjs.com/
- **Node.js**: https://nodejs.org/
- **AWS SDK**: https://docs.aws.amazon.com/sdk-for-javascript/

---

**Congratulations!** Your VoiceAid backend is now set up and ready for development.

**Next**: Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design.

**Questions?** Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) or contact the backend team.
