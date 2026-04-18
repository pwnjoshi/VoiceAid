require('dotenv').config();

const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID     || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const s3Config = {
  bucketName: process.env.S3_BUCKET_NAME || 'voiceaid-knowledge-docs',
  folders: {
    agriculture: 'knowledge/agriculture/',
    health:      'knowledge/health/',
    safety:      'knowledge/safety/',
    livelihoods: 'knowledge/livelihoods/',
    climate:     'knowledge/climate/',
  },
};

const bedrockConfig = {
  knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID || '',
  modelArn: process.env.BEDROCK_MODEL_ARN ||
    'arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-lite-v1:0',
};

module.exports = { awsConfig, s3Config, bedrockConfig };
