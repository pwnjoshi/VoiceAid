/**
 * StreamingAudioService
 *
 * Connects to the backend WebSocket at /stream.
 * Sends the device STT transcript as a text message and receives
 * the AI response back in real-time.
 *
 * Audio recording is handled by @react-native-voice/voice on the device.
 * This service handles the WebSocket communication layer.
 */
import { API_BASE_URL } from '../config/api';

const WS_TIMEOUT_MS = 10000;

class StreamingAudioService {
  constructor() {
    this.ws        = null;
    this.sessionId = null;
    this.connected = false;

    // Callbacks set by consumer
    this.onTranscription = null;
    this.onComplete      = null;
    this.onError         = null;
  }

  // ── Connect ────────────────────────────────────────────────────────────────
  connect(context = {}) {
    return new Promise((resolve, reject) => {
      const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/stream';

      try {
        this.ws = new WebSocket(wsUrl);
      } catch (err) {
        reject(new Error(`WebSocket connect failed: ${err.message}`));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timed out'));
        this.disconnect();
      }, WS_TIMEOUT_MS);

      this.ws.onopen = () => {
        this.connected = true;
        console.log('[Stream] Connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this._handleMessage(msg, resolve, context);
        } catch (e) {
          console.warn('[Stream] Bad message:', e.message);
        }
      };

      this.ws.onerror = (err) => {
        clearTimeout(timeout);
        this.connected = false;
        reject(new Error('WebSocket error'));
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.sessionId = null;
      };

      // Store timeout ref so we can clear it in _handleMessage
      this._connectTimeout = timeout;
    });
  }

  _handleMessage(msg, resolveConnect, context) {
    switch (msg.type) {
      case 'session':
        this.sessionId = msg.sessionId;
        clearTimeout(this._connectTimeout);
        resolveConnect?.(this.sessionId);
        break;

      case 'transcription':
        this.onTranscription?.(msg.text, msg.confidence);
        break;

      case 'complete':
        this.onComplete?.({
          transcription: msg.transcription,
          textResponse:  msg.textResponse,
          intent:        msg.intent,
          source:        msg.source,
        });
        break;

      case 'error':
        console.error('[Stream] Server error:', msg.error);
        this.onError?.(msg.error);
        break;
    }
  }

  // ── Send transcript as text query ──────────────────────────────────────────
  sendText(query, language = 'en') {
    if (!this.connected || !this.ws) {
      throw new Error('Not connected');
    }
    this.ws.send(JSON.stringify({ type: 'text', query, language }));
  }

  // ── Disconnect ─────────────────────────────────────────────────────────────
  disconnect() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this.connected = false;
    this.sessionId = null;
  }

  isConnected() {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }
}

export default new StreamingAudioService();
