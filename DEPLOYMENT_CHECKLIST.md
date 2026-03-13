# VoiceAid Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Add AWS Access Key ID
- [ ] Add AWS Secret Access Key
- [ ] Set AWS Region (default: us-east-1)
- [ ] Add S3 Bucket Name
- [ ] Add Bedrock Knowledge Base ID
- [ ] Add Groq API Key
- [ ] Set PORT for backend (default: 3000)

### 2. AWS Setup
- [ ] Create S3 bucket: `voiceaid-knowledge-docs`
- [ ] Set up folder structure in S3:
  - `knowledge/agriculture/`
  - `knowledge/health/`
  - `knowledge/safety/`
- [ ] Upload initial knowledge documents
- [ ] Create AWS Bedrock Knowledge Base
- [ ] Connect Knowledge Base to S3 bucket
- [ ] Configure IAM user with required permissions:
  - S3: GetObject, PutObject, ListBucket
  - Bedrock: InvokeModel, Retrieve
- [ ] Test AWS credentials

### 3. Backend Setup
- [ ] Install Node.js dependencies: `cd backend && npm install`
- [ ] Test backend locally: `npm start`
- [ ] Verify health endpoint: `curl http://localhost:3000/health`
- [ ] Test voice endpoints
- [ ] Test knowledge endpoints
- [ ] Run backend tests: `npm test`

### 4. Voice AI Setup
- [ ] Install Python dependencies: `pip install -r requirements.txt`
- [ ] Copy `config.example.py` to `config.py`
- [ ] Add Groq API key to `config.py`
- [ ] Test API key: `python test_api_key.py`
- [ ] Test setup: `python test_setup.py`
- [ ] Verify voice transcription works

### 5. Frontend Setup
- [ ] Install dependencies: `npm install`
- [ ] Update API URL in `src/config/api.js`
- [ ] Test Expo app: `npx expo start`
- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator
- [ ] Verify voice recording works
- [ ] Verify API communication works
- [ ] Test audio playback

### 6. Integration Testing
- [ ] Test complete voice flow:
  - Record audio
  - Send to backend
  - Receive transcription
  - Get knowledge-based response
  - Play response audio
- [ ] Test text query flow
- [ ] Test knowledge base queries
- [ ] Test document upload
- [ ] Verify error handling
- [ ] Test with different categories (agriculture, health, safety)

### 7. Security
- [ ] Ensure `.env` is in `.gitignore`
- [ ] Ensure `config.py` is in `.gitignore`
- [ ] Remove any hardcoded API keys
- [ ] Verify AWS credentials are not exposed
- [ ] Set up CORS properly in backend
- [ ] Enable HTTPS for production
- [ ] Review IAM permissions (principle of least privilege)

### 8. Performance
- [ ] Test with large audio files
- [ ] Test with multiple concurrent requests
- [ ] Monitor AWS costs
- [ ] Set up CloudWatch monitoring
- [ ] Configure logging levels
- [ ] Test response times

### 9. Documentation
- [ ] Review README.md
- [ ] Review INTEGRATION_GUIDE.md
- [ ] Update API documentation
- [ ] Document any custom configurations
- [ ] Create user guide for caretakers
- [ ] Document troubleshooting steps

### 10. Production Deployment

#### Backend Deployment (AWS)
- [ ] Set up EC2 instance or Elastic Beanstalk
- [ ] Configure environment variables
- [ ] Set up load balancer (if needed)
- [ ] Configure auto-scaling
- [ ] Set up CloudWatch alarms
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Deploy backend
- [ ] Verify deployment

#### Frontend Deployment
- [ ] Build production app: `npx expo build`
- [ ] Test production build
- [ ] Submit to App Store (iOS)
- [ ] Submit to Play Store (Android)
- [ ] Configure app signing
- [ ] Set up crash reporting
- [ ] Configure analytics

### 11. Post-Deployment
- [ ] Monitor error logs
- [ ] Check CloudWatch metrics
- [ ] Verify all endpoints working
- [ ] Test from production app
- [ ] Monitor AWS costs
- [ ] Set up alerts for errors
- [ ] Create backup of knowledge base
- [ ] Document any issues found

## 🚨 Critical Items

These MUST be completed before production:
1. All API keys and credentials properly secured
2. AWS IAM permissions configured correctly
3. HTTPS enabled for all API endpoints
4. Error handling and logging in place
5. Backup strategy for knowledge base
6. Monitoring and alerting configured

## 📝 Environment Variables Reference

### Backend (.env)
```
PORT=3000
NODE_ENV=production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=voiceaid-knowledge-docs
KNOWLEDGE_BASE_ID=your_kb_id
```

### Voice AI (config.py)
```python
GROQ_API_KEY = "your_groq_api_key"
```

### Frontend
```
EXPO_PUBLIC_API_URL=https://your-production-api.com
```

## 🔗 Useful Commands

### Backend
```bash
# Install dependencies
cd backend && npm install

# Start development
npm start

# Run tests
npm test

# Deploy to AWS
npm run deploy
```

### Voice AI
```bash
# Install dependencies
pip install -r requirements.txt

# Test setup
python test_setup.py

# Test API key
python test_api_key.py
```

### Frontend
```bash
# Install dependencies
npm install

# Start development
npx expo start

# Build for production
npx expo build:android
npx expo build:ios
```

## 📞 Support

For issues during deployment:
1. Check logs in `backend/logs/`
2. Review CloudWatch logs
3. Check AWS service health
4. Verify all environment variables
5. Test each component individually

## 🎉 Success Criteria

Deployment is successful when:
- [ ] Backend health check returns 200
- [ ] Voice processing works end-to-end
- [ ] Knowledge base queries return results
- [ ] Mobile app can record and play audio
- [ ] All AWS services are operational
- [ ] No errors in logs
- [ ] Response times are acceptable
- [ ] Costs are within budget

---

Last Updated: March 13, 2026
