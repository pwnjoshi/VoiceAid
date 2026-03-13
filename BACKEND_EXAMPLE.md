# Backend API Example

## Required Endpoint

Your backend must implement this endpoint:

### POST /voice

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Audio file with field name `audio`

**Response:**
- Content-Type: `audio/m4a` or `audio/mp4`
- Body: Audio file (AI-generated response)

---

## Example Implementation (Node.js + Express)

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// POST /voice endpoint
app.post('/voice', upload.single('audio'), async (req, res) => {
  try {
    // 1. Get the uploaded audio file
    const audioFile = req.file;
    console.log('Received audio:', audioFile.originalname);

    // 2. Process with your AI system
    // TODO: Replace with your actual AI processing
    const aiResponsePath = await processWithAI(audioFile.path);

    // 3. Send the AI audio response back
    res.sendFile(path.resolve(aiResponsePath));

    // 4. Cleanup uploaded file
    fs.unlinkSync(audioFile.path);
  } catch (error) {
    console.error('Error processing voice:', error);
    res.status(500).json({ error: 'Failed to process voice message' });
  }
});

// Your AI processing function
async function processWithAI(audioPath) {
  // TODO: Implement your AI logic here
  // 1. Convert audio to text (Speech-to-Text)
  // 2. Send text to AI model
  // 3. Get AI response text
  // 4. Convert text to audio (Text-to-Speech)
  // 5. Return audio file path
  
  // Example placeholder:
  return './responses/ai_response.m4a';
}

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
```

---

## Example with Python + Flask

```python
from flask import Flask, request, send_file
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/voice', methods=['POST'])
def voice():
    try:
        # 1. Get uploaded audio file
        audio_file = request.files['audio']
        audio_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
        audio_file.save(audio_path)
        
        # 2. Process with AI
        response_path = process_with_ai(audio_path)
        
        # 3. Send AI response
        return send_file(response_path, mimetype='audio/m4a')
        
    except Exception as e:
        return {'error': str(e)}, 500

def process_with_ai(audio_path):
    # TODO: Implement your AI logic
    # 1. Speech-to-Text
    # 2. AI processing
    # 3. Text-to-Speech
    # 4. Return audio file path
    return 'responses/ai_response.m4a'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
```

---

## Testing the Backend

### Using curl:
```bash
curl -X POST \
  -F "audio=@test_audio.m4a" \
  http://localhost:3000/voice \
  --output response.m4a
```

### Using Postman:
1. Create POST request to `http://localhost:3000/voice`
2. Body → form-data
3. Key: `audio` (type: File)
4. Value: Select an audio file
5. Send

---

## AI Integration Examples

### OpenAI Whisper + GPT + TTS

```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function processWithAI(audioPath) {
  // 1. Speech to Text (Whisper)
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: 'whisper-1',
  });
  
  // 2. AI Response (GPT)
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: transcription.text }],
  });
  
  // 3. Text to Speech
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: completion.choices[0].message.content,
  });
  
  // 4. Save and return
  const buffer = Buffer.from(await mp3.arrayBuffer());
  const outputPath = './responses/response.mp3';
  fs.writeFileSync(outputPath, buffer);
  
  return outputPath;
}
```

### Google Cloud Speech + Dialogflow + TTS

```python
from google.cloud import speech, texttospeech
import dialogflow_v2 as dialogflow

def process_with_ai(audio_path):
    # 1. Speech to Text
    client = speech.SpeechClient()
    with open(audio_path, 'rb') as audio_file:
        content = audio_file.read()
    
    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(language_code='en-US')
    response = client.recognize(config=config, audio=audio)
    text = response.results[0].alternatives[0].transcript
    
    # 2. Dialogflow AI
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path('PROJECT_ID', 'SESSION_ID')
    text_input = dialogflow.TextInput(text=text, language_code='en-US')
    query_input = dialogflow.QueryInput(text=text_input)
    response = session_client.detect_intent(session=session, query_input=query_input)
    ai_text = response.query_result.fulfillment_text
    
    # 3. Text to Speech
    tts_client = texttospeech.TextToSpeechClient()
    synthesis_input = texttospeech.SynthesisInput(text=ai_text)
    voice = texttospeech.VoiceSelectionParams(language_code='en-US')
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
    response = tts_client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)
    
    # 4. Save and return
    output_path = 'responses/response.mp3'
    with open(output_path, 'wb') as out:
        out.write(response.audio_content)
    
    return output_path
```

---

## Environment Variables

Create `.env` file:
```
OPENAI_API_KEY=your_key_here
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
PORT=3000
```

---

## CORS Configuration (if needed)

```javascript
const cors = require('cors');
app.use(cors());
```

---

## Production Deployment

- Use HTTPS (required for mobile apps)
- Add authentication/API keys
- Implement rate limiting
- Add logging and monitoring
- Use cloud storage for audio files
- Implement queue system for processing
