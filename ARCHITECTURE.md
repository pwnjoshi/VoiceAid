# VoiceAid System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VoiceAid System                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│  Mobile App      │◄───────►│  Backend API     │◄───────►│  AWS Services    │
│  (React Native)  │         │  (Node.js)       │         │                  │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                            │                            │
        │                            │                            │
        ▼                            ▼                            ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│ Voice Recording  │         │ Voice AI Bridge  │         │ S3 Storage       │
│ Audio Playback   │         │ (Python)         │         │ Bedrock AI       │
│ UI Components    │         │ Groq API         │         │ Knowledge Base   │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

## 📱 Frontend Layer (React Native)

### Components
- **VoiceButton.js** - Main voice interaction component
- **HomeScreen.js** - Primary user interface
- **CaretakerScreen.tsx** - Caretaker configuration
- **SettingsScreen.tsx** - App settings

### Services
- **AudioService.js** - Record and play audio
- **ApiService.js** - Backend communication

### Flow
1. User taps voice button
2. Record audio using expo-av
3. Send to backend API
4. Receive and play response

## 🖥️ Backend Layer (Node.js/Express)

### Controllers
- **voiceController.js** - Voice processing logic
- **knowledgeController.js** - Knowledge base queries

### Services
- **bedrockService.js** - AWS Bedrock AI integration
- **knowledgeService.js** - Knowledge retrieval
- **s3Service.js** - Document storage
- **voiceAiIntegration.js** - Python voice AI bridge

### Routes
```
/api/voice/v2/process    - Process voice audio
/api/voice/v2/text       - Process text query
/api/voice/v2/status     - Service status
/api/knowledge/v2/query  - Query knowledge base
/api/knowledge/v2/upload - Upload documents
```

## 🐍 Voice AI Layer (Python)

### Services
- **voice_ai_service.py** - Main voice processing
- **voice_ai_groq.py** - Groq API integration
- **voice_ai_enhanced.py** - Enhanced features

### Capabilities
- Speech-to-text transcription
- Text-to-speech generation
- Multi-language support

## ☁️ AWS Layer

### Services Used
1. **S3** - Document storage
   - Bucket: voiceaid-knowledge-docs
   - Folders: agriculture/, health/, safety/

2. **Bedrock** - AI responses
   - Model: Claude v2
   - Knowledge base integration

3. **CloudWatch** - Monitoring and logs

## 🔄 Data Flow

### Voice Query Flow
```
1. User speaks → Mobile App records audio
2. Audio sent → Backend API (/api/voice/v2/process)
3. Backend → Python Voice AI (transcription)
4. Transcription → Knowledge Service (retrieve context)
5. Context + Query → AWS Bedrock (generate response)
6. Response → Mobile App
7. App plays audio response
```

### Knowledge Query Flow
```
1. Query text → Backend API
2. Backend → Knowledge Service
3. Knowledge Service → AWS Bedrock Knowledge Base
4. Bedrock retrieves relevant documents from S3
5. Documents + Query → Bedrock AI
6. AI generates contextual response
7. Response returned to client
```

## 🔐 Security

### Authentication
- AWS IAM credentials
- API key management
- Environment variables

### Data Protection
- HTTPS for all API calls
- Encrypted S3 storage
- Secure credential storage

## 📊 Scalability

### Current Setup
- Single backend server
- Direct AWS integration
- Mobile app per user

### Production Scaling
- Load balancer for backend
- Multiple backend instances
- CloudWatch auto-scaling
- CDN for static assets

## 🛠️ Technology Stack

### Frontend
- React Native
- Expo SDK
- expo-av (audio)
- expo-router (navigation)

### Backend
- Node.js 16+
- Express.js
- AWS SDK v3
- Multer (file uploads)

### Voice AI
- Python 3.8+
- Groq API
- Speech recognition libraries

### Cloud
- AWS S3
- AWS Bedrock
- AWS CloudWatch

## 📈 Performance Considerations

### Optimization Points
1. **Audio Compression** - Reduce file sizes
2. **Caching** - Cache frequent queries
3. **CDN** - Serve static content
4. **Connection Pooling** - Reuse AWS connections
5. **Async Processing** - Non-blocking operations

### Monitoring
- Response times
- Error rates
- AWS costs
- User engagement

## 🔄 Integration Points

### Mobile ↔ Backend
- REST API over HTTPS
- JSON request/response
- FormData for audio files

### Backend ↔ Python
- Child process spawning
- JSON communication
- File system for audio

### Backend ↔ AWS
- AWS SDK v3
- S3 for storage
- Bedrock for AI

## 🚀 Deployment Architecture

### Development
```
Local Machine
├── Frontend (Expo Dev Server)
├── Backend (localhost:3000)
└── Python Voice AI (local)
```

### Production
```
AWS Cloud
├── EC2/Elastic Beanstalk (Backend)
├── S3 (Documents + Static Assets)
├── Bedrock (AI Processing)
└── CloudWatch (Monitoring)

Mobile Devices
└── React Native App (iOS/Android)
```

## 📝 Configuration Management

### Environment Variables
- `.env` - Backend configuration
- `config.py` - Python configuration
- `src/config/api.js` - Frontend configuration

### Secrets Management
- AWS credentials
- API keys
- Database credentials

---

For implementation details, see:
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- [backend/docs/API_DOCUMENTATION.md](backend/docs/API_DOCUMENTATION.md)
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
