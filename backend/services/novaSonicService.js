/**
 * Amazon Nova Sonic Service
 * Real-time bidirectional speech-to-speech streaming
 */
const { 
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand 
} = require('@aws-sdk/client-bedrock-runtime');
const { awsConfig } = require('../config/awsConfig');

class NovaSonicService {
  constructor() {
    this.client = new BedrockRuntimeClient({
      region: awsConfig.region,
      credentials: awsConfig.credentials
    });
    
    // Nova Sonic model ARN (Preview)
    this.modelId = 'amazon.nova-sonic-v1:0';
  }

  /**
   * Stream audio input and get real-time speech response
   * @param {ReadableStream} audioStream - Input audio stream
   * @param {Object} context - Conversation context
   * @param {Function} onChunk - Callback for each audio chunk
   */
  async streamSpeechToSpeech(audioStream, context = {}, onChunk) {
    try {
      const payload = {
        audioInput: audioStream,
        conversationContext: {
          userId: context.userId,
          sessionId: context.sessionId,
          previousTurns: context.previousTurns || [],
          userProfile: {
            language: context.language || 'en',
            region: context.region,
            literacyLevel: 'low',
            ageGroup: 'elderly'
          }
        },
        responseConfig: {
          outputFormat: 'audio/pcm',
          sampleRate: 16000,
          enableInterruption: true,
          enableTurnTaking: true,
          maxLatency: 500 // milliseconds
        },
        knowledgeBaseConfig: {
          knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
          retrievalConfig: {
            maxResults: 5,
            searchType: 'SEMANTIC'
          }
        }
      };

      const command = new InvokeModelWithResponseStreamCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await this.client.send(command);
      
      // Process streaming response
      for await (const event of response.body) {
        if (event.chunk) {
          const chunk = JSON.parse(Buffer.from(event.chunk.bytes).toString());
          
          if (chunk.audioChunk) {
            // Stream audio back to client
            if (onChunk) {
              onChunk({
                type: 'audio',
                data: chunk.audioChunk,
                timestamp: chunk.timestamp
              });
            }
          }
          
          if (chunk.transcription) {
            // User speech transcription
            if (onChunk) {
              onChunk({
                type: 'transcription',
                text: chunk.transcription,
                confidence: chunk.confidence
              });
            }
          }
          
          if (chunk.intent) {
            // Detected intent
            if (onChunk) {
              onChunk({
                type: 'intent',
                intent: chunk.intent,
                slots: chunk.slots
              });
            }
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Nova Sonic streaming error:', error);
      throw error;
    }
  }

  /**
   * Process single audio input (non-streaming fallback)
   * @param {Buffer} audioBuffer - Audio data
   * @param {Object} context - Conversation context
   */
  async processSpeech(audioBuffer, context = {}) {
    try {
      const payload = {
        audioInput: audioBuffer.toString('base64'),
        conversationContext: context,
        responseConfig: {
          outputFormat: 'audio/pcm',
          sampleRate: 16000
        }
      };

      const command = new InvokeModelWithResponseStreamCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await this.client.send(command);
      
      let audioResponse = Buffer.alloc(0);
      let transcription = '';
      let intent = null;
      
      for await (const event of response.body) {
        if (event.chunk) {
          const chunk = JSON.parse(Buffer.from(event.chunk.bytes).toString());
          
          if (chunk.audioChunk) {
            const chunkBuffer = Buffer.from(chunk.audioChunk, 'base64');
            audioResponse = Buffer.concat([audioResponse, chunkBuffer]);
          }
          
          if (chunk.transcription) {
            transcription = chunk.transcription;
          }
          
          if (chunk.intent) {
            intent = chunk.intent;
          }
        }
      }
      
      return {
        audioResponse,
        transcription,
        intent,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Nova Sonic processing error:', error);
      throw error;
    }
  }
}

module.exports = new NovaSonicService();
