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

    // Index agriculture crops
    const crops = this.knowledge.agriculture?.crops || {};
    Object.entries(crops).forEach(([crop, data]) => {
      if (!data || typeof data !== 'object') return;
      Object.entries(data).forEach(([topic, content]) => {
        if (typeof content !== 'string') return;
        indexContent(
          `agriculture.crops.${crop}.${topic}`,
          content,
          [crop, topic, 'farming', 'agriculture', 'crop', 'field']
        );
      });
    });

    // Index agriculture general
    const agriGeneral = this.knowledge.agriculture?.general || {};
    Object.entries(agriGeneral).forEach(([topic, content]) => {
      if (typeof content !== 'string') return;
      indexContent(
        `agriculture.general.${topic}`,
        content,
        [topic, 'farming', 'agriculture', 'soil', 'crop']
      );
    });

    // Index health ailments
    const ailments = this.knowledge.health?.common_ailments || {};
    Object.entries(ailments).forEach(([ailment, data]) => {
      if (!data || typeof data !== 'object') return;
      Object.entries(data).forEach(([key, content]) => {
        if (typeof content !== 'string') return;
        indexContent(
          `health.common_ailments.${ailment}.${key}`,
          content,
          [ailment, key, 'health', 'medicine', 'doctor', 'treatment', 'symptoms']
        );
      });
    });

    // Index health medicines
    const medicines = this.knowledge.health?.medicines || {};
    Object.entries(medicines).forEach(([med, data]) => {
      if (!data || typeof data !== 'object') return;
      Object.entries(data).forEach(([key, content]) => {
        if (typeof content !== 'string') return;
        indexContent(
          `health.medicines.${med}.${key}`,
          content,
          [med, key, 'medicine', 'tablet', 'dosage', 'drug']
        );
      });
    });

    // Index first aid
    const firstAid = this.knowledge.health?.first_aid || {};
    Object.entries(firstAid).forEach(([topic, content]) => {
      if (typeof content !== 'string') return;
      indexContent(
        `health.first_aid.${topic}`,
        content,
        [topic, 'first aid', 'emergency', 'injury', 'accident']
      );
    });

    // Index safety fraud
    const fraud = this.knowledge.safety?.fraud_awareness || {};
    Object.entries(fraud).forEach(([type, content]) => {
      if (typeof content !== 'string') return;
      indexContent(
        `safety.fraud_awareness.${type}`,
        content,
        [type, 'fraud', 'scam', 'safety', 'security', 'otp', 'bank', 'money', 'upi']
      );
    });

    // Index emergency numbers
    const emergency = this.knowledge.safety?.emergency_numbers || {};
    Object.entries(emergency).forEach(([service, content]) => {
      if (typeof content !== 'string') return;
      indexContent(
        `safety.emergency_numbers.${service}`,
        content,
        [service, 'emergency', 'number', 'call', 'helpline', 'police', 'ambulance']
      );
    });

    // Index home safety
    const homeSafety = this.knowledge.safety?.home_safety || {};
    Object.entries(homeSafety).forEach(([topic, content]) => {
      if (typeof content !== 'string') return;
      indexContent(
        `safety.home_safety.${topic}`,
        content,
        [topic, 'home', 'safety', 'fire', 'gas', 'electric']
      );
    });

    // Index government schemes
    const schemes = this.knowledge.daily_living?.government_schemes || {};
    Object.entries(schemes).forEach(([scheme, content]) => {
      if (typeof content !== 'string') return;
      indexContent(
        `daily_living.government_schemes.${scheme}`,
        content,
        [scheme, 'government', 'scheme', 'benefit', 'subsidy', 'pm', 'kisan', 'ayushman', 'vaccination']
      );
    });

    // Index livelihoods
    const livelihoods = this.knowledge.livelihoods || {};
    Object.entries(livelihoods).forEach(([section, data]) => {
      if (!data || typeof data !== 'object') return;
      Object.entries(data).forEach(([topic, content]) => {
        if (typeof content !== 'string') return;
        indexContent(
          `livelihoods.${section}.${topic}`,
          content,
          [topic, section, 'money', 'business', 'savings', 'loan', 'rights', 'work', 'income']
        );
      });
    });

    // Index climate
    const climate = this.knowledge.climate || {};
    Object.entries(climate).forEach(([section, data]) => {
      if (!data || typeof data !== 'object') return;
      Object.entries(data).forEach(([topic, content]) => {
        if (typeof content !== 'string') return;
        indexContent(
          `climate.${section}.${topic}`,
          content,
          [topic, section, 'climate', 'drought', 'flood', 'weather', 'environment', 'soil']
        );
      });
    });

    // Index daily living nutrition and hygiene
    const nutrition = this.knowledge.daily_living?.nutrition || {};
    Object.entries(nutrition).forEach(([topic, content]) => {
      if (typeof content !== 'string') return;
      indexContent(
        `daily_living.nutrition.${topic}`,
        content,
        [topic, 'food', 'nutrition', 'diet', 'eat', 'child', 'baby', 'breastfeed']
      );
    });

    // Index water sanitation
    const waterSan = this.knowledge.safety?.water_sanitation || {};
    Object.entries(waterSan).forEach(([topic, content]) => {
      if (typeof content !== 'string') return;
      indexContent(
        `safety.water_sanitation.${topic}`,
        content,
        [topic, 'water', 'sanitation', 'hygiene', 'handwashing', 'toilet', 'clean']
      );
    });

    // Index maternal health
    const maternal = this.knowledge.health?.maternal_health || {};
    Object.entries(maternal).forEach(([topic, content]) => {
      if (typeof content !== 'string') return;
      indexContent(
        `health.maternal_health.${topic}`,
        content,
        [topic, 'pregnancy', 'maternal', 'baby', 'newborn', 'breastfeed', 'mother', 'birth', 'family planning']
      );
    });

    // Index mental health
    const mental = this.knowledge.health?.mental_health || {};
    Object.entries(mental).forEach(([topic, content]) => {
      if (typeof content !== 'string') return;
      indexContent(
        `health.mental_health.${topic}`,
        content,
        [topic, 'mental', 'stress', 'depression', 'anxiety', 'grief', 'alcohol', 'drugs']
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
      agriculture: "I can help with farming. Ask about rice, wheat, corn, cassava, sorghum, banana, groundnut, tomato, potato, or beans — planting, pests, fertilizer, harvest, or water.",
      health: "I can help with health. Ask about fever, diarrhea, malaria, tuberculosis, cholera, diabetes, blood pressure, HIV, malnutrition, pregnancy, or medicines like paracetamol and ORS.",
      safety: "I can help with safety. Ask about OTP scams, mobile money fraud, fake jobs, phishing, emergency numbers for your country, or home safety.",
      government: "I can tell you about government programs — PM-KISAN, Ayushman Bharat, vaccination programs, and social protection schemes.",
      livelihoods: "I can help with livelihoods. Ask about mobile banking, savings, microfinance loans, starting a business, land rights, or labor rights.",
      climate: "I can help with climate adaptation. Ask about drought-tolerant crops, flood preparation, soil conservation, or deforestation.",
      general: "I am here to help! Ask me about:\n• Farming and crops (10 crops covered)\n• Health and medicines (10 ailments)\n• Safety and fraud awareness\n• Livelihoods and finance\n• Climate adaptation\n• Emergency numbers for 16 countries",
    };
    return {
      success: true,
      response: fallbacks[category] || fallbacks.general,
      confidence: 0.3,
      source: 'fallback',
    };
  }

  /**
   * Detect query category
   */
  detectCategory(query) {
    const lower = query.toLowerCase();
    if (/crop|farm|plant|pest|soil|fertilizer|harvest|rice|wheat|corn|cassava|sorghum|banana|groundnut|tomato|potato|beans|irrigation|drought|flood/.test(lower)) {
      return 'agriculture';
    }
    if (/fever|pain|sick|medicine|doctor|health|cough|cold|headache|diabetes|blood pressure|diarrhea|malaria|tuberculosis|tb|cholera|hiv|aids|malnutrition|pregnancy|mental|stress|depression/.test(lower)) {
      return 'health';
    }
    if (/fraud|scam|otp|safety|emergency|police|fire|upi|bank|password|pin|cyber|phishing|mobile money/.test(lower)) {
      return 'safety';
    }
    if (/scheme|pm kisan|ayushman|ration|government|subsidy|vaccination|vaccine/.test(lower)) {
      return 'government';
    }
    if (/money|savings|loan|business|income|rights|land|labor|insurance|microfinance/.test(lower)) {
      return 'livelihoods';
    }
    if (/climate|drought|flood|weather|environment|deforestation|soil erosion/.test(lower)) {
      return 'climate';
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
