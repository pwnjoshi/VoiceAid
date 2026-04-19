/**
 * ConversationMemory — keeps last 20 turns for context
 * Persisted in AsyncStorage so it survives app restarts
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY      = '@voiceaid:conversation';
const MAX_TURNS = 20;

class ConversationMemory {
  constructor() {
    this.turns = []; // [{ role: 'user'|'assistant', content: string }]
    this._loaded = false;
  }

  async load() {
    if (this._loaded) return;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) this.turns = JSON.parse(raw);
    } catch {}
    this._loaded = true;
  }

  async add(role, content) {
    await this.load();
    this.turns.push({ role, content: content.trim() });
    // Keep only last MAX_TURNS
    if (this.turns.length > MAX_TURNS) {
      this.turns = this.turns.slice(-MAX_TURNS);
    }
    await this._save();
  }

  async getHistory() {
    await this.load();
    return [...this.turns];
  }

  async clear() {
    this.turns = [];
    await AsyncStorage.removeItem(KEY);
  }

  async _save() {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(this.turns));
    } catch {}
  }

  /**
   * Build a TinyLlama chat prompt with conversation history
   */
  buildPrompt(systemPrompt, userMessage) {
    let prompt = `<|system|>\n${systemPrompt}</s>\n`;

    // Add recent history (last 10 turns to keep prompt short)
    const recent = this.turns.slice(-10);
    for (const turn of recent) {
      if (turn.role === 'user') {
        prompt += `<|user|>\n${turn.content}</s>\n`;
      } else {
        prompt += `<|assistant|>\n${turn.content}</s>\n`;
      }
    }

    // Add current user message
    prompt += `<|user|>\n${userMessage}</s>\n<|assistant|>\n`;
    return prompt;
  }
}

export default new ConversationMemory();
