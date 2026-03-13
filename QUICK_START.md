# VoiceAid - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Clone and Install (2 min)

```bash
# Install all dependencies
npm install
cd backend && npm install && cd ..
pip install -r requirements.txt
```

### Step 2: Configure Environment (2 min)

**Create .env file:**
```bash
cp .env.example .env
```

**Edit .env and add:**
- AWS credentials (get from AWS Console)
- Groq API key (get from https://console.groq.com)
- S3 bucket name
- Bedrock Knowledge Base ID

**Create config.py:**
```bash
cp config.example.py config.py
# Edit config.py and add your Groq API key
```

### Step 3: Start Services (1 min)

**Windows:**
```bash
# Terminal 1: Start Backend
start-backend.bat

# Terminal 2: Start Frontend
start-frontend.bat
```

**Mac/Linux:**
```bash
# Terminal 1: Start Backend
./start-backend.sh

# Terminal 2: Start Frontend
./start-frontend.sh
```

## ✅ Verify Everything Works

### 1. Check Backend
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"healthy",...}`

### 2. Check Voice AI
```bash
python test_api_key.py
```
Expected: Success message

### 3. Test Frontend
- Open Expo app on your phone
- Scan QR code
- Tap the voice button
- Speak a question
- Listen to response

## 🔧 Common Issues

### Backend won't start
```bash
# Check if .env exists
ls backend/.env

# Check if port 3000 is free
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux
```

### Voice AI not working
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Test Groq API key
python test_api_key.py
```

### Frontend can't connect
1. Check backend is running: `curl http://localhost:3000/health`
2. Update API URL in `src/config/api.js`
3. For mobile device, use your computer's IP instead of localhost

## 📱 Using the App

1. **Tap** the large circular button
2. **Speak** your question
3. **Wait** for processing (button turns green)
4. **Listen** to the AI response (button turns orange)

## 🎯 What to Test

### Voice Queries
- "What are the best farming practices?"
- "How do I treat a fever?"
- "What safety precautions should I take?"

### Categories
The system supports:
- Agriculture
- Health
- Safety

## 📚 Next Steps

1. **Upload Knowledge Documents**
   - Go to AWS S3 bucket
   - Upload PDFs to `knowledge/agriculture/`, `knowledge/health/`, etc.
   - Wait for Bedrock to index them

2. **Customize the App**
   - Edit screens in `src/screens/`
   - Modify voice button in `src/components/VoiceButton.js`
   - Update API endpoints in `src/config/api.js`

3. **Deploy to Production**
   - Follow [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
   - See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for AWS deployment

## 🆘 Need Help?

### Documentation
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Complete setup
- [backend/docs/API_DOCUMENTATION.md](backend/docs/API_DOCUMENTATION.md) - API reference
- [README_VOICE_AI.md](README_VOICE_AI.md) - Voice AI details

### Test Commands
```bash
# Backend health
curl http://localhost:3000/health

# Voice status
curl http://localhost:3000/api/voice/v2/status

# Knowledge stats
curl http://localhost:3000/api/knowledge/v2/stats

# Test voice AI
python test_setup.py
python test_api_key.py
```

### Logs
- Backend logs: Console output
- Frontend logs: Expo console
- AWS logs: CloudWatch (when deployed)

## 🎉 Success!

If you can:
- ✅ Start backend without errors
- ✅ Start frontend and see the app
- ✅ Record voice and get a response
- ✅ See knowledge-based answers

You're all set! 🚀

---

**Time to first working app: ~5 minutes**

For detailed documentation, see [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
