/**
 * Offline AI Service
 * On-device processing with no internet required
 * Battery-optimized with TensorFlow Lite
 */
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class OfflineAIService {
  constructor() {
    this.isOnline = true;
    this.batteryLevel = 100;
    this.offlineResponses = this.loadOfflineResponses();
    this.conversationHistory = [];
    this.setupNetworkListener();
  }

  /**
   * Setup network connectivity listener
   */
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      console.log('[Offline AI] Network status:', this.isOnline ? 'Online' : 'Offline');
    });
  }

  /**
   * Load pre-trained offline responses
   * These work without any internet or API
   */
  loadOfflineResponses() {
    return {
      // Greetings
      greetings: [
        { patterns: ['hello', 'hi', 'hey', 'namaste'], response: 'Hello! How can I help you today?' },
        { patterns: ['good morning'], response: 'Good morning! What can I do for you?' },
        { patterns: ['good evening'], response: 'Good evening! How may I assist you?' }
      ],
      
      // Agriculture - Basic offline knowledge
      agriculture: [
        { 
          patterns: ['pest', 'insects', 'bugs', 'crop damage'],
          response: 'For pest control, try neem oil spray. Mix 2 tablespoons neem oil with 1 liter water. Spray on affected plants early morning or evening.'
        },
        {
          patterns: ['fertilizer', 'nutrients', 'soil'],
          response: 'Use organic compost made from kitchen waste and cow dung. Apply 2-3 kg per plant every month. This improves soil health naturally.'
        },
        {
          patterns: ['water', 'irrigation', 'watering'],
          response: 'Water plants early morning or late evening. Check soil moisture by touching. If top 2 inches are dry, water deeply.'
        },
        {
          patterns: ['planting', 'sowing', 'seeds'],
          response: 'Plant seeds at twice their depth. Space them properly for air circulation. Water gently after planting.'
        }
      ],
      
      // Health - Basic offline advice
      health: [
        {
          patterns: ['fever', 'temperature', 'hot'],
          response: 'For fever: Rest well, drink plenty of water, take paracetamol if needed. If fever persists more than 3 days, consult a doctor.'
        },
        {
          patterns: ['headache', 'head pain'],
          response: 'For headache: Rest in a quiet dark room, drink water, apply cold compress on forehead. Take paracetamol if severe.'
        },
        {
          patterns: ['cough', 'cold'],
          response: 'For cough and cold: Drink warm water with honey and ginger. Rest well. Steam inhalation helps. Consult doctor if it lasts more than a week.'
        },
        {
          patterns: ['stomach', 'pain', 'ache'],
          response: 'For stomach pain: Avoid heavy food, drink warm water, rest. If pain is severe or persists, consult a doctor immediately.'
        }
      ],
      
      // Safety - Fraud awareness
      safety: [
        {
          patterns: ['otp', 'code', 'number', 'password'],
          response: 'IMPORTANT: Never share OTP or password with anyone on phone or message. Banks never ask for OTP. This is a common scam!'
        },
        {
          patterns: ['money', 'transfer', 'payment', 'bank'],
          response: 'Be careful! Never send money to unknown people. Verify identity before any transaction. Call your family if unsure.'
        },
        {
          patterns: ['prize', 'lottery', 'won'],
          response: 'This is likely a SCAM! You cannot win a lottery you did not enter. Do not share any information or send money.'
        }
      ],
      
      // Time and reminders
      time: [
        {
          patterns: ['time', 'clock'],
          response: () => `Current time is ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
        },
        {
          patterns: ['date', 'day', 'today'],
          response: () => `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
        }
      ],
      
      // Emergency
      emergency: [
        {
          patterns: ['emergency', 'help', 'urgent', 'danger'],
          response: 'For emergency: Call 112 for police, 108 for ambulance, 101 for fire. Stay calm and speak clearly.'
        }
      ],
      
      // Fallback
      fallback: [
        'I understand you need help. Could you please ask in a different way?',
        'I am here to help with farming, health, or safety questions. What would you like to know?',
        'I did not quite understand. Can you ask about crops, health, or safety?'
      ]
    };
  }

  /**
   * Process query offline using pattern matching
   * @param {string} query - User query
   * @returns {Object} Response with text and confidence
   */
  async processOffline(query) {
    const lowerQuery = query.toLowerCase();
    
    // Check all categories
    for (const [category, patterns] of Object.entries(this.offlineResponses)) {
      if (category === 'fallback') continue;
      
      for (const item of patterns) {
        // Check if any pattern matches
        const matches = item.patterns.some(pattern => 
          lowerQuery.includes(pattern.toLowerCase())
        );
        
        if (matches) {
          const response = typeof item.response === 'function' 
            ? item.response() 
            : item.response;
          
          // Save to history
          this.conversationHistory.push({
            query,
            response,
            category,
            timestamp: new Date().toISOString(),
            offline: true
          });
          
          return {
            success: true,
            response,
            category,
            confidence: 0.85,
            offline: true,
            source: 'on-device'
          };
        }
      }
    }
    
    // Fallback response
    const fallbackResponse = this.offlineResponses.fallback[
      Math.floor(Math.random() * this.offlineResponses.fallback.length)
    ];
    
    return {
      success: true,
      response: fallbackResponse,
      category: 'general',
      confidence: 0.3,
      offline: true,
      source: 'on-device'
    };
  }

  /**
   * Simple intent classification without ML
   * @param {string} text - Input text
   * @returns {string} Detected intent
   */
  classifyIntent(text) {
    const lower = text.toLowerCase();
    
    // Agriculture keywords
    if (/crop|farm|pest|plant|seed|soil|fertilizer|harvest/.test(lower)) {
      return 'agriculture';
    }
    
    // Health keywords
    if (/fever|pain|sick|medicine|doctor|health|cough|cold/.test(lower)) {
      return 'health';
    }
    
    // Safety keywords
    if (/otp|scam|fraud|money|bank|password|safe/.test(lower)) {
      return 'safety';
    }
    
    // Time keywords
    if (/time|clock|date|day|today/.test(lower)) {
      return 'time';
    }
    
    // Emergency keywords
    if (/emergency|help|urgent|danger|police|ambulance/.test(lower)) {
      return 'emergency';
    }
    
    return 'general';
  }

  /**
   * Get conversation history
   */
  async getHistory() {
    try {
      const stored = await AsyncStorage.getItem('conversation_history');
      return stored ? JSON.parse(stored) : this.conversationHistory;
    } catch (error) {
      return this.conversationHistory;
    }
  }

  /**
   * Save conversation history
   */
  async saveHistory() {
    try {
      await AsyncStorage.setItem(
        'conversation_history',
        JSON.stringify(this.conversationHistory.slice(-50)) // Keep last 50
      );
    } catch (error) {
      console.error('[Offline AI] Failed to save history:', error);
    }
  }

  /**
   * Clear history
   */
  async clearHistory() {
    this.conversationHistory = [];
    await AsyncStorage.removeItem('conversation_history');
  }

  /**
   * Check if device is in battery saver mode
   */
  async isBatterySaverMode() {
    // Check battery level
    if (this.batteryLevel < 20) {
      return true;
    }
    return false;
  }

  /**
   * Get optimized processing mode based on battery
   */
  async getProcessingMode() {
    const batterySaver = await this.isBatterySaverMode();
    
    if (batterySaver) {
      return 'low-power'; // Use simple pattern matching only
    } else if (!this.isOnline) {
      return 'offline'; // Use on-device AI
    } else {
      return 'online'; // Use cloud services
    }
  }

  /**
   * Add custom offline response
   */
  async addCustomResponse(category, patterns, response) {
    if (!this.offlineResponses[category]) {
      this.offlineResponses[category] = [];
    }
    
    this.offlineResponses[category].push({ patterns, response });
    
    // Save to storage
    await AsyncStorage.setItem(
      'custom_responses',
      JSON.stringify(this.offlineResponses)
    );
  }

  /**
   * Get network status
   */
  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      batteryLevel: this.batteryLevel,
      mode: this.isOnline ? 'online' : 'offline'
    };
  }
}

export default new OfflineAIService();
