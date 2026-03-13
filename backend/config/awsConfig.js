// AWS SDK Configuration for VoiceAid Backend
require('dotenv').config();

const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

// S3 Bucket Configuration
const s3Config = {
  bucketName: process.env.S3_BUCKET_NAME || 'voiceaid-knowledge-docs',
  // Folder structure for different knowledge categories
  folders: {
    agriculture: 'knowledge/agriculture/',
    health: 'knowledge/health/',
    safety: 'knowledge/safety/'
  }
};

// Bedrock Knowledge Base Configuration
const bedrockConfig = {
  knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
  modelArn: 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-v2'
};

module.exports = {
  awsConfig,
  s3Config,
  bedrockConfig
};
