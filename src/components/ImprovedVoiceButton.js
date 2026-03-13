/**
 * Improved Voice Button Component
 * Enhanced UI with haptic feedback, animations, and offline support
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Vibration,
  Dimensions,
  Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import OfflineAIService from '../services/OfflineAIService';
import StreamingAudioService from '../services/StreamingAudioService';

const { width, height } = Dimensions.get('window');

const BUTTON_STATES = {
  IDLE: { color: '#6B7280', text: 'Tap to Speak', icon: '🎤' },
  LISTENING: { color: '#3B82F6', text: 'Listening...', icon: '👂' },
  PROCESSING: { color: '#10B981', text: 'Thinking...', icon: '🧠' },
  SPEAKING: { color: '#F59E0B', text: 'Speaking...', icon: '🔊' },
  OFFLINE: { color: '#8B5CF6', text: 'Offline Mode', icon: '📱' },
  ERROR: { color: '#EF4444', text: 'Try Again', icon: '⚠️' }
};

export default function ImprovedVoiceButton({ onResponse }) {
  const [state, setState] = useState('IDLE');
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [transcript, setTranscript] = useState('');
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check network status
    const checkStatus = async () => {
      const status = OfflineAIService.getNetworkStatus();
      setIsOnline(status.isOnline);
      setBatteryLevel(status.batteryLevel);
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate based on state
    if (state === 'LISTENING') {
      startPulseAnimation();
    } else if (state === 'PROCESSING') {
      startRotateAnimation();
    } else {
      stopAnimations();
    }
  }, [state]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const startRotateAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true
      })
    ).start();
  };

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    rotateAnim.stopAnimation();
    pulseAnim.setValue(1);
    rotateAnim.setValue(0);
  };

  const hapticFeedback = (type = 'medium') => {
    if (Platform.OS === 'ios') {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } else {
      Vibration.vibrate(type === 'heavy' ? 100 : 50);
    }
  };

  const handlePress = async () => {
    if (state === 'IDLE' || state === 'OFFLINE') {
      await startListening();
    } else if (state === 'LISTENING') {
      await stopListening();
    }
  };

  const startListening = async () => {
    try {
      hapticFeedback('medium');
      setState('LISTENING');
      
      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error('Microphone permission denied');
      }

      // Start recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Visual feedback
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true
      }).start();

    } catch (error) {
      console.error('Start listening error:', error);
      setState('ERROR');
      hapticFeedback('error');
      setTimeout(() => setState('IDLE'), 2000);
    }
  };

  const stopListening = async () => {
    try {
      hapticFeedback('light');
      setState('PROCESSING');
      
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true
      }).start();

      // Simulate transcription (replace with actual speech-to-text)
      const mockTranscript = 'How do I control pests on my crops?';
      setTranscript(mockTranscript);

      // Process based on connectivity
      const processingMode = await OfflineAIService.getProcessingMode();
      
      let result;
      if (processingMode === 'online' && isOnline) {
        // Try online processing first
        try {
          result = await processOnline(mockTranscript);
        } catch (error) {
          console.log('Online processing failed, falling back to offline');
          result = await OfflineAIService.processOffline(mockTranscript);
        }
      } else {
        // Use offline processing
        result = await OfflineAIService.processOffline(mockTranscript);
      }

      // Speak response
      await speakResponse(result.response);
      
      if (onResponse) {
        onResponse(result);
      }

      hapticFeedback('success');
      
    } catch (error) {
      console.error('Stop listening error:', error);
      setState('ERROR');
      hapticFeedback('error');
      setTimeout(() => setState('IDLE'), 2000);
    }
  };

  const processOnline = async (text) => {
    // This would call your backend API
    // For now, return mock data
    return {
      success: true,
      response: 'Online processing would happen here',
      offline: false
    };
  };

  const speakResponse = async (text) => {
    setState('SPEAKING');
    
    // Text-to-speech would happen here
    // For now, simulate with timeout
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setState(isOnline ? 'IDLE' : 'OFFLINE');
    setTranscript('');
  };

  const currentState = BUTTON_STATES[state];
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>{isOnline ? '🌐' : '📱'}</Text>
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>🔋</Text>
          <Text style={styles.statusText}>{batteryLevel}%</Text>
        </View>
      </View>

      {/* Transcript Display */}
      {transcript ? (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>You said:</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      ) : null}

      {/* Main Voice Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { rotate: spin }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: currentState.color }
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text style={styles.icon}>{currentState.icon}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* State Text */}
      <Text style={styles.stateText}>{currentState.text}</Text>

      {/* Offline Indicator */}
      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>
            📱 Working offline - Basic features available
          </Text>
        </View>
      )}

      {/* Battery Warning */}
      {batteryLevel < 20 && (
        <View style={styles.batteryWarning}>
          <Text style={styles.warningText}>
            🔋 Low battery - Using power-saving mode
          </Text>
        </View>
      )}

      {/* Help Text */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>
          Ask about: Farming 🌾 • Health 💊 • Safety 🛡️
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  statusBar: {
    position: 'absolute',
    top: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  transcriptContainer: {
    position: 'absolute',
    top: 140,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    width: width - 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transcriptLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  transcriptText: {
    fontSize: 18,
    color: '#111827',
    lineHeight: 26,
  },
  buttonContainer: {
    marginVertical: 40,
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  icon: {
    fontSize: 80,
  },
  stateText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
  },
  offlineIndicator: {
    position: 'absolute',
    bottom: 180,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  offlineText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  batteryWarning: {
    position: 'absolute',
    bottom: 120,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  warningText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  helpText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
