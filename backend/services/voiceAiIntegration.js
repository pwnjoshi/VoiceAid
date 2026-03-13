/**
 * Voice AI Integration Service
 * Bridges the Node.js backend with Python voice AI services
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class VoiceAiIntegration {
  constructor() {
    this.pythonScriptPath = path.join(__dirname, '../../voice_ai_service.py');
    this.isAvailable = false;
    this.checkAvailability();
  }

  /**
   * Check if Python voice AI service is available
   */
  async checkAvailability() {
    try {
      await fs.access(this.pythonScriptPath);
      this.isAvailable = true;
      console.log('✅ Voice AI service available');
    } catch (error) {
      console.warn('⚠️ Voice AI service not available:', error.message);
      this.isAvailable = false;
    }
  }

  /**
   * Process audio through Python voice AI service
   * @param {string} audioPath - Path to audio file
   * @returns {Promise<Object>} - Transcription and response
   */
  async processAudio(audioPath) {
    if (!this.isAvailable) {
      throw new Error('Voice AI service is not available');
    }

    return new Promise((resolve, reject) => {
      const python = spawn('python', [this.pythonScriptPath, audioPath]);
      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Voice AI process failed: ${errorOutput}`));
          return;
        }

        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Voice AI output: ${error.message}`));
        }
      });
    });
  }

  /**
   * Process text through voice AI (text-to-speech)
   * @param {string} text - Text to convert to speech
   * @returns {Promise<string>} - Path to generated audio file
   */
  async textToSpeech(text) {
    if (!this.isAvailable) {
      throw new Error('Voice AI service is not available');
    }

    return new Promise((resolve, reject) => {
      const python = spawn('python', [
        this.pythonScriptPath,
        '--text',
        text,
        '--mode',
        'tts'
      ]);
      
      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`TTS process failed: ${errorOutput}`));
          return;
        }

        try {
          const result = JSON.parse(output);
          resolve(result.audioPath);
        } catch (error) {
          reject(new Error(`Failed to parse TTS output: ${error.message}`));
        }
      });
    });
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      available: this.isAvailable,
      scriptPath: this.pythonScriptPath
    };
  }
}

module.exports = new VoiceAiIntegration();
