# VoiceAid - AI-Powered Voice Assistant for Elderly & Non-Literate Users

An AWS-native voice assistant system designed for elderly and non-literate users, featuring real-time speech-to-speech interaction, offline capabilities, and knowledge-based responses.

## 🎯 Vision: Orality-First Digital Inclusion

VoiceAid bridges the digital divide for 700+ million non-literate adults worldwide by replacing text-based interfaces with natural voice interaction. Built on AWS services, it provides:

- **Real-time Speech-to-Speech**: Sub-500ms latency using Amazon Nova Sonic
- **Orality-First Design**: Natural conversation without literacy requirements
- **Offline Resilience**: Works in low-connectivity areas with AWS Amplify DataStore
- **Knowledge-Grounded**: RAG system with AWS Bedrock for accurate, localized information
- **Voice Biometrics**: Secure, password-less authentication

## 🏗️ Architecture

```
Mobile App (React Native + Amplify DataStore)
    ↓ WebSocket Streaming
Backend API (Node.js + Express)
    ↓
├─ Amazon Nova Sonic → Real-time speech-to-speech
├─ Amazon Lex V2 → Intent recognition & dialogue
├─ AWS Bedrock Knowledge Base → RAG system
├─ AWS S3 → Document storage
└─ AWS Amplify → Offline sync
```

## ✨ Key Features

### For Users
- **One-Button Interface**: Large, color-coded button (Blue=Listening, Green=Processing, Orange=Speaking)
- **Voice-Only Interaction**: No reading or typing required
- **Offline Mode**: Basic functions work without internet
- **Medicine Reminders**: Voice-based medication scheduling
- **Fraud Detection**: Warns about common phone scams
- **Knowledge Base**: Agriculture, health, and safety information

### Technical Features
- Real-time bidirectional audio streaming (WebSocket)
- Amazon Nova Sonic for natural speech processing
- Amazon Lex V2 for intent recognition (6 intents)
- AWS Amplify DataStore for offline-first architecture
- Knowledge retrieval with AWS Bedrock
- Voice biometric authentication (planned)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- AWS Account with Bedrock access
- Expo CLI: `npm install -g expo-cli`
- Amplify CLI: `npm install -g @aws-amplify/cli`

### Installation

1. **Clone and install dependencies**:
```bash
git clone https://github.com/pwnjoshi/VoiceAid.git
cd VoiceAid
npm install
cd backend && npm install && cd ..
pip install -r requirements.txt
```

2. **Configure AWS services**:
```bash
# Setup Amazon Lex Bot
cd scripts && node setup-lex-bot.js

# Setup AWS Amplify
amplify init
amplify add api
amplify push
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your AWS credentials and service IDs
```

4. **Start services**:
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
npx expo start
```

## 📁 Project Structure

```
VoiceAid/
├── app/                          # React Native screens
├── src/
│   ├── components/               # UI components (VoiceButton)
│   ├── config/                   # API & Amplify configuration
│   ├── screens/                  # App screens
│   └── services/                 # Audio & API services
├── backend/
│   ├── controllers/              # Request handlers
│   ├── services/                 # Business logic
│   │   ├── novaSonicService.js  # Nova Sonic integration
│   │   ├── lexService.js        # Lex V2 integration
│   │   ├── streamingService.js  # WebSocket streaming
│   │   ├── bedrockService.js    # Bedrock AI
│   │   └── knowledgeService.js  # Knowledge base
│   ├── routes/                   # API endpoints
│   └── server.js                # Express + WebSocket server
├── amplify/
│   └── schema.graphql           # DataStore schema
└── scripts/
    ├── setup-lex-bot.js         # Automated Lex setup
    └── setup-amplify.sh         # Amplify initialization
```

## 🔗 API Endpoints

### Voice Processing
- `POST /api/voice/v2/process` - Process voice audio
- `POST /api/voice/v2/text` - Process text query
- `GET /api/voice/v2/status` - Service status
- `WS /stream` - WebSocket streaming

### Knowledge Base
- `GET /api/knowledge/v2/query` - Query knowledge base
- `POST /api/knowledge/v2/upload` - Upload documents
- `GET /api/knowledge/v2/documents` - List documents
- `GET /api/knowledge/v2/stats` - Statistics

## 🛠️ Technology Stack

### Frontend
- React Native + Expo
- AWS Amplify (Auth, DataStore, Storage)
- expo-av (Audio recording/playback)
- WebSocket client

### Backend
- Node.js + Express
- AWS SDK v3
- WebSocket (ws)
- Multer (file uploads)

### AWS Services
- **Amazon Nova Sonic** - Real-time speech-to-speech
- **Amazon Lex V2** - Intent recognition & dialogue
- **AWS Bedrock** - AI responses & knowledge base
- **AWS S3** - Document storage
- **AWS Amplify** - Offline sync & authentication
- **AWS CloudWatch** - Monitoring

## 📚 Documentation

- [AWS_NATIVE_IMPLEMENTATION.md](AWS_NATIVE_IMPLEMENTATION.md) - AWS setup guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Production deployment
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current implementation status
- [backend/README.md](backend/README.md) - Backend API documentation
- [backend/docs/](backend/docs/) - Detailed API & AWS guides

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Test WebSocket connection
node -e "const WebSocket = require('ws'); const ws = new WebSocket('ws://localhost:3000/stream'); ws.on('open', () => console.log('Connected!'));"

# Health check
curl http://localhost:3000/health
```

## 🌐 AWS Setup

### 1. Request Nova Sonic Access
1. Go to AWS Bedrock console
2. Request preview access to Nova Sonic
3. Wait for approval (24-48 hours)

### 2. Create Lex Bot
```bash
cd scripts
node setup-lex-bot.js
```

### 3. Setup Amplify
```bash
amplify init
amplify add api
amplify add auth
amplify push
```

### 4. Configure S3 & Bedrock
- Create S3 bucket: `voiceaid-knowledge-docs`
- Create Bedrock Knowledge Base
- Upload documents to S3
- Connect Knowledge Base to S3

See [AWS_NATIVE_IMPLEMENTATION.md](AWS_NATIVE_IMPLEMENTATION.md) for detailed instructions.

## 🎯 Use Cases

### Agriculture
- Pest control advice
- Seasonal planting guidance
- Market price information
- Weather updates

### Healthcare
- Medicine reminders
- Symptom checking
- Basic health advice
- Doctor appointment scheduling

### Safety
- Fraud detection & warnings
- Emergency contact calling
- OTP scam prevention
- Safety tips

## 🚀 Deployment

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for production deployment guide.

Quick deploy to AWS:
```bash
cd backend
npm run deploy
```

## 🤝 Contributing

This project was built for the AWS AIdeas 2025 competition.

**Team Members**: [Your team names]

## 📄 License

Private - VoiceAid Project

## 🆘 Support

For issues or questions:
1. Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for current status
2. Review [AWS_NATIVE_IMPLEMENTATION.md](AWS_NATIVE_IMPLEMENTATION.md) for setup help
3. Check backend logs in `backend/logs/`
4. Review AWS CloudWatch logs

## 🎉 Acknowledgments

Built with AWS services:
- Amazon Nova Sonic (Preview)
- Amazon Lex V2
- AWS Bedrock
- AWS Amplify
- AWS S3

---

**Making technology accessible to everyone, one voice at a time.**
