/**
 * Enhanced Offline Service
 * Uses local knowledge base for detailed responses
 * Works completely offline with no API dependencies
 */
import offlineKnowledge from '../data/offlineKnowledge.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

class EnhancedOfflineService {
  constructor() {
    this.knowledge = offlineKnowledge || {};
    try {
      this.searchIndex = this.buildSearchIndex();
    } catch (e) {
      console.warn('EnhancedOfflineService: index build failed', e);
      this.searchIndex = {};
    }
  }

  /**
   * Build search index for faster lookups
   */
  buildSearchIndex() {
    const index = {};
    
    const indexContent = (path, content, keywords) => {
      keywords.forEach(keyword => {
        const key = keyword.toLowerCase();
        if (!index[key]) {
          index[key] = [];
        }
        index[key].push({ path, content });
      });
    };

    // Index agriculture
    const crops = this.knowledge.agriculture?.crops || {};
    Object.entries(crops).forEach(([crop, data]) => {
      if (!data || typeof data !== 'object') return;
      Object.entries(data).forEach(([topic, content]) => {
        if (typeof content !== 'string') return;
        indexContent(
          `agriculture.crops.${crop}.${topic}`,
          content,
          [crop, topic, 'farming', 'agriculture', 'crop']
        );
      });
    });

    // Index health
    const ailments = this.knowledge.health?.common_ailments || {};
    Object.entries(ailments).forEach(([ailment, data]) => {
      if (!data || typeof data !== 'object') return;
      Object.entries(data).forEach(([key, content]) => {
        if (typeof content !== 'string') return;
        indexContent(
          `health.common_ailments.${ailment}.${key}`,
          content,
          [ailment, key, 'health', 'medicine', 'doctor']
        );
      });
    });

    // Index safety
    const fraud = this.knowledge.safety?.fraud_awareness || {};
    Object.entries(fraud).forEach(([type, content]) => {
      if (typeof content !== 'string') return;
      indexContent(
        `safety.fraud_awareness.${type}`,
        content,
        [type, 'fraud', 'scam', 'safety', 'security']
      );
    });

    return index;
  }

  /**
   * Search knowledge base
   * @param {string} query - User query
   * @returns {Object} Best matching response
   */
  async search(query) {
    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(' ').filter(w => w.length > 2);
    
    // Score each indexed item
    const scores = {};
    
    words.forEach(word => {
      Object.entries(this.searchIndex).forEach(([keyword, items]) => {
        if (keyword.includes(word) || word.includes(keyword)) {
          items.forEach(item => {
            const key = item.path;
            scores[key] = (scores[key] || 0) + 1;
          });
        }
      });
    });

    // Get best match
    const bestMatch = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];

    if (bestMatch) {
      const [path, score] = bestMatch;
      const content = this.getContentByPath(path);
      
      return {
        success: true,
        response: content,
        path,
        confidence: Math.min(score / words.length, 1),
        source: 'offline-knowledge-base'
      };
    }

    return this.getFallbackResponse(query);
  }

  /**
   * Get content by path
   */
  getContentByPath(path) {
    const parts = path.split('.');
    let current = this.knowledge;
    
    for (const part of parts) {
      current = current[part];
      if (!current) return null;
    }
    
    return current;
  }

  /**
   * Get fallback response
   */
  getFallbackResponse(query) {
    const category = this.detectCategory(query);
    
    const fallbacks = {
      agriculture: "I can help with farming questions. Ask me about planting, pests, fertilizers, or harvesting for crops like rice, wheat, or corn.",
      health: "I can help with health questions. Ask me about common ailments like fever, cough, stomach pain, or headache. I can also tell you about basic medicines and first aid.",
      safety: "I can help with safety information. Ask me about fraud awareness, emergency numbers, or home safety tips.",
      general: "I'm here to help! You can ask me about:\n• Farming and crops 🌾\n• Health and medicines 💊\n• Safety and fraud awareness 🛡️\n• Daily living tips 📅"
    };

    return {
      success: true,
      response: fallbacks[category] || fallbacks.general,
      confidence: 0.3,
      source: 'fallback'
    };
  }

  /**
   * Detect query category
   */
  detectCategory(query) {
    const lower = query.toLowerCase();
    
    if (/crop|farm|plant|pest|soil|fertilizer|harvest|rice|wheat|corn/.test(lower)) {
      return 'agriculture';
    }
    if (/fever|pain|sick|medicine|doctor|health|cough|cold|headache/.test(lower)) {
      return 'health';
    }
    if (/fraud|scam|otp|safety|emergency|police|fire/.test(lower)) {
      return 'safety';
    }
    
    return 'general';
  }

  /**
   * Get specific information
   */
  async getAgricultureInfo(crop, topic) {
    const info = this.knowledge.agriculture.crops[crop]?.[topic];
    if (info) {
      return {
        success: true,
        response: info,
        crop,
        topic
      };
    }
    return { success: false, error: 'Information not found' };
  }

  async getHealthInfo(ailment, aspect = 'home_treatment') {
    const info = this.knowledge.health.common_ailments[ailment]?.[aspect];
    if (info) {
      return {
        success: true,
        response: info,
        ailment,
        aspect
      };
    }
    return { success: false, error: 'Information not found' };
  }

  async getSafetyInfo(type) {
    const info = this.knowledge.safety.fraud_awareness[type];
    if (info) {
      return {
        success: true,
        response: info,
        type
      };
    }
    return { success: false, error: 'Information not found' };
  }

  /**
   * Get emergency numbers
   */
  async getEmergencyNumbers() {
    return {
      success: true,
      numbers: this.knowledge.safety.emergency_numbers,
      response: this.formatEmergencyNumbers()
    };
  }

  formatEmergencyNumbers() {
    const numbers = this.knowledge.safety.emergency_numbers;
    return Object.entries(numbers)
      .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
      .join('\n\n');
  }

  /**
   * Get all available crops
   */
  getAvailableCrops() {
    return Object.keys(this.knowledge.agriculture.crops);
  }

  /**
   * Get all health topics
   */
  getHealthTopics() {
    return Object.keys(this.knowledge.health.common_ailments);
  }

  /**
   * Save user query for learning
   */
  async saveQuery(query, response, helpful = null) {
    try {
      const history = await AsyncStorage.getItem('query_history') || '[]';
      const queries = JSON.parse(history);
      
      queries.push({
        query,
        response: response.response,
        confidence: response.confidence,
        helpful,
        timestamp: new Date().toISOString()
      });

      // Keep last 100 queries
      const trimmed = queries.slice(-100);
      await AsyncStorage.setItem('query_history', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save query:', error);
    }
  }

  /**
   * Get query statistics
   */
  async getStatistics() {
    try {
      const history = await AsyncStorage.getItem('query_history') || '[]';
      const queries = JSON.parse(history);
      
      const categories = {};
      queries.forEach(q => {
        const category = this.detectCategory(q.query);
        categories[category] = (categories[category] || 0) + 1;
      });

      return {
        totalQueries: queries.length,
        categories,
        averageConfidence: queries.reduce((sum, q) => sum + q.confidence, 0) / queries.length || 0,
        helpfulResponses: queries.filter(q => q.helpful === true).length
      };
    } catch (error) {
      return { totalQueries: 0, categories: {}, averageConfidence: 0 };
    }
  }
}

export default new EnhancedOfflineService();
