# AWS Setup Guide for VoiceAid Backend

Complete step-by-step guide to set up AWS infrastructure for VoiceAid.

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Node.js 18+ installed

## Step 1: Create S3 Bucket

### Using AWS Console

1. Go to AWS Console → S3
2. Click "Create bucket"
3. Bucket name: `voiceaid-knowledge-docs`
4. Region: `us-east-1` (or your preferred region)
5. Block all public access: **Enabled**
6. Versioning: **Enabled** (recommended)
7. Click "Create bucket"

### Using AWS CLI

```bash
# Create bucket
aws s3 mb s3://voiceaid-knowledge-docs --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket voiceaid-knowledge-docs \
  --versioning-configuration Status=Enabled
```

## Step 2: Create Folder Structure in S3

```bash
# Create category folders
aws s3api put-object --bucket voiceaid-knowledge-docs --key knowledge/agriculture/
aws s3api put-object --bucket voiceaid-knowledge-docs --key knowledge/health/
aws s3api put-object --bucket voiceaid-knowledge-docs --key knowledge/safety/
```

## Step 3: Upload Sample Documents

### Agriculture Documents
Create and upload sample documents:

```bash
# Example: Upload pest control guide
aws s3 cp pest-control-guide.pdf s3://voiceaid-knowledge-docs/knowledge/agriculture/
aws s3 cp crop-care-tips.pdf s3://voiceaid-knowledge-docs/knowledge/agriculture/
```

### Health Documents
```bash
aws s3 cp medicine-reminders.pdf s3://voiceaid-knowledge-docs/knowledge/health/
aws s3 cp fever-treatment.pdf s3://voiceaid-knowledge-docs/knowledge/health/
```

### Safety Documents
```bash
aws s3 cp otp-scam-warnings.pdf s3://voiceaid-knowledge-docs/knowledge/safety/
aws s3 cp fraud-awareness.pdf s3://voiceaid-knowledge-docs/knowledge/safety/
```

## Step 4: Setup Amazon Bedrock Knowledge Base

### Enable Bedrock Access

1. Go to AWS Console → Amazon Bedrock
2. Click "Get started"
3. Request model access for:
   - Anthropic Claude (for generation)
   - Amazon Titan Embeddings (for vector search)
4. Wait for approval (usually instant)

### Create Knowledge Base

1. Go to Amazon Bedrock → Knowledge bases
2. Click "Create knowledge base"

**Knowledge Base Details:**
- Name: `VoiceAid-Knowledge-Base`
- Description: `Knowledge base for VoiceAid voice assistant`
- IAM role: Create new role (auto-generated)

**Data Source Configuration:**
- Data source name: `VoiceAid-S3-Documents`
- S3 URI: `s3://voiceaid-knowledge-docs/knowledge/`
- Chunking strategy: Default
- Metadata: Include file path

**Embeddings Model:**
- Select: `Amazon Titan Embeddings G1 - Text`

**Vector Database:**
- Quick create new vector store (OpenSearch Serverless)

3. Click "Create knowledge base"
4. Wait for creation (5-10 minutes)
5. Click "Sync data source" to ingest documents

### Get Knowledge Base ID

After creation, copy the Knowledge Base ID from the details page.
Format: `XXXXXXXXXX` (10 characters)

Add to your `.env` file:
```
KNOWLEDGE_BASE_ID=XXXXXXXXXX
```

## Step 5: Configure IAM Permissions

### Create IAM Policy

Create a policy with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::voiceaid-knowledge-docs",
        "arn:aws:s3:::voiceaid-knowledge-docs/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:Retrieve",
        "bedrock:RetrieveAndGenerate"
      ],
      "Resource": "*"
    }
  ]
}
```

### Create IAM User

1. Go to IAM → Users → Create user
2. User name: `voiceaid-backend`
3. Attach the policy created above
4. Create access key
5. Copy Access Key ID and Secret Access Key
6. Add to `.env` file

## Step 6: Test the Setup

### Test S3 Access
```bash
aws s3 ls s3://voiceaid-knowledge-docs/knowledge/
```

### Test Knowledge Base
```bash
# Using AWS CLI
aws bedrock-agent-runtime retrieve \
  --knowledge-base-id YOUR_KB_ID \
  --retrieval-query text="How to prevent crop pests?" \
  --region us-east-1
```

## Step 7: Deploy to AWS Amplify

### Connect Repository

1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect your Git repository
4. Select branch: `main`

### Configure Build Settings

Use the provided `amplify.yml` file.

### Set Environment Variables

In Amplify Console → Environment variables, add:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `KNOWLEDGE_BASE_ID`
- `NODE_ENV=production`

### Deploy

1. Click "Save and deploy"
2. Wait for deployment
3. Get your API endpoint URL

## Cost Estimation

**Monthly costs (estimated):**
- S3 Storage: $0.023/GB (~$1 for 50GB)
- Bedrock Knowledge Base: $0.10 per 1000 queries
- OpenSearch Serverless: ~$700/month (consider using free tier)
- Amplify Hosting: $0.01 per build minute + $0.15/GB served

**Cost Optimization:**
- Use S3 Intelligent-Tiering
- Enable CloudWatch cost alerts
- Consider using Bedrock on-demand pricing

## Troubleshooting

### Issue: Knowledge Base not returning results
- Ensure documents are synced
- Check document format (PDF, TXT, MD supported)
- Verify IAM permissions

### Issue: S3 access denied
- Check IAM policy
- Verify bucket name in `.env`
- Ensure credentials are correct

### Issue: Bedrock model access denied
- Request model access in Bedrock console
- Wait for approval
- Check region availability

## Security Best Practices

1. Never commit `.env` file to Git
2. Use IAM roles instead of access keys when possible
3. Enable S3 bucket encryption
4. Enable CloudTrail logging
5. Use VPC endpoints for private access
6. Rotate access keys regularly

## Next Steps

- Add more documents to knowledge base
- Configure CloudWatch monitoring
- Set up API Gateway for rate limiting
- Implement caching with ElastiCache
- Add authentication with Cognito
