# Voice Pipeline Integration Guide

Complete guide for integrating voice processing with knowledge retrieval.

## Architecture

```
Mobile App (React Native)
    ↓ (sends audio)
Backend API (Node.js)
    ├─→ Transcribe audio (Nova Sonic)
    ├─→ Query Knowledge Base
    ├─→ Generate AI response
    └─→ Return response to mobile app
```

## Voice Processing Flow

### Step 1: Mobile App Sends Audio

Mobile app captures voice and sends to backend:

```javascript
// React Native Example
const sendVoiceToBackend = async (audioUri) => {
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    type: 'audio/mp3',
    name: 'voice.mp3'
  });
  formData.append('transcribedText', 'User query from transcription');
  formData.append('category', 'health');

  const response = await fetch('http://backend-api/api/voice/v2/process', {
    method: 'POST',
    body: formData
  });

  return await response.json();
};
```

### Step 2: Backend Receives Audio

Backend endpoint receives and processes:

```javascript
// POST /api/voice/v2/process
router.post('/process', upload.single('audio'), async (req, res) => {
  const { transcribedText, category } = req.body;
  const audioBuffer = req.file.buffer;

  // Process voice
  const result = await voiceController.processVoiceAudio(req, res);
});
```

### Step 3: Query Knowledge Base

Backend queries knowledge base for relevant information:

```javascript
// In voiceController.js
const knowledgeResult = await knowledgeService.retrieveKnowledge(
  transcribedText,
  category,
  5 // max results
);
```

### Step 4: Generate AI Response

Combine knowledge with AI generation:

```javascript
// In bedrockService.js
const aiResponse = await bedrockService.generateContextualResponse(
  transcribedText,
  knowledgeResult.documents
);
```

### Step 5: Return Response

Send final response back to mobile app:

```javascript
res.json({
  success: true,
  query: transcribedText,
  aiResponse: aiResponse.response,
  knowledge: {
    hasContext: true,
    sourceCount: 3,
    documents: knowledgeResult.documents
  },
  category: category
});
```

## Implementation Details

### Voice Controller

```javascript
// backend/controllers/voiceController.js

async processVoiceAudio(req, res) {
  try {
    const { audioBuffer, transcribedText, category } = req.body;

    // 1. Retrieve knowledge
    const knowledgeResult = await knowledgeService.retrieveKnowledge(
      transcribedText,
      category,
      5
    );

    // 2. Generate response with knowledge context
    const aiResponse = await bedrockService.processVoiceQuery(
      transcribedText,
      knowledgeResult.documents || []
    );

    // 3. Return combined response
    res.json({
      success: true,
      query: transcribedText,
      aiResponse: aiResponse.aiResponse,
      knowledge: {
        hasContext: aiResponse.hasKnowledgeContext,
        sourceCount: aiResponse.sourceCount,
        documents: knowledgeResult.documents || []
      },
      category: category || 'general'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

### Knowledge Service

```javascript
// backend/services/knowledgeService.js

async retrieveKnowledge(query, category = null, maxResults = 5) {
  try {
    // Add category context if provided
    const enhancedQuery = category 
      ? `[${category}] ${query}`
      : query;

    const command = new RetrieveCommand({
      knowledgeBaseId: bedrockConfig.knowledgeBaseId,
      retrievalQuery: {
        text: enhancedQuery
      },
      retrievalConfiguration: {
        vectorSearchConfiguration: {
          numberOfResults: maxResults
        }
      }
    });

    const response = await bedrockClient.send(command);
    
    // Format documents
    const documents = response.retrievalResults.map(result => ({
      content: result.content.text,
      score: result.score,
      location: result.location,
      metadata: result.metadata,
      category: this.extractCategory(result.location)
    }));

    return {
      success: true,
      query: query,
      category: category,
      documents: documents,
      count: documents.length
    };
  } catch (error) {
    throw new Error(`Failed to retrieve knowledge: ${error.message}`);
  }
}
```

### Bedrock Service

```javascript
// backend/services/bedrockService.js

async generateContextualResponse(userQuery, knowledgeContext = []) {
  try {
    // Build context string
    let contextString = '';
    if (knowledgeContext.length > 0) {
      contextString = 'Based on the following information:\n\n';
      knowledgeContext.forEach((doc, index) => {
        contextString += `[Source ${index + 1}]: ${doc.content}\n`;
      });
      contextString += '\n';
    }

    // Create prompt
    const prompt = `${contextString}User Query: ${userQuery}\n\nProvide a helpful response:`;

    // Invoke model
    const result = await this.invokeNovaModel(prompt, {
      maxTokens: 512,
      temperature: 0.5
    });

    return {
      success: true,
      response: result.response,
      hasContext: knowledgeContext.length > 0,
      sourceCount: knowledgeContext.length,
      model: result.model
    };
  } catch (error) {
    throw error;
  }
}
```

## API Endpoints

### Process Voice Audio

**POST /api/voice/v2/process**

Process voice audio with knowledge retrieval.

Request:
```bash
curl -X POST http://localhost:3000/api/voice/v2/process \
  -F "audio=@voice.mp3" \
  -F "transcribedText=How to treat fever?" \
  -F "category=health"
