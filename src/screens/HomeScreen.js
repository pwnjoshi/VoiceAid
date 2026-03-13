import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import ImprovedVoiceButton from '../components/ImprovedVoiceButton';
import OfflineAIService from '../services/OfflineAIService';
import EnhancedOfflineService from '../services/EnhancedOfflineService';

/**
 * HomeScreen - Main screen with enhanced offline voice interaction
 */
const HomeScreen = () => {
  const [networkStatus, setNetworkStatus] = useState({ isOnline: true, batteryLevel: 100 });

  useEffect(() => {
    // Check network status periodically
    const checkStatus = () => {
      const status = OfflineAIService.getNetworkStatus();
      setNetworkStatus(status);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Handle voice response
   */
  const handleResponse = async (result) => {
    console.log('Voice response:', result);
    
    // Save query for learning
    await EnhancedOfflineService.saveQuery(
      result.query || '',
      result,
      null // User can mark as helpful later
    );

    // Show response in UI if needed
    if (!result.success) {
      Alert.alert('Error', 'Failed to process your request. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VoiceAid</Text>
        <Text style={styles.subtitle}>
          {networkStatus.isOnline ? '🌐 Online Mode' : '📱 Offline Mode'}
        </Text>
        <Text style={styles.description}>
          Your voice assistant that works anywhere, anytime
        </Text>
      </View>

      <ImprovedVoiceButton onResponse={handleResponse} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ✓ Works offline • ✓ Battery optimized • ✓ Always available
        </Text>
        <Text style={styles.helpText}>
          Ask about farming, health, safety, or daily tasks
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default HomeScreen;
