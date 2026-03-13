/**
 * Home Screen - Professional Voice Interface
 * Modern UI with icons, animations, and multi-language support
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import NetInfo from '@react-native-community/netinfo';

import VoiceService from '../services/VoiceService';
import OfflineAIService from '../../src/services/OfflineAIService';
import EnhancedOfflineService from '../../src/services/EnhancedOfflineService';
import theme from '../theme';

const { width } = Dimensions.get('window');

const STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const [state, setState] = useState(STATES.IDLE);
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [transcript, setTranscript] = useState('');
  
  const scaleAnim = new Animated.Value(1);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (state === STATES.LISTENING) {
      startPulseAnimation();
    } else {
      stopAnimations();
    }
  }, [state]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const hapticFeedback = (type = 'medium') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(
        type === 'light' ? Haptics.ImpactFeedbackStyle.Light :
        type === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy :
        Haptics.ImpactFeedbackStyle.Medium
      );
    }
  };

  const handlePress = async () => {
    if (state === STATES.IDLE) {
      await startListening();
    } else if (state === STATES.LISTENING) {
      await stopListening();
    }
  };

  const startListening = async () => {
    try {
      hapticFeedback('medium');
      setState(STATES.LISTENING);
      
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error(t('errors.micPermission'));
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      console.error('Start listening error:', error);
      setState(STATES.IDLE);
      hapticFeedback('heavy');
    }
  };

  const stopListening = async () => {
    try {
      hapticFeedback('light');
      setState(STATES.PROCESSING);
      
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      // Simulate transcription (replace with actual STT)
      const mockTranscript = 'How do I control pests on my crops?';
      setTranscript(mockTranscript);

      // Process with offline AI
      const result = await EnhancedOfflineService.search(mockTranscript);

      // Speak response
      setState(STATES.SPEAKING);
      await VoiceService.speak(result.response, {
        onDone: () => {
          setState(STATES.IDLE);
          setTranscript('');
        },
      });

      hapticFeedback('light');
      
    } catch (error) {
      console.error('Stop listening error:', error);
      setState(STATES.IDLE);
      hapticFeedback('heavy');
    }
  };

  const getButtonConfig = () => {
    switch (state) {
      case STATES.LISTENING:
        return {
          icon: 'mic',
          color: theme.colors.voice.listening,
          text: t('home.listening'),
        };
      case STATES.PROCESSING:
        return {
          icon: 'sync',
          color: theme.colors.voice.processing,
          text: t('home.processing'),
        };
      case STATES.SPEAKING:
        return {
          icon: 'volume-high',
          color: theme.colors.voice.speaking,
          text: t('home.speaking'),
        };
      default:
        return {
          icon: 'mic-outline',
          color: isOnline ? theme.colors.voice.idle : theme.colors.voice.offline,
          text: isOnline ? t('home.online') : t('home.offline'),
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('app.name')}</Text>
        <Text style={styles.subtitle}>{t('app.tagline')}</Text>
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Ionicons 
            name={isOnline ? 'wifi' : 'wifi-off'} 
            size={20} 
            color={isOnline ? theme.colors.online : theme.colors.offline} 
          />
          <Text style={styles.statusText}>
            {isOnline ? t('status.online') : t('status.offline')}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons 
            name="battery-half" 
            size={20} 
            color={
              batteryLevel > 50 ? theme.colors.battery.high :
              batteryLevel > 20 ? theme.colors.battery.medium :
              theme.colors.battery.low
            } 
          />
          <Text style={styles.statusText}>{batteryLevel}%</Text>
        </View>
      </View>

      {/* Transcript */}
      {transcript ? (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>{t('home.tapToSpeak')}</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      ) : null}

      {/* Voice Button */}
      <View style={styles.buttonWrapper}>
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.button, { backgroundColor: buttonConfig.color }]}
            onPress={handlePress}
            activeOpacity={0.8}
            disabled={state === STATES.PROCESSING || state === STATES.SPEAKING}
          >
            <Ionicons name={buttonConfig.icon} size={80} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
        
        <Text style={styles.stateText}>{buttonConfig.text}</Text>
        
        {state === STATES.IDLE && (
          <Text style={styles.instructionText}>{t('home.tapToSpeak')}</Text>
        )}
      </View>

      {/* Help Section */}
      <View style={styles.helpContainer}>
        <View style={styles.helpItem}>
          <Ionicons name="leaf" size={24} color={theme.colors.success.main} />
          <Text style={styles.helpText}>{t('knowledge.agriculture')}</Text>
        </View>
        <View style={styles.helpItem}>
          <Ionicons name="medical" size={24} color={theme.colors.error.main} />
          <Text style={styles.helpText}>{t('knowledge.health')}</Text>
        </View>
        <View style={styles.helpItem}>
          <Ionicons name="shield-checkmark" size={24} color={theme.colors.info.main} />
          <Text style={styles.helpText}>{t('knowledge.safety')}</Text>
        </View>
      </View>

      {/* Battery Warning */}
      {batteryLevel < 20 && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="#FFFFFF" />
          <Text style={styles.warningText}>{t('status.lowBattery')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.paper,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  statusText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  transcriptContainer: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
  },
  transcriptLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  transcriptText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    lineHeight: 24,
  },
  buttonWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginBottom: theme.spacing.lg,
  },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  stateText: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    fontWeight: '600',
  },
  instructionText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.background.default,
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
    ...theme.shadows.lg,
  },
  helpItem: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  helpText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  warningBanner: {
    position: 'absolute',
    bottom: 120,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    gap: theme.spacing.sm,
    ...theme.shadows.lg,
  },
  warningText: {
    ...theme.typography.styles.body2,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
});
