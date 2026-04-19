/**
 * RAGService — Retrieval-Augmented Generation on-device
 *
 * Uses the offlineKnowledge.json as the knowledge base.
 * Implements TF-IDF style scoring for fast retrieval without embeddings.
 * When TinyLlama is available, uses retrieved context to ground the response.
 *
 * Architecture:
 *   Query → tokenize → score against knowledge index → top-3 chunks
 *   → inject into LLM prompt as context → grounded answer
 */
import offlineKnowledge from '../data/offlineKnowledge.json';

class RAGService {
  constructor() {
    this.chunks = [];
    this.index  = {};
    this._built = false;
  }

  // ── Build index on first use ──────────────────────────────────────────────────
  buildIndex() {
    if (this._built) return;

    // Flatten knowledge base into chunks
    this._walkObject(offlineKnowledge, '');

    // Build inverted index: word → [chunkId, ...]
    this.chunks.forEach((chunk, id) => {
      const words = this._tokenize(chunk.text);
      words.forEach(word => {
        if (!this.index[word]) this.index[word] = [];
        if (!this.index[word].includes(id)) this.index[word].push(id);
      });
    });

    this._built = true;
    console.log(`[RAG] Index built: ${this.chunks.length} chunks`);
  }

  _walkObject(obj, path) {
    if (typeof obj === 'string' && obj.length > 20) {
      this.chunks.push({ id: this.chunks.length, path, text: obj });
    } else if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        this._walkObject(v, path ? `${path}.${k}` : k);
      }
    }
  }

  _tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w));
  }

  // ── Retrieve top-k relevant chunks ───────────────────────────────────────────
  retrieve(query, topK = 3) {
    this.buildIndex();

    const queryWords = this._tokenize(query);
    if (queryWords.length === 0) return [];

    // Score each chunk
    const scores = new Map();
    queryWords.forEach(word => {
      const hits = this.index[word] || [];
      // Also check partial matches
      Object.keys(this.index).forEach(indexWord => {
        if (indexWord.includes(word) || word.includes(indexWord)) {
          this.index[indexWord].forEach(id => {
            scores.set(id, (scores.get(id) || 0) + 1);
          });
        }
      });
      hits.forEach(id => {
        scores.set(id, (scores.get(id) || 0) + 2); // exact match bonus
      });
    });

    // Sort by score and return top-k
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([id, score]) => ({
        ...this.chunks[id],
        score,
        confidence: Math.min(score / queryWords.length, 1),
      }));
  }

  /**
   * Build a context string for LLM injection
   */
  buildContext(query) {
    const chunks = this.retrieve(query, 3);
    if (chunks.length === 0) return { context: '', confidence: 0 };

    const context = chunks
      .map((c, i) => `[${i + 1}] ${c.text}`)
      .join('\n');

    const avgConfidence = chunks.reduce((s, c) => s + c.confidence, 0) / chunks.length;

    return { context, confidence: avgConfidence, chunks };
  }

  /**
   * Direct answer without LLM — best chunk text
   */
  directAnswer(query) {
    const chunks = this.retrieve(query, 1);
    if (chunks.length === 0 || chunks[0].confidence < 0.3) {
      return { answer: null, confidence: 0 };
    }
    return { answer: chunks[0].text, confidence: chunks[0].confidence };
  }
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about',
  'against', 'between', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'from', 'up', 'down', 'out', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'and', 'but', 'or', 'nor', 'so',
  'yet', 'both', 'either', 'neither', 'not', 'only', 'own', 'same',
  'than', 'too', 'very', 'just', 'because', 'as', 'until', 'while',
  'if', 'how', 'what', 'when', 'where', 'who', 'which', 'that', 'this',
  'these', 'those', 'it', 'its', 'you', 'your', 'he', 'she', 'they',
  'we', 'my', 'our', 'their', 'him', 'her', 'them', 'me', 'us',
]);

export default new RAGService();
