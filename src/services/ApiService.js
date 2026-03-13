/**
 * ApiService handles communication with the backend API
 */
import { API_BASE_URL, ENDPOINTS } from '../config/api';

class ApiService {
  /**
   * Send recorded audio to backend and receive AI response
   * @param {string} audioUri - Local URI of the recorded audio file
   * @returns {string} URI of the response audio file
   */
  async sendVoiceMessage(audioUri) {
    try {
      // Create FormData to send audio file
      const formData = new FormData();
      
      // Extract filename from URI
      const filename = audioUri.split('/').pop();
      
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a', // or 'audio/mp4' depending on recording format
        name: filename || 'recording.m4a',
      });

      // Send POST request to backend
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.VOICE}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      // Save response audio to local file
      const blob = await response.blob();
      const responseUri = await this.saveAudioBlob(blob);
      
      return responseUri;
    } catch (error) {
      console.error('Failed to send voice message:', error);
      throw error;
    }
  }

  /**
   * Save audio blob to local file system
   * @param {Blob} blob - Audio blob from API response
   * @returns {string} Local URI of saved file
   */
  async saveAudioBlob(blob) {
    try {
      // In React Native, we can use the blob URL directly
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to save audio blob:', error);
      throw error;
    }
  }

  /**
   * Update API base URL (for settings)
   */
  setBaseUrl(url) {
    API_BASE_URL = url;
  }
}

export default new ApiService();
