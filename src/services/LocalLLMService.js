/**
 * LocalLLMService — TinyLlama 1.1B on-device via llama.rn
 *
 * Key optimizations for speed:
 * 1. Streaming generation — speak first sentence while rest generates
 * 2. Reduced n_predict (80 tokens max — enough for 2-3 sentences)
 * 3. Conversation memory via ConversationMemory
 * 4. Sentence-boundary detection for natural TTS chunking
 */
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConversationMemory from './ConversationMemory';

const MODEL_FILENAME  = 'tinyllama.gguf';
const MODEL_URL       = 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf';
const LLM_ENABLED_KEY = '@voiceaid:llm_enabled';

const SYSTEM_PROMPT = `You are VoiceAid, a friendly voice assistant for rural communities.
Keep answers SHORT — maximum 2 sentences.
Use simple everyday words. No lists, no bullet points.
Speak naturally as if talking to a friend.
Remember what was said earlier in the conversation.`;

// Lazy-load llama.rn
let initLlama = null;
let releaseAllLlama = null;
try {
  const r = require('llama.rn');
  initLlama = r.initLlama;
  releaseAllLlama = r.releaseAllLlama;
} catch (e) {
  console.warn('[LLM] llama.rn not available:', e.message);
}

class LocalLLMService {
  constructor() {
    this.context        = null;
    this.isLoading      = false;
    this.isReady        = false;
    this.isEnabled      = true;
    this.onProgress     = null;
    this.onStatusChange = null;
  }

  getModelPath() {
    return `${FileSystem.documentDirectory}${MODEL_FILENAME}`;
  }

  async isModelDownloaded() {
    try {
      const info = await FileSystem.getInfoAsync(this.getModelPath());
      return info.exists && (info.size || 0) > 100_000_000;
    } catch { return false; }
  }

  async loadPreference() {
    try {
      const val = await AsyncStorage.getItem(LLM_ENABLED_KEY);
      this.isEnabled = val !== 'false';
    } catch {}
  }

  async setEnabled(enabled) {
    this.isEnabled = enabled;
    await AsyncStorage.setItem(LLM_ENABLED_KEY, String(enabled));
    if (!enabled && this.isReady) await this.release();
  }

  // ── Download ──────────────────────────────────────────────────────────────────
  async downloadModel(onProgress) {
    const path = this.getModelPath();
    this._setStatus('Downloading TinyLlama (~600MB)...');

    const dl = FileSystem.createDownloadResumable(
      MODEL_URL, path, {},
      (p) => {
        const pct = p.totalBytesExpectedToWrite > 0
          ? Math.round((p.totalBytesWritten / p.totalBytesExpectedToWrite) * 100)
          : 0;
        onProgress?.(pct);
        this.onProgress?.(pct);
      }
    );

    const result = await dl.downloadAsync();
    if (!result?.uri) throw new Error('Download failed');
    return result.uri;
  }

  // ── Initialize ────────────────────────────────────────────────────────────────
  async initialize(onProgress) {
    if (!initLlama) return false;
    if (this.isReady) return true;
    if (this.isLoading || !this.isEnabled) return false;

    this.isLoading = true;
    try {
      if (!(await this.isModelDownloaded())) {
        await this.downloadModel(onProgress);
      }

      this._setStatus('Loading model...');
      this.context = await initLlama({
        model:        this.getModelPath(),
        use_mlock:    false,
        n_ctx:        1024,   // smaller context = faster
        n_batch:      256,
        n_threads:    4,
        n_gpu_layers: 0,
      });

      this.isReady = true;
      this._setStatus('TinyLlama ready');
      return true;
    } catch (err) {
      console.error('[LLM] Init failed:', err);
      this.isReady = false;
      this._setStatus('Load failed');
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Generate with streaming — calls onSentence() as each sentence completes.
   * This allows TTS to start speaking the first sentence while the rest generates.
   *
   * @param {string} userMessage
   * @param {function} onSentence  — called with each complete sentence
   * @returns {string} full response
   */
  async generateStreaming(userMessage, onSentence) {
    if (!this.isReady || !this.context) throw new Error('Model not ready');

    // Load conversation history
    const prompt = ConversationMemory.buildPrompt(SYSTEM_PROMPT, userMessage);

    let buffer = '';
    let fullResponse = '';
    const sentenceEnders = /[.!?।]/; // includes Hindi danda

    await this.context.completion(
      {
        prompt,
        n_predict:   80,    // ~2 sentences max — fast response
        temperature: 0.75,
        top_p:       0.9,
        top_k:       40,
        repeat_penalty: 1.1,
        stop: ['</s>', '<|user|>', '<|system|>', '\n\n'],
      },
      (data) => {
        if (!data.token) return;
        buffer += data.token;
        fullResponse += data.token;

        // Check if we have a complete sentence
        const match = buffer.match(/^(.*?[.!?।])\s*/s);
        if (match) {
          const sentence = match[1].trim();
          if (sentence.length > 8) {
            onSentence?.(sentence);
            buffer = buffer.slice(match[0].length);
          }
        }
      }
    );

    // Flush any remaining text
    const remaining = buffer.trim();
    if (remaining.length > 4) {
      onSentence?.(remaining);
    }

    const clean = fullResponse.trim();

    // Save to conversation memory
    await ConversationMemory.add('user', userMessage);
    await ConversationMemory.add('assistant', clean);

    return clean;
  }

  /**
   * Simple generate (no streaming) — for non-voice use
   */
  async generate(userMessage) {
    let full = '';
    await this.generateStreaming(userMessage, (s) => { full += s + ' '; });
    return full.trim();
  }

  async release() {
    if (this.context && releaseAllLlama) {
      await releaseAllLlama();
      this.context = null;
      this.isReady = false;
      this._setStatus('Released');
    }
  }

  async deleteModel() {
    await this.release();
    try {
      await FileSystem.deleteAsync(this.getModelPath(), { idempotent: true });
    } catch {}
  }

  async getModelInfo() {
    const path = this.getModelPath();
    try {
      const info = await FileSystem.getInfoAsync(path);
      return {
        downloaded: info.exists && (info.size || 0) > 100_000_000,
        sizeMB:     info.exists ? Math.round((info.size || 0) / 1_000_000) : 0,
        isReady:    this.isReady,
        isEnabled:  this.isEnabled,
        isLoading:  this.isLoading,
        path,
      };
    } catch {
      return { downloaded: false, sizeMB: 0, isReady: false, isEnabled: this.isEnabled, isLoading: false, path };
    }
  }

  _setStatus(msg) { this.onStatusChange?.(msg); }
}

export default new LocalLLMService();
