# AWS Native Implementation Guide

## Overview

This guide covers implementing the AWS-native components for VoiceAid:
- Amazon Nova Sonic (Speech-to-Speech)
- Amazon Lex V2 (Intent Recognition)
- AWS Amplify DataStore (Offline Sync)
- WebSocket Streaming (Real-time)

## Prerequisites

1. AWS Account with Bedrock access
2. Nova Sonic preview access (request from AWS)
3. AWS CLI configured
4. Node.js 16+ and npm
5. Amplify CLI: `npm install -g @aws-amplify/cli`

## Step 1: Amazon Nova Sonic Setup

### Request Preview Access
1. Go to AWS Bedrock console
2. Request access to Nova Sonic model
3. Wait for approval (24-48 hours)
4. Note the model ID: `amazon.nova-sonic-v1:0`

### Test Access
```bash
cd backend
node -e "
const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime');
const client = new BedrockRuntimeClient({ region: 'us-east-1' });
console.log('Bedrock client initialized');
"
```

## Step 2: Amazon Lex V2 Bot Setup

### Option A: Automated Setup
```bash
cd scripts
npm install @aws-sdk/client-lex-models-v2
node setup-lex-bot.js
```

### Option B: Manual Setup
1. Go to Amazon Lex console
2. Create new bot: "VoiceAidBot"
3. Add intents from `backend/lex-bot-definition.json`
4. Build and test bot
5. Note Bot ID and Alias ID

## Step 3: AWS Amplify Setup

### Initialize Amplify
```bash
amplify init
# Follow prompts:
# - Project name: voiceaid
# - Environment: dev
# - Default editor: your choice
# - App type: javascript
# - Framework: react-native
```

### Add API (GraphQL + DataStore)
```bash
amplify add api
# Choose: GraphQL
# API name: voiceaidapi
# Authorization: API key
# Schema: Use amplify/schema.graphql
# Enable DataStore: Yes
# Enable conflict resolution: Yes
```

### Add Authentication
```bash
amplify add auth
# Choose: Default configuration
# Sign-in method: Phone number
# Advanced settings: Enable voice biometrics
```

### Deploy
```bash
amplify push
```

## Step 4: WebSocket Server Configuration

The WebSocket server is already implemented in:
- `backend/services/streamingService.js`
- `backend/server.js` (WebSocket initialization)

### Test WebSocket
```bash
# Start backend
cd backend && npm start

# In another terminal, test connection
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000/stream');
ws.on('open', () => console.log('Connected!'));
ws.on('message', (data) => console.log('Message:', data.toString()));
"
```

## Step 5: Frontend Integration

### Update App Entry Point
Add to `app/_layout.tsx`:
```typescript
import { Amplify } from 'aws-amplify';
import amplifyConfig from '../src/config/amplify';

Amplify.configure(amplifyConfig);
```

### Use Streaming Service
Replace `AudioService` with `StreamingAudioService` in components.

## Step 6: Environment Configuration

Update `.env` with all required values:
```bash
# Copy example
cp .env.example .env

# Add your values
LEX_BOT_ID=your_bot_id
LEX_BOT_ALIAS_ID=TSTALIASID
EXPO_PUBLIC_USER_POOL_ID=your_pool_id
# ... etc
```

## Step 7: Testing

### Test Nova Sonic
```bash
cd backend
node -e "
const service = require('./services/novaSonicService');
// Test with sample audio
"
```

### Test Lex
```bash
cd backend
node -e "
const service = require('./services/lexService');
service.recognizeText('Hello', 'test-session')
  .then(console.log);
"
```

### Test Streaming
1. Start backend: `cd backend && npm start`
2. Start frontend: `npx expo start`
3. Test voice recording with streaming

## Troubleshooting

### Nova Sonic Access Denied
- Verify preview access approved
- Check IAM permissions for Bedrock
- Confirm model ID is correct

### Lex Bot Not Found
- Verify bot is built (not just saved)
- Check bot ID in environment variables
- Ensure bot alias exists

### DataStore Sync Issues
- Check network connectivity
- Verify Amplify configuration
- Review CloudWatch logs

## Next Steps

1. Implement voice biometrics
2. Add Lambda fulfillment functions
3. Integrate with IoT for smart home
4. Add banking/payment features
5. Deploy to production

See DEPLOYMENT_CHECKLIST.md for production deployment.
