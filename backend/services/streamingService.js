/**
 * WebSocket Streaming Service
 * Enables real-time bidirectional audio streaming
 */
const WebSocket = require('ws');
const novaSonicService = require('./novaSonicService');
const lexService = require('./lexService');

class StreamingService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server, path: '/stream' });
    this.sessions = new Map();
    
    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('✅ WebSocket streaming service initialized');
  }

  handleConnection(ws, req) {
    const sessionId = this.generateSessionId();
    console.log(`[Stream] New connection: ${sessionId}`);
    
    const session = {
      id: sessionId,
      ws: ws,
      audioBuffer: Buffer.alloc(0),
      context: {},
      isStreaming: false
    };
    
    this.sessions.set(sessionId, session);
    
    // Send session ID to client
    ws.send(JSON.stringify({
      type: 'session',
      sessionId: sessionId
    }));
    
    ws.on('message', (data) => this.handleMessage(sessionId, data));
    ws.on('close', () => this.handleClose(sessionId));
    ws.on('error', (error) => this.handleError(sessionId, error));
  }

  async handleMessage(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    try {
      // Check if binary audio data or JSON message
      if (Buffer.isBuffer(data)) {
        await this.handleAudioChunk(session, data);
      } else {
        const message = JSON.parse(data.toString());
        await this.handleControlMessage(session, message);
      }
    } catch (error) {
      console.error(`[Stream] Error handling message:`, error);
      session.ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  }

  async handleAudioChunk(session, audioData) {
    // Accumulate audio data
    session.audioBuffer = Buffer.concat([session.audioBuffer, audioData]);
    
    // If streaming mode, process immediately
    if (session.isStreaming) {
      await this.processStreamingAudio(session, audioData);
    }
  }

  async handleControlMessage(session, message) {
    switch (message.type) {
      case 'start':
        session.isStreaming = true;
        session.context = message.context || {};
        session.audioBuffer = Buffer.alloc(0);
        
        session.ws.send(JSON.stringify({
          type: 'started',
          sessionId: session.id
        }));
        break;
        
      case 'stop':
        session.isStreaming = false;
        
        // Process accumulated audio
        if (session.audioBuffer.length > 0) {
          await this.processCompleteAudio(session);
        }
        break;
        
      case 'context':
        session.context = { ...session.context, ...message.data };
        break;
        
      default:
        console.warn(`[Stream] Unknown message type: ${message.type}`);
    }
  }

  async processStreamingAudio(session, audioChunk) {
    try {
      // Use Nova Sonic for real-time processing
      await novaSonicService.streamSpeechToSpeech(
        audioChunk,
        session.context,
        (chunk) => {
          // Stream response back to client
          session.ws.send(JSON.stringify(chunk));
        }
      );
    } catch (error) {
      console.error('[Stream] Streaming processing error:', error);
      session.ws.send(JSON.stringify({
        type: 'error',
        error: 'Streaming processing failed'
      }));
    }
  }

  async processCompleteAudio(session) {
    try {
      // Process complete audio with Nova Sonic
      const result = await novaSonicService.processSpeech(
        session.audioBuffer,
        session.context
      );
      
      // Get intent from Lex
      const lexResult = await lexService.recognizeText(
        result.transcription,
        session.id,
        lexService.buildSessionState(session.context.userId, session.context)
      );
      
      // Send complete response
      session.ws.send(JSON.stringify({
        type: 'complete',
        transcription: result.transcription,
        intent: lexResult.intent,
        slots: lexResult.slots,
        audioResponse: result.audioResponse.toString('base64')
      }));
      
      // Clear buffer
      session.audioBuffer = Buffer.alloc(0);
    } catch (error) {
      console.error('[Stream] Complete audio processing error:', error);
      session.ws.send(JSON.stringify({
        type: 'error',
        error: 'Audio processing failed'
      }));
    }
  }

  handleClose(sessionId) {
    console.log(`[Stream] Connection closed: ${sessionId}`);
    this.sessions.delete(sessionId);
  }

  handleError(sessionId, error) {
    console.error(`[Stream] WebSocket error for ${sessionId}:`, error);
    this.sessions.delete(sessionId);
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = StreamingService;
