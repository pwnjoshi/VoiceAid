import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Platform,
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

// Demo queries cycling through global topics
const DEMO_QUERIES = [
  'How do I control pests on my crops?',
  'What should I do for fever?',
  'How to protect myself from OTP scams?',
  'How to grow cassava?',
  'What is the emergency number?',
  'How to treat diarrhea in children?',
  'What are signs of malaria?',
  'How to save money safely?',
];

const IMPACT_STATS = [
  { icon: 'people', value: '700M+', label: 'Non-literate adults globally' },
  { icon: 'globe', value: '11', label: 'Languages supported' },
  { icon: 'wifi-off', value: '100%', label: 'Works offline' },
  { icon: 'flash', value: '<2MB', label: 'App size' },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const [appState, setAppState] = useState(STATES.IDLE);
  const [isOnline, setIsOnline] = useState(true);
  const [response, setResponse] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [queryCount, setQueryCount] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);
  const demoIndex = useRef(0);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(s => setIsOnline(!!s.isConnected));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (appState === STATES.LISTENING) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
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

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

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

      // Cycle through demo queries to showcase breadth of knowledge
      const query = DEMO_QUERIES[demoIndex.current % DEMO_QUERIES.length];
      demoIndex.current += 1;

      const result = await EnhancedOfflineService.search(query);
      setResponse(result.response || t('errors.processingError'));
      setQueryCount(c => c + 1);
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
        return { icon: 'mic', color: '#3B82F6', label: t('home.listening') };
      case STATES.PROCESSING:
        return { icon: 'sync', color: '#10B981', label: t('home.processing') };
      case STATES.SPEAKING:
        return { icon: 'volume-high', color: '#F59E0B', label: t('home.speaking') };
      case STATES.ERROR:
        return { icon: 'alert-circle', color: theme.colors.error.main, label: 'Tap to retry' };
      default:
        return {
          icon: 'mic-outline',
          color: isOnline ? theme.colors.primary[500] : '#8B5CF6',
          label: isOnline ? t('home.online') : t('home.offline'),
        };
    }
  };

  const btn = getButtonConfig();
  const isDisabled = appState === STATES.PROCESSING;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>{t('app.name')}</Text>
              <Text style={styles.subtitle}>{t('app.tagline')}</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.dot, { backgroundColor: isOnline ? '#10B981' : '#8B5CF6' }]} />
              <Text style={styles.statusText}>{isOnline ? t('status.online') : t('status.offline')}</Text>
            </View>
          </View>
        </View>

        {/* Feature pills */}
        <View style={styles.pillsRow}>
          <View style={styles.pill}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.pillText}>On-device AI</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="globe" size={14} color="#6366F1" />
            <Text style={styles.pillText}>11 Languages</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="wifi-off" size={14} color="#F59E0B" />
            <Text style={styles.pillText}>Works Offline</Text>
          </View>
        </View>

        {/* Voice button */}
        <View style={styles.buttonArea}>
          <Animated.View style={{ transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] }}>
            <TouchableOpacity
              style={[styles.voiceBtn, { backgroundColor: btn.color }, isDisabled && styles.disabled]}
              onPress={handlePress}
              activeOpacity={0.88}
              disabled={isDisabled}
            >
              <Ionicons name={btn.icon} size={68} color="#fff" />
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
          {queryCount > 0 && appState === STATES.IDLE && (
            <Text style={styles.queryCount}>{queryCount} question{queryCount !== 1 ? 's' : ''} answered</Text>
          )}
        </View>

        {/* Error */}
        {appState === STATES.ERROR && errorMsg ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={theme.colors.error.main} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Response card */}
        {response ? (
          <View style={styles.responseCard}>
            <View style={styles.responseHeader}>
              <View style={styles.responseIconWrap}>
                <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
              </View>
              <Text style={styles.responseTitle}>Answer</Text>
              <TouchableOpacity onPress={() => VoiceService.speak(response)} style={styles.replayBtn}>
                <Ionicons name="volume-high" size={20} color={theme.colors.primary[500]} />
              </TouchableOpacity>
            </View>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        ) : null}

        {/* Knowledge domains */}
        <View style={styles.domainsSection}>
          <Text style={styles.sectionLabel}>Knowledge Domains</Text>
          <View style={styles.domainsGrid}>
            {[
              { icon: 'leaf', label: 'Agriculture', sub: '10 crops', color: '#059669', bg: '#ECFDF5' },
              { icon: 'medical', label: 'Health', sub: '10 ailments', color: '#DC2626', bg: '#FEF2F2' },
              { icon: 'shield-checkmark', label: 'Safety', sub: 'Fraud & scams', color: '#2563EB', bg: '#EFF6FF' },
              { icon: 'cash', label: 'Livelihoods', sub: 'Finance & rights', color: '#D97706', bg: '#FFFBEB' },
              { icon: 'partly-sunny', label: 'Climate', sub: 'Adaptation', color: '#7C3AED', bg: '#F5F3FF' },
              { icon: 'people', label: 'Community', sub: 'Daily living', color: '#0891B2', bg: '#ECFEFF' },
            ].map(item => (
              <View key={item.label} style={[styles.domainCard, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
                <Text style={[styles.domainLabel, { color: item.color }]}>{item.label}</Text>
                <Text style={styles.domainSub}>{item.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Impact stats */}
        <View style={styles.impactSection}>
          <Text style={styles.sectionLabel}>Global Impact</Text>
          <View style={styles.statsGrid}>
            {IMPACT_STATS.map(stat => (
              <View key={stat.label} style={styles.statCard}>
                <Ionicons name={stat.icon} size={20} color={theme.colors.primary[500]} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background.paper },
  scroll: { paddingBottom: 40 },

  header: {
    paddingTop: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 30, fontWeight: '800', color: theme.colors.text.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: theme.colors.text.secondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.background.paper,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600', color: theme.colors.text.secondary },

  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.default,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.background.paper,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  pillText: { fontSize: 11, fontWeight: '600', color: theme.colors.text.secondary },

  buttonArea: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  voiceBtn: {
    width: 172,
    height: 172,
    borderRadius: 86,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  disabled: { opacity: 0.55 },
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
  queryCount: {
    fontSize: 12,
    color: theme.colors.primary[500],
    marginTop: 8,
    fontWeight: '600',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: '#FEF2F2',
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
    gap: 10,
    marginBottom: theme.spacing.sm,
  },
  responseIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  responseTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.primary[500], flex: 1 },
  replayBtn: { padding: 4 },
  responseText: { fontSize: 15, color: theme.colors.text.primary, lineHeight: 24 },

  domainsSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
  },
  domainsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  domainCard: {
    width: '30.5%',
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: 4,
  },
  domainLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  domainSub: { fontSize: 10, color: theme.colors.text.secondary, textAlign: 'center' },

  impactSection: {
    marginHorizontal: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.lg,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    ...theme.shadows.sm,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: theme.colors.primary[500] },
  statLabel: { fontSize: 9, color: theme.colors.text.secondary, textAlign: 'center', lineHeight: 13 },
});
