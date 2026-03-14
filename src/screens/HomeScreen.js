import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, TouchableOpacity,
  Animated, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import NetInfo from '@react-native-community/netinfo';

import VoiceService from '../services/VoiceService';
import EnhancedOfflineService from '../services/EnhancedOfflineService';
import theme from '../theme';

const STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ERROR: 'error',
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const [appState, setAppState] = useState(STATES.IDLE);
  const [isOnline, setIsOnline] = useState(true);
  const [response, setResponse] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(s => setIsOnline(!!s.isConnected));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (appState === STATES.LISTENING) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      if (pulseLoop.current) pulseLoop.current.stop();
      Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [appState]);

  const haptic = (type = 'medium') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        type === 'light' ? Haptics.ImpactFeedbackStyle.Light :
        type === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy :
        Haptics.ImpactFeedbackStyle.Medium
      ).catch(() => {});
    }
  };

  const handlePress = async () => {
    if (appState === STATES.IDLE || appState === STATES.ERROR) {
      await startListening();
    } else if (appState === STATES.LISTENING) {
      await stopAndProcess();
    } else if (appState === STATES.SPEAKING) {
      await VoiceService.stop();
      setAppState(STATES.IDLE);
    }
  };

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const startListening = async () => {
    try {
      setErrorMsg('');
      setResponse('');
      haptic('medium');

      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        setErrorMsg(t('errors.micPermission'));
        setAppState(STATES.ERROR);
        return;
      }

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setAppState(STATES.LISTENING);
      Animated.spring(scaleAnim, { toValue: 1.08, useNativeDriver: true }).start();
    } catch (err) {
      console.error('startListening error:', err);
      setErrorMsg(t('errors.processingError'));
      setAppState(STATES.ERROR);
      haptic('heavy');
    }
  };

  const stopAndProcess = async () => {
    try {
      haptic('light');
      setAppState(STATES.PROCESSING);
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

      await audioRecorder.stop();

      // Use offline AI to generate a helpful response
      // In production this would send audio to STT first
      const demoQueries = [
        'How do I control pests on my crops?',
        'What should I do for fever?',
        'How to protect myself from OTP scams?',
        'How to grow rice?',
        'What is the emergency number?',
      ];
      const query = demoQueries[Math.floor(Math.random() * demoQueries.length)];
      const result = await EnhancedOfflineService.search(query);

      setResponse(result.response || t('errors.processingError'));
      setAppState(STATES.SPEAKING);

      await VoiceService.speak(result.response, {
        onDone: () => setAppState(STATES.IDLE),
        onError: () => setAppState(STATES.IDLE),
      });

      haptic('light');
    } catch (err) {
      console.error('stopAndProcess error:', err);
      setErrorMsg(t('errors.processingError'));
      setAppState(STATES.ERROR);
      haptic('heavy');
    }
  };

  const getButtonConfig = () => {
    switch (appState) {
      case STATES.LISTENING:
        return { icon: 'mic', color: theme.colors.voice.listening, label: t('home.listening') };
      case STATES.PROCESSING:
        return { icon: 'sync', color: theme.colors.voice.processing, label: t('home.processing') };
      case STATES.SPEAKING:
        return { icon: 'volume-high', color: theme.colors.voice.speaking, label: t('home.speaking') };
      case STATES.ERROR:
        return { icon: 'alert-circle', color: theme.colors.error.main, label: 'Error — tap to retry' };
      default:
        return {
          icon: 'mic-outline',
          color: isOnline ? theme.colors.voice.idle : theme.colors.voice.offline,
          label: isOnline ? t('home.online') : t('home.offline'),
        };
    }
  };

  const btn = getButtonConfig();
  const isDisabled = appState === STATES.PROCESSING;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('app.name')}</Text>
          <Text style={styles.subtitle}>{t('app.tagline')}</Text>
        </View>

        {/* Status pills */}
        <View style={styles.statusRow}>
          <View style={styles.pill}>
            <Ionicons
              name={isOnline ? 'wifi' : 'wifi-off'}
              size={16}
              color={isOnline ? theme.colors.online : theme.colors.offline}
            />
            <Text style={styles.pillText}>
              {isOnline ? t('status.online') : t('status.offline')}
            </Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="shield-checkmark" size={16} color={theme.colors.success.main} />
            <Text style={styles.pillText}>On-device AI</Text>
          </View>
        </View>

        {/* Voice button */}
        <View style={styles.buttonArea}>
          <Animated.View style={{ transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] }}>
            <TouchableOpacity
              style={[styles.voiceBtn, { backgroundColor: btn.color }, isDisabled && styles.disabled]}
              onPress={handlePress}
              activeOpacity={0.85}
              disabled={isDisabled}
            >
              <Ionicons name={btn.icon} size={72} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.stateLabel}>{btn.label}</Text>
          {appState === STATES.IDLE && (
            <Text style={styles.hint}>{t('home.tapToSpeak')}</Text>
          )}
          {appState === STATES.LISTENING && (
            <Text style={styles.hint}>{t('home.tapAgain')}</Text>
          )}
          {appState === STATES.SPEAKING && (
            <Text style={styles.hint}>Tap to stop</Text>
          )}
        </View>

        {/* Error */}
        {appState === STATES.ERROR && errorMsg ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.error.main} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Response card */}
        {response ? (
          <View style={styles.responseCard}>
            <View style={styles.responseHeader}>
              <Ionicons name="chatbubble-ellipses" size={18} color={theme.colors.primary[500]} />
              <Text style={styles.responseTitle}>Response</Text>
              <TouchableOpacity
                onPress={() => VoiceService.speak(response)}
                style={styles.replayBtn}
              >
                <Ionicons name="volume-high" size={20} color={theme.colors.primary[500]} />
              </TouchableOpacity>
            </View>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        ) : null}

        {/* Topic chips */}
        <View style={styles.topicsRow}>
          {[
            { icon: 'leaf', label: t('knowledge.agriculture'), color: theme.colors.success.main },
            { icon: 'medical', label: t('knowledge.health'), color: theme.colors.error.main },
            { icon: 'shield-checkmark', label: t('knowledge.safety'), color: theme.colors.info.main },
          ].map(item => (
            <View key={item.label} style={styles.topicChip}>
              <Ionicons name={item.icon} size={20} color={item.color} />
              <Text style={styles.topicLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background.paper },
  scroll: { paddingBottom: 32 },
  header: {
    paddingTop: 48,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
  },
  title: { fontSize: 32, fontWeight: '700', color: theme.colors.text.primary },
  subtitle: { fontSize: 15, color: theme.colors.text.secondary, marginTop: 4 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.background.default,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    ...theme.shadows.sm,
  },
  pillText: { fontSize: 13, fontWeight: '600', color: theme.colors.text.primary },
  buttonArea: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  voiceBtn: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  disabled: { opacity: 0.6 },
  stateLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
  },
  hint: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 6,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error.light + '18',
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error.main,
  },
  errorText: { fontSize: 14, color: theme.colors.error.main, flex: 1 },
  responseCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  responseTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.primary[500], flex: 1 },
  replayBtn: { padding: 4 },
  responseText: { fontSize: 15, color: theme.colors.text.primary, lineHeight: 23 },
  topicsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
  },
  topicChip: { alignItems: 'center', gap: 6 },
  topicLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.text.secondary },
});
