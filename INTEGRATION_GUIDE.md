# VoiceAid - Complete Integration Guide

## 🎯 Overview

VoiceAid is now fully integrated with:
- **Frontend**: React Native mobile app (Vidushi's work)
- **Backend**: Node.js/Express API with AWS integration (Bhumika's work)
- **Voice AI**: Python-based Groq API voice processing (Voice AI Feature)

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- AWS credentials (Access Key, Secret Key, Region)
- S3 bucket name
- AWS Bedrock Knowledge Base ID
- Groq API key

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:3000`

### 3. Python Voice AI Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create config file
cp config.example.py config.py

# Add your Groq API key to config.py
```

### 4. Frontend Setup

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start
```

## 📁 Project Structure

```
VoiceAid/
├── app/                          # React Native frontend
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── index.tsx            # Home screen
│   │   ├── explore.tsx          # Explore screen
│   │   └── _layout.tsx          # Tab layout
│   ├── modal.tsx                # Modal screens
│   └── _layout.tsx              # Root layout
├── src/                         # Frontend source
│   ├── components/              # Reusable components
│   │   └── VoiceButton.js       # Voice recording button
│   ├── config/
│   │   └── api.js               # API configuration
│   ├── screens/                 # App screens
│   │   ├── HomeScreen.js
│   │   ├── CaretakerScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── services/                # Frontend services
│       ├── ApiService.js        # Backend API client
│       └── AudioService.js      # Audio recording/playback
├── backend/                     # Node.js backend
│   ├── config/                  # Configuration
│   │   ├── awsConfig.js        # AWS settings
│   │   └── database.js         # Database config
│   ├── controllers/             # Request handlers
│   │   ├── voiceController.js  # Voice processing
│   │   └── knowledgeController.js
│   ├── services/                # Business logic
│   │   ├── bedrockService.js   # AWS Bedrock AI
│   │   ├── knowledgeService.js # Knowledge base
│   │   ├── s3Service.js        # S3 storage
│   │   └── voiceAiIntegration.js # Python voice AI bridge
│   ├── routes/                  # API routes
│   └── server.js               # Express server
├── voice_ai_service.py         # Python voice AI
├── voice_ai_groq.py            # Groq API integration
└── requirements.txt            # Python dependencies
```

## 🔗 API Integration Flow

### Voice Processing Flow

1. **User speaks** → Frontend records audio
2. **Audio sent** → Backend `/api/voice/v2/process`
3. **Transcription** → Python Voice AI (Groq API)
4. **Knowledge retrieval** → AWS Bedrock Knowledge Base
5. **AI response** → AWS Bedrock with context
6. **Response returned** → Frontend plays audio

### Endpoints

#### Voice Endpoints
- `POST /api/voice/v2/process` - Process voice audio
- `POST /api/voice/v2/text` - Process text query
- `GET /api/voice/v2/status` - Service status

#### Knowledge Endpoints
- `GET /api/knowledge/v2/query` - Query knowledge base
- `POST /api/knowledge/v2/upload` - Upload documents
- `GET /api/knowledge/v2/documents` - List documents
- `GET /api/knowledge/v2/stats` - Get statistics

## 🔧 Configuration

### Frontend Configuration

Edit `src/config/api.js`:
```javascript
export const API_BASE_URL = 'http://your-backend-url:3000';
```

Or set environment variable:
```bash
EXPO_PUBLIC_API_URL=http://your-backend-url:3000
```

### Backend Configuration

Required environment variables in `backend/.env`:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=voiceaid-knowledge-docs
KNOWLEDGE_BASE_ID=your_kb_id
```

### Voice AI Configuration

Edit `config.py`:
```python
GROQ_API_KEY = "your_groq_api_key"
```

## 🌐 AWS Setup

### 1. S3 Bucket
- Create bucket: `voiceaid-knowledge-docs`
- Enable versioning
- Set up folder structure:
  - `knowledge/agriculture/`
  - `knowledge/health/`
  - `knowledge/safety/`

### 2. Bedrock Knowledge Base
- Create knowledge base in AWS Bedrock
- Connect to S3 bucket
- Configure data source
- Note the Knowledge Base ID

### 3. IAM Permissions
Required permissions:
- `s3:GetObject`, `s3:PutObject`, `s3:ListBucket`
- `bedrock:InvokeModel`
- `bedrock:Retrieve`

## 🧪 Testing

### Test Backend
```bash
cd backend
npm test
```

### Test Voice AI
```bash
python test_setup.py
python test_api_key.py
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Voice status
curl http://localhost:3000/api/voice/v2/status

# Knowledge stats
curl http://localhost:3000/api/knowledge/v2/stats
```

## 📱 Running the App

### Development
```bash
# Start backend
cd backend && npm start

# Start frontend (in new terminal)
npx expo start
```

### Production
See `backend/DEPLOYMENT.md` for AWS deployment instructions.

## 🐛 Troubleshooting

### Backend won't start
- Check `.env` file exists and has all required variables
- Verify AWS credentials are valid
- Check port 3000 is not in use

### Voice AI not working
- Verify Python dependencies installed: `pip install -r requirements.txt`
- Check Groq API key in `config.py`
- Test with: `python test_api_key.py`

### Frontend can't connect
- Verify backend is running
- Check `API_BASE_URL` in `src/config/api.js`
- For mobile device, use computer's IP address instead of localhost

## 📚 Documentation

- Backend API: `backend/docs/API_DOCUMENTATION.md`
- AWS Setup: `backend/docs/AWS_SETUP.md`
- Voice AI: `README_VOICE_AI.md`
- Deployment: `backend/DEPLOYMENT.md`

## 🎉 Next Steps

1. Configure AWS credentials
2. Set up Groq API key
3. Upload knowledge documents to S3
4. Test the complete flow
5. Deploy to production

## 💡 Tips

- Use `backend/docs/SAMPLE_DOCUMENTS.md` for test data
- Monitor AWS CloudWatch for backend logs
- Check `backend/monitoring/` for metrics
- Use Expo Go app for quick mobile testing

## 🤝 Team Contributions

- **Vidushi**: Frontend React Native app, screens, and services
- **Bhumika**: Backend API, AWS integration, knowledge base
- **Voice AI Team**: Groq API integration, voice processing

---

For detailed documentation, see individual README files in each directory.