```

Response:
```json
{
  "success": true,
  "query": "How to treat fever?",
  "aiResponse": "For fever treatment, rest and stay hydrated. Take paracetamol as directed...",
  "knowledge": {
    "hasContext": true,
    "sourceCount": 3,
    "documents": [
      {
        "content": "Fever treatment basics...",
        "score": 0.95,
        "category": "health"
      }
    ]
  },
  "category": "health",
  "timestamp": "2026-03-10T12:00:00.000Z"
}
```

### Process Text Query

**POST /api/voice/v2/text**

Process text query (alternative to voice).

Request:
```bash
curl -X POST http://localhost:3000/api/voice/v2/text \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How to prevent crop pests?",
    "category": "agriculture"
  }'
```

Response:
```json
{
  "success": true,
  "query": "How to prevent crop pests?",
  "aiResponse": "To prevent crop pests, use integrated pest management...",
  "knowledge": {
    "hasContext": true,
    "sourceCount": 2,
    "documents": [...]
  },
  "category": "agriculture"
}
```

### Get Voice Status

**GET /api/voice/v2/status**

Get voice processing service status.

```bash
curl http://localhost:3000/api/voice/v2/status
```

Response:
```json
{
  "success": true,
  "status": "operational",
  "services": {
    "bedrock": "connected",
    "knowledge": "ready",
    "s3": "ready"
  },
  "timestamp": "2026-03-10T12:00:00.000Z"
}
```

## Mobile App Integration

### React Native Example

```javascript
import { Audio } from 'expo-av';

const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      setIsRecording(true);

      // Record for 10 seconds
      setTimeout(() => stopRecording(recording), 10000);
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopRecording = async (recording) => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);

      // Send to backend
      await sendVoiceToBackend(uri);
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  };

  const sendVoiceToBackend = async (audioUri) => {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/mp3',
        name: 'voice.mp3'
      });
      formData.append('transcribedText', 'User query');
      formData.append('category', 'health');

      const response = await fetch(
        'http://your-backend-api/api/voice/v2/process',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();
      setResponse(data);
    } catch (error) {
      console.error('Backend error:', error);
    }
  };

  return (
    <View>
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? () => {} : startRecording}
      />
      {response && (
        <Text>{response.aiResponse}</Text>
      )}
    </View>
  );
};
```

## Error Handling

### Common Errors

**1. Knowledge Base Not Found**
```javascript
{
  "success": false,
  "error": "Failed to retrieve knowledge: Knowledge base not found"
}
```

Solution: Verify KNOWLEDGE_BASE_ID in .env

**2. Bedrock Model Not Accessible**
```javascript
{
  "success": false,
  "error": "Failed to invoke Bedrock model: Access denied"
}
```

Solution: Request model access in Bedrock console

**3. S3 Bucket Not Found**
```javascript
{
  "success": false,
  "error": "Failed to upload document: Bucket not found"
}
```

Solution: Create S3 bucket and update S3_BUCKET_NAME in .env

## Performance Optimization

### Caching

Cache frequent queries:

```javascript
const cache = new Map();

async function getCachedKnowledge(query, category) {
  const key = `${query}:${category}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }

  const result = await knowledgeService.retrieveKnowledge(query, category);
  cache.set(key, result);
  
  return result;
}
```

### Parallel Processing

Process knowledge retrieval and AI generation in parallel:

```javascript
const [knowledgeResult, aiResponse] = await Promise.all([
  knowledgeService.retrieveKnowledge(query, category),
  bedrockService.invokeNovaModel(query)
]);
```

### Response Streaming

Stream responses for real-time feedback:

```javascript
res.setHeader('Content-Type', 'application/json');
res.write(JSON.stringify({ status: 'processing' }));

const result = await bedrockService.generateContextualResponse(query, docs);
res.write(JSON.stringify(result));
res.end();
```

## Testing

### Unit Tests

```javascript
describe('Voice Controller', () => {
  it('should process voice audio', async () => {
    const req = {
      body: {
        transcribedText: 'How to treat fever?',
        category: 'health'
      }
    };

    const res = {
      json: jest.fn()
    };

    await voiceController.processVoiceAudio(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        query: 'How to treat fever?'
      })
    );
  });
});
```

### Integration Tests

```javascript
describe('Voice Pipeline', () => {
  it('should retrieve knowledge and generate response', async () => {
    const response = await request(app)
      .post('/api/voice/v2/process')
      .send({
        transcribedText: 'How to treat fever?',
        category: 'health'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.aiResponse).toBeDefined();
  });
});
```

## Monitoring

### Metrics to Track

- Voice processing latency
- Knowledge retrieval time
- AI generation time
- Error rates
- Cache hit rate

### CloudWatch Logs

```javascript
console.log({
  timestamp: new Date().toISOString(),
  event: 'voice_processed',
  query: transcribedText,
  category: category,
  knowledgeSourceCount: knowledgeResult.count,
  processingTime: endTime - startTime
});
```

---

**Last Updated**: March 2026
**Version**: 2.0.0
