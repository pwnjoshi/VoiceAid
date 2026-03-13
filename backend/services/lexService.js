/**
 * Amazon Lex V2 Service
 * Handles intent recognition and dialogue management
 */
const { 
  LexRuntimeV2Client, 
  RecognizeUtteranceCommand,
  RecognizeTextCommand 
} = require('@aws-sdk/client-lex-runtime-v2');
const { awsConfig } = require('../config/awsConfig');

class LexService {
  constructor() {
    this.client = new LexRuntimeV2Client({
      region: awsConfig.region,
      credentials: awsConfig.credentials
    });
    
    this.botId = process.env.LEX_BOT_ID;
    this.botAliasId = process.env.LEX_BOT_ALIAS_ID || 'TSTALIASID';
    this.localeId = process.env.LEX_LOCALE_ID || 'en_US';
  }

  /**
   * Process voice input through Lex
   * @param {Buffer} audioBuffer - Audio data
   * @param {string} sessionId - User session ID
   * @param {Object} sessionState - Current session state
   */
  async recognizeUtterance(audioBuffer, sessionId, sessionState = {}) {
    try {
      const command = new RecognizeUtteranceCommand({
        botId: this.botId,
        botAliasId: this.botAliasId,
        localeId: this.localeId,
        sessionId: sessionId,
        requestContentType: 'audio/l16; rate=16000; channels=1',
        inputStream: audioBuffer,
        sessionState: sessionState
      });

      const response = await this.client.send(command);
      
      return {
        intent: response.sessionState?.intent?.name,
        slots: response.sessionState?.intent?.slots || {},
        dialogAction: response.sessionState?.dialogAction,
        messages: response.messages || [],
        sessionState: response.sessionState,
        audioStream: response.audioStream
      };
    } catch (error) {
      console.error('Lex utterance recognition error:', error);
      throw error;
    }
  }

  /**
   * Process text input through Lex
   * @param {string} text - User text input
   * @param {string} sessionId - User session ID
   * @param {Object} sessionState - Current session state
   */
  async recognizeText(text, sessionId, sessionState = {}) {
    try {
      const command = new RecognizeTextCommand({
        botId: this.botId,
        botAliasId: this.botAliasId,
        localeId: this.localeId,
        sessionId: sessionId,
        text: text,
        sessionState: sessionState
      });

      const response = await this.client.send(command);
      
      return {
        intent: response.sessionState?.intent?.name,
        slots: response.sessionState?.intent?.slots || {},
        dialogAction: response.sessionState?.dialogAction,
        messages: response.messages || [],
        sessionState: response.sessionState
      };
    } catch (error) {
      console.error('Lex text recognition error:', error);
      throw error;
    }
  }

  /**
   * Build session state for context
   */
  buildSessionState(userId, context = {}) {
    return {
      sessionAttributes: {
        userId: userId,
        timestamp: new Date().toISOString(),
        ...context
      }
    };
  }
}

module.exports = new LexService();
