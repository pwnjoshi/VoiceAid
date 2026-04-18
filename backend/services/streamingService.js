/**
 * StreamingService — WebSocket server for real-time voice processing
 *
 * Protocol:
 *   Client → Server:
 *     { type: 'start', context: { language, userId } }
 *     <binary audio chunks>
 *     { type: 'stop' }
 *
 *   Server → Client:
 *     { type: 'session', sessionId }
 *     { type: 'started' }
 *     { type: 'transcription', text, confidence }   (if STT available)
 *     { type: 'complete', transcription, textResponse, intent }
 *     { type: 'error', error }
 */
const WebSocket = require('ws');

// Lazy-load to avoid crash if AWS not configured
let novaSonicService = null;
let lexService       = null;
let bedrockService   = null;

function getNovaSonic()  { if (!novaSonicService) { try { novaSonicService = require('./novaSonicService'); } catch {} } return novaSonicService; }
function getLex()        { if (!lexService)        { try { lexService       = require('./lexService');       } catch {} } return lexService; }
function getBedrock()    { if (!bedrockService)    { try { bedrockService   = require('./bedrockService');   } catch {} } return bedrockService; }

class StreamingService {
  constructor(server) {
    this.wss      = new WebSocket.Server({ server, path: '/stream' });
    this.sessions = new Map();
    this.wss.on('connection', this._onConnection.bind(this));
    console.log('✅ WebSocket streaming service ready at /stream');
  }

  _onConnection(ws, req) {
    const sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const session = {
      id:          sessionId,
      ws,
      audioChunks: [],
      context:     {},
      active:      false,
    };
    this.sessions.set(sessionId, session);

    ws.send(JSON.stringify({ type: 'session', sessionId }));

    ws.on('message', (data) => this._onMessage(session, data));
    ws.on('close',   () => this.sessions.delete(sessionId));
    ws.on('error',   (err) => {
      console.error(`[WS ${sessionId}] error:`, err.message);
      this.sessions.delete(sessionId);
    });
  }

  async _onMessage(session, data) {
    try {
      if (Buffer.isBuffer(data) && session.active) {
        // Binary audio chunk — accumulate
        session.audioChunks.push(data);
        return;
      }

      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'start':
          session.active      = true;
          session.audioChunks = [];
          session.context     = msg.context || {};
          session.ws.send(JSON.stringify({ type: 'started', sessionId: session.id }));
          break;

        case 'stop':
          session.active = false;
          await this._processSession(session);
          break;

        case 'text': {
          // Direct text query (no audio) — used when device STT provides transcript
          const { query, language } = msg;
          if (!query) break;
          const result = await this._answerText(query, language || 'en', session.context);
          session.ws.send(JSON.stringify({
            type:         'complete',
            transcription: query,
            textResponse:  result.response,
            intent:        result.intent || null,
            source:        result.source,
          }));
          break;
        }

        default:
          console.warn(`[WS] Unknown message type: ${msg.type}`);
      }
    } catch (err) {
      console.error('[WS] Message handling error:', err.message);
      session.ws.send(JSON.stringify({ type: 'error', error: err.message }));
    }
  }

  async _processSession(session) {
    if (session.audioChunks.length === 0) {
      session.ws.send(JSON.stringify({ type: 'error', error: 'No audio received' }));
      return;
    }

    const audioBuffer = Buffer.concat(session.audioChunks);
    session.audioChunks = [];

    try {
      const ns = getNovaSonic();
      if (ns) {
        const result = await ns.processSpeech(audioBuffer, session.context);
        session.ws.send(JSON.stringify({
          type:          'complete',
          transcription: result.transcription || '',
          textResponse:  result.textResponse  || '',
          source:        result.source || 'nova-sonic',
        }));
      } else {
        session.ws.send(JSON.stringify({
          type:  'error',
          error: 'Audio processing not available. Use text mode.',
        }));
      }
    } catch (err) {
      console.error('[WS] Audio processing error:', err.message);
      session.ws.send(JSON.stringify({ type: 'error', error: 'Audio processing failed' }));
    }
  }

  async _answerText(query, language, context) {
    // 1. Try Lex for intent detection
    let intent = null;
    const lex = getLex();
    if (lex && process.env.LEX_BOT_ID) {
      try {
        const lexResult = await lex.recognizeText(query, context.userId || 'anon', {});
        intent = lexResult.intent;
      } catch (e) {
        console.warn('[WS] Lex failed:', e.message);
      }
    }

    // 2. Generate response via Bedrock
    const bedrock = getBedrock();
    if (bedrock) {
      try {
        const result = await bedrock.generateResponse(query, []);
        return { response: result.response, intent, source: 'bedrock' };
      } catch (e) {
        console.warn('[WS] Bedrock failed:', e.message);
      }
    }

    return { response: 'Service temporarily unavailable. Please try again.', intent, source: 'error' };
  }
}

module.exports = StreamingService;
