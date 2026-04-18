/**
 * OfflineAIService
 * Thin wrapper around EnhancedOfflineService.
 * Kept for backward compatibility — all real logic is in EnhancedOfflineService.
 */
import EnhancedOfflineService from './EnhancedOfflineService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineAIService {
  constructor() {
    this.isOnline     = false;
    this.batteryLevel = 100;
  }

  setNetworkStatus(isConnected) {
    this.isOnline = isConnected;
  }

  /** Main entry point — delegates to EnhancedOfflineService */
  async processOffline(query) {
    return EnhancedOfflineService.search(query);
  }

  classifyIntent(text) {
    return EnhancedOfflineService.detectCategory(text);
  }

  async getProcessingMode() {
    if (this.batteryLevel < 20) return 'low-power';
    if (!this.isOnline)         return 'offline';
    return 'online';
  }

  async getHistory() {
    try {
      const stored = await AsyncStorage.getItem('conversation_history');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  }

  async clearHistory() {
    await AsyncStorage.removeItem('conversation_history');
  }

  getNetworkStatus() {
    return { isOnline: this.isOnline, batteryLevel: this.batteryLevel };
  }
}

export default new OfflineAIService();
