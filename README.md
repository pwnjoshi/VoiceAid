# VoiceAid - AI-Powered Voice Assistant for Elderly Users

A comprehensive voice assistant system combining React Native mobile app, Node.js backend with AWS integration, and Python-based voice AI processing using Groq API.

## 🎯 Overview

VoiceAid enables elderly and non-literate users to interact with an AI assistant using voice. The system processes voice queries, retrieves relevant information from a knowledge base, and provides intelligent responses.

## ✨ Features

### Mobile App (Frontend)
- **Voice Recording**: Record user's voice with a simple tap
- **AI Integration**: Send audio to backend API and receive AI responses
- **Audio Playback**: Play AI-generated responses
- **Simple UI**: Large circular button with color-coded states
- **Caretaker Setup**: Configure caretaker contact information
- **Settings**: Basic app settings

### Backend API
- **Voice Processing**: Transcribe and process voice queries
- **Knowledge Base**: AWS Bedrock integration for intelligent responses
- **Document Management**: Upload and manage knowledge documents
- **S3 Storage**: Secure document storage
- **RESTful API**: Well-documented endpoints

### Voice AI Service
- **Speech-to-Text**: Groq API-powered transcription
- **Text-to-Speech**: Generate natural voice responses
- **Multi-language Support**: Process queries in multiple languages

## 🚀 Quick Start

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for complete setup instructions.

### Prerequisites
- Node.js 16+
- Python 3.8+
- AWS Account with Bedrock access
- Groq API key
- Expo CLI

### Installation

1. **Clone and install dependencies**:
```bash
npm install
cd backend && npm install
pip install -r requirements.txt
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Start services**:
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
npx expo start
```

## 📁 Project Structure

```
VoiceAid/
├── app/                    # React Native frontend
├── src/                    # Frontend source code
│   ├── components/         # UI components
│   ├── screens/           # App screens
│   └── services/          # API & audio services
├── backend/               # Node.js backend
│   ├── controllers/       # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   └── docs/             # Documentation
├── voice_ai_*.py         # Python voice AI services
└── requirements.txt      # Python dependencies
```

## 🔗 API Endpoints

### Voice Processing
- `POST /api/voice/v2/process` - Process voice audio
- `POST /api/voice/v2/text` - Process text query
- `GET /api/voice/v2/status` - Service status

### Knowledge Base
- `GET /api/knowledge/v2/query` - Query knowledge base
- `POST /api/knowledge/v2/upload` - Upload documents
- `GET /api/knowledge/v2/documents` - List documents

See [backend/docs/API_DOCUMENTATION.md](backend/docs/API_DOCUMENTATION.md) for complete API reference.

## 🎨 Button States

- **Gray (Idle)**: Ready to record
- **Blue (Listening)**: Recording user's voice
- **Green (Processing)**: Sending audio to backend API
- **Orange (Speaking)**: Playing AI response

## 🔧 Configuration

### Frontend
Edit `src/config/api.js` or set environment variable:
```bash
EXPO_PUBLIC_API_URL=http://your-backend-url:3000
```

### Backend
Required in `backend/.env`:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=voiceaid-knowledge-docs
KNOWLEDGE_BASE_ID=your_kb_id
```

### Voice AI
Edit `config.py`:
```python
GROQ_API_KEY = "your_groq_api_key"
```

## 🌐 AWS Setup

1. **S3 Bucket**: Create `voiceaid-knowledge-docs` with folder structure
2. **Bedrock Knowledge Base**: Set up and connect to S3
3. **IAM Permissions**: Configure S3 and Bedrock access

See [backend/docs/AWS_SETUP.md](backend/docs/AWS_SETUP.md) for detailed instructions.

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Voice AI tests
python test_setup.py
python test_api_key.py

# API health check
curl http://localhost:3000/health
```

## 📱 Running the App

### Development
```bash
# Start backend
cd backend && npm start

# Start frontend (new terminal)
npx expo start
```

### Production
See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for AWS deployment.

## 🛠️ Tech Stack

### Frontend
- React Native
- Expo
- expo-av (audio)
- expo-router (navigation)

### Backend
- Node.js / Express
- AWS SDK (S3, Bedrock)
- Multer (file uploads)

### Voice AI
- Python 3.8+
- Groq API
- Speech recognition libraries

## 📚 Documentation

- [Integration Guide](INTEGRATION_GUIDE.md) - Complete setup guide
- [Backend API](backend/docs/API_DOCUMENTATION.md) - API reference
- [AWS Setup](backend/docs/AWS_SETUP.md) - AWS configuration
- [Voice AI](README_VOICE_AI.md) - Voice AI service details
- [Deployment](backend/DEPLOYMENT.md) - Production deployment

## 🤝 Team Contributions

- **Vidushi**: Frontend React Native app, screens, and services
- **Bhumika**: Backend API, AWS integration, knowledge base system
- **Voice AI Team**: Groq API integration, voice processing services

## 🐛 Troubleshooting

### Backend Issues
- Verify `.env` file exists with all required variables
- Check AWS credentials are valid
- Ensure port 3000 is available

### Voice AI Issues
- Install Python dependencies: `pip install -r requirements.txt`
- Verify Groq API key in `config.py`
- Test with: `python test_api_key.py`

### Frontend Issues
- Verify backend is running
- Check `API_BASE_URL` in `src/config/api.js`
- Use device IP instead of localhost for mobile testing

## 🎯 Future Enhancements

- Offline mode with cached responses
- Multiple language support
- Emergency contact quick dial
- Voice command shortcuts
- Audio history playback
- Real-time translation
- Health monitoring integration

## 📄 License

Private - VoiceAid Project

---

For detailed setup instructions, see [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
