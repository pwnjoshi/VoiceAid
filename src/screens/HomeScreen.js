/**
 * HomeScreen — Voice Assistant
 *
 * Uses expo-speech-recognition for STT — works in Expo Go on Android.
 * Falls back to text input if permissions denied or STT unavailable.
 *
 * Flow:
 *  1. Tap mic → request mic permission → start STT
 *  2. Partial results shown live as user speaks
 *  3. Final result → search knowledge base (AWS Bedrock if online, offline otherwise)
 *  4. Answer spoken aloud via expo-speech TTS
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Platform, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import NetInfo from '@react-native-community/netinfo';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

import VoiceService from '../services/VoiceService';
import EnhancedOfflineService from '../services/EnhancedOfflineService';
import ApiService from '../services/ApiService';
import theme from '../theme';

// ── Constants ─────────────────────────────────────────────────────────────────
const S = {
  IDLE:       'idle',
  LISTENING:  'listening',
  PROCESSING: 'processing',
  SPEAKING:   'speaking',
  ERROR:      'error',
};

const LOCALE_MAP = {
  en: 'en-US', hi: 'hi-IN', mr: 'mr-IN',
  ta: 'ta-IN', bn: 'bn-IN', te: 'te-IN',
  sw: 'sw-KE', ar: 'ar-SA', es: 'es-ES',
  fr: 'fr-FR', id: 'id-ID',
};

const IMPACT_STATS = [
  { icon: 'people',        value: '700M+', label: 'Non-literate adults globally' },
  { icon: 'globe',         value: '11',    label: 'Languages supported' },
  { icon: 'cloud-offline', value: '100%',  label: 'Works offline' },
  { icon: 'flash',         value: '<2MB',  label: 'App size' },
];

const DOMAINS = [
  { icon: 'leaf',             label: 'Agriculture', sub: '10 crops',        color: '#059669', bg: '#ECFDF5' },
  { icon: 'medical',          label: 'Health',      sub: '10 ailments',     color: '#DC2626', bg: '#FEF2F2' },
  { icon: 'shield-checkmark', label: 'Safety',      sub: 'Fraud & scams',   color: '#2563EB', bg: '#EFF6FF' },
  { icon: 'cash',             label: 'Livelihoods', sub: 'Finance & rights',color: '#D97706', bg: '#FFFBEB' },
  { icon: 'partly-sunny',     label: 'Climate',     sub: 'Adaptation',      color: '#7C3AED', bg: '#F5F3FF' },
  { icon: 'people',           label: 'Community',   sub: 'Daily living',    color: '#0891B2', bg: '#ECFEFF' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { t, i18n } = useTranslation();

  const [appState,     setAppState]     = useState(S.IDLE);
  const [isOnline,     setIsOnline]     = useState(true);   // demo: show online
  const [backendUp,    setBackendUp]    = useState(false);
  const [response,     setResponse]     = useState('For pest control on crops, use neem oil spray. Mix 10ml neem oil per liter of water and spray early morning. Remove affected leaves immediately. This works for stem borer, aphids, and whitefly.');
  const [transcript,   setTranscript]   = useState('How do I control pests on my crops?');
  const [partial,      setPartial]      = useState('');
  const [errorMsg,     setErrorMsg]     = useState('');
  const [queryCount,   setQueryCount]   = useState(3);
  const [answerSrc,    setAnswerSrc]    = useState('offline');
  const [sttAvailable, setSttAvailable] = useState(true);
  const [textInput,    setTextInput]    = useState('');

  const stateRef      = useRef(S.IDLE);
  const finalTextRef  = useRef('');

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  const sttLocale = LOCALE_MAP[i18n.language] || 'en-US';

  // ── expo-speech-recognition event hooks ────────────────────────────────────
  useSpeechRecognitionEvent('start', () => {
    setState(S.LISTENING);
    Animated.spring(scaleAnim, { toValue: 1.08, useNativeDriver: true }).start();
  });

  useSpeechRecognitionEvent('end', () => {
    // Fires when recognition session ends (natural or manual stop)
    if (stateRef.current === S.LISTENING) {
      const text = finalTextRef.current;
      if (text) {
        processText(text);
      } else {
        setErrorMsg('No speech detected. Tap the mic and speak your question.');
        setState(S.ERROR);
        haptic('heavy');
      }
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript || '';
    if (event.isFinal) {
      finalTextRef.current = text;
      setTranscript(text);
      setPartial('');
      // Process immediately on final result
      if (stateRef.current === S.LISTENING) {
        processText(text);
      }
    } else {
      setPartial(text);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    const code = event.error || '';
    if (code === 'no-speech') {
      setErrorMsg('No speech detected. Tap the mic and speak your question.');
    } else if (code === 'not-allowed' || code === 'service-not-allowed') {
      setSttAvailable(false);
      setErrorMsg('Microphone permission denied. Use text input below.');
    } else if (code === 'network') {
      // STT needs network on some devices — fall back to text
      setSttAvailable(false);
      setErrorMsg('Voice recognition needs internet on this device. Use text input below.');
    } else {
      setErrorMsg(`Voice error: ${code}. Please try again.`);
    }
    setPartial('');
    if (stateRef.current === S.LISTENING) {
      setState(S.ERROR);
      haptic('heavy');
    }
  });

  // ── Network + backend health ────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener(async (state) => {
      const online = !!state.isConnected;
      setIsOnline(online);
      if (online) {
        const up = await ApiService.checkHealth();
        setBackendUp(up);
      } else {
        setBackendUp(false);
      }
    });
    return () => unsub();
  }, []);

  // ── Pulse animation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (appState === S.LISTENING) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.22, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [appState]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const setState = (s) => { stateRef.current = s; setAppState(s); };

  const haptic = (type = 'medium') => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(
      type === 'light' ? Haptics.ImpactFeedbackStyle.Light :
      type === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy :
      Haptics.ImpactFeedbackStyle.Medium
    ).catch(() => {});
  };

  // ── Button press ────────────────────────────────────────────────────────────
  const handlePress = async () => {
    if (appState === S.SPEAKING) {
      await VoiceService.stop();
      setState(S.IDLE);
      return;
    }
    if (!sttAvailable) return;
    if (appState === S.IDLE || appState === S.ERROR) {
      await startListening();
    } else if (appState === S.LISTENING) {
      stopListening();
    }
  };

  // ── Text input submit ───────────────────────────────────────────────────────
  const handleTextSubmit = () => {
    const text = textInput.trim();
    if (!text) return;
    setTranscript(text);
    setTextInput('');
    processText(text);
  };

  // ── Start STT ───────────────────────────────────────────────────────────────
  const startListening = async () => {
    setErrorMsg('');
    setResponse('');
    setTranscript('');
    setPartial('');
    finalTextRef.current = '';
    haptic('medium');

    try {
      // Request permission first
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        setSttAvailable(false);
        setErrorMsg('Microphone permission denied. Use text input below.');
        setState(S.ERROR);
        haptic('heavy');
        return;
      }

      // Start recognition
      ExpoSpeechRecognitionModule.start({
        lang:          sttLocale,
        interimResults: true,       // show partial results live
        maxAlternatives: 1,
        continuous:    false,       // stop after first utterance
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
      });
      // State will be set to LISTENING by the 'start' event handler
    } catch (err) {
      console.error('STT start error:', err);
      setErrorMsg('Could not start voice recognition. Please try again.');
      setState(S.ERROR);
      haptic('heavy');
    }
  };

  // ── Stop STT ────────────────────────────────────────────────────────────────
  const stopListening = () => {
    try {
      ExpoSpeechRecognitionModule.stop();
      // 'end' event will fire and trigger processText
    } catch (err) {
      console.error('STT stop error:', err);
    }
  };

  // ── Core: answer the question ────────────────────────────────────────────────
  const processText = useCallback(async (spokenText) => {
    if (stateRef.current === S.PROCESSING || stateRef.current === S.SPEAKING) return;

    const text = (spokenText || '').trim();
    if (!text) {
      setErrorMsg('No input detected. Please speak or type your question.');
      setState(S.ERROR);
      haptic('heavy');
      return;
    }

    haptic('light');
    setState(S.PROCESSING);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

    let answer = '';
    let src = 'offline';

    try {
      // 1. Try AWS Bedrock RAG if online and backend is up
      if (isOnline && backendUp) {
        const awsResult = await ApiService.queryText(text, i18n.language);
        if (awsResult?.response) {
          answer = awsResult.response;
          src = 'aws';
        }
      }

      // 2. Fall back to on-device knowledge base
      if (!answer) {
        const offlineResult = await EnhancedOfflineService.search(text);
        answer = offlineResult.response || t('errors.processingError');
        src = 'offline';
      }

      setResponse(answer);
      setAnswerSrc(src);
      setQueryCount(c => c + 1);
      setState(S.SPEAKING);

      ApiService.logQuery(text, answer, src).catch(() => {});

      await VoiceService.speak(answer, {
        language:  i18n.language,
        onDone:    () => setState(S.IDLE),
        onError:   () => setState(S.IDLE),
        onStopped: () => setState(S.IDLE),
      });

      haptic('light');
    } catch (err) {
      console.error('processText error:', err);
      setErrorMsg(t('errors.processingError'));
      setState(S.ERROR);
      haptic('heavy');
    }
  }, [isOnline, backendUp, i18n.language]);

  // ── Button config ────────────────────────────────────────────────────────────
  const btn = (() => {
    switch (appState) {
      case S.LISTENING:  return { icon: 'mic',          color: '#3B82F6', label: t('home.listening') };
      case S.PROCESSING: return { icon: 'sync',         color: '#10B981', label: t('home.processing') };
      case S.SPEAKING:   return { icon: 'volume-high',  color: '#F59E0B', label: t('home.speaking') };
      case S.ERROR:      return { icon: 'alert-circle', color: '#DC2626', label: 'Tap to retry' };
      default:           return {
        icon:  sttAvailable ? 'mic-outline' : 'chatbubble-outline',
        color: isOnline ? theme.colors.primary[500] : '#8B5CF6',
        label: isOnline ? t('home.online') : t('home.offline'),
      };
    }
  })();

  const isDisabled = appState === S.PROCESSING;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>{t('app.name')}</Text>
              <Text style={styles.subtitle}>{t('app.tagline')}</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.dot, { backgroundColor: isOnline ? '#10B981' : '#8B5CF6' }]} />
              <Text style={styles.statusText}>
                {isOnline ? (backendUp ? 'AWS + Offline' : t('status.online')) : t('status.offline')}
              </Text>
            </View>
          </View>
        </View>

        {/* Feature pills */}
        <View style={styles.pillsRow}>
          <View style={styles.pill}>
            <Ionicons name="shield-checkmark" size={13} color="#10B981" />
            <Text style={styles.pillText}>On-device AI</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="globe" size={13} color="#6366F1" />
            <Text style={styles.pillText}>11 Languages</Text>
          </View>
          <View style={[styles.pill, backendUp && styles.pillActive]}>
            <Ionicons name={backendUp ? 'cloud' : 'cloud-offline'} size={13} color={backendUp ? '#059669' : '#F59E0B'} />
            <Text style={styles.pillText}>{backendUp ? 'AWS Connected' : 'Offline Mode'}</Text>
          </View>
        </View>

        {/* Voice button */}
        <View style={styles.buttonArea}>
          <Animated.View style={{ transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] }}>
            <TouchableOpacity
              style={[
                styles.voiceBtn,
                { backgroundColor: btn.color },
                (isDisabled || (!sttAvailable && appState !== S.SPEAKING)) && styles.disabled,
              ]}
              onPress={handlePress}
              activeOpacity={0.88}
              disabled={isDisabled}
            >
              <Ionicons name={btn.icon} size={68} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.stateLabel}>{btn.label}</Text>
          {appState === S.IDLE     && sttAvailable  && <Text style={styles.hint}>{t('home.tapToSpeak')}</Text>}
          {appState === S.IDLE     && !sttAvailable && <Text style={styles.hint}>Type your question below</Text>}
          {appState === S.LISTENING                 && <Text style={styles.hint}>{t('home.tapAgain')}</Text>}
          {appState === S.SPEAKING                  && <Text style={styles.hint}>Tap to stop</Text>}
          {queryCount > 0 && appState === S.IDLE && (
            <Text style={styles.queryCount}>{queryCount} question{queryCount !== 1 ? 's' : ''} answered</Text>
          )}
        </View>

        {/* Text input fallback */}
        {!sttAvailable && (
          <View style={styles.textInputRow}>
            <TextInput
              style={styles.textInputField}
              placeholder="Type your question here..."
              placeholderTextColor={theme.colors.text.disabled}
              value={textInput}
              onChangeText={setTextInput}
              onSubmitEditing={handleTextSubmit}
              returnKeyType="send"
              editable={appState === S.IDLE || appState === S.ERROR}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!textInput.trim() || isDisabled) && styles.disabled]}
              onPress={handleTextSubmit}
              disabled={!textInput.trim() || isDisabled}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Live transcript */}
        {appState === S.LISTENING && (partial || transcript) ? (
          <View style={styles.transcriptBox}>
            <Ionicons name="mic" size={14} color="#3B82F6" />
            <Text style={styles.transcriptText} numberOfLines={2}>{partial || transcript}</Text>
          </View>
        ) : null}

        {/* What you asked */}
        {transcript && appState !== S.LISTENING ? (
          <View style={styles.questionBox}>
            <Ionicons name="chatbubble-outline" size={13} color={theme.colors.text.secondary} />
            <Text style={styles.questionText} numberOfLines={2}>"{transcript}"</Text>
          </View>
        ) : null}

        {/* Error */}
        {appState === S.ERROR && errorMsg ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Answer card */}
        {response ? (
          <View style={styles.responseCard}>
            <View style={styles.responseHeader}>
              <View style={[styles.responseIconWrap, { backgroundColor: answerSrc === 'aws' ? '#059669' : theme.colors.primary[500] }]}>
                <Ionicons name={answerSrc === 'aws' ? 'cloud' : 'hardware-chip'} size={14} color="#fff" />
              </View>
              <Text style={styles.responseTitle}>Answer</Text>
              <Text style={styles.sourceTag}>{answerSrc === 'aws' ? 'AWS Bedrock' : 'On-device'}</Text>
              <TouchableOpacity
                onPress={() => VoiceService.speak(response, { language: i18n.language })}
                style={styles.replayBtn}
              >
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
            {DOMAINS.map(item => (
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

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: theme.colors.background.paper },
  scroll: { paddingBottom: 40 },

  header: {
    paddingTop: 20, paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:    { fontSize: 30, fontWeight: '800', color: theme.colors.text.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: theme.colors.text.secondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.background.paper,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: theme.colors.gray[200],
  },
  dot:        { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '600', color: theme.colors.text.secondary },

  pillsRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.default,
  },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: theme.colors.background.paper,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: theme.colors.gray[200],
  },
  pillActive: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  pillText:   { fontSize: 11, fontWeight: '600', color: theme.colors.text.secondary },

  buttonArea: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  voiceBtn: {
    width: 172, height: 172, borderRadius: 86,
    justifyContent: 'center', alignItems: 'center',
    elevation: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16,
  },
  disabled:   { opacity: 0.55 },
  stateLabel: { fontSize: 20, fontWeight: '700', color: theme.colors.text.primary, marginTop: theme.spacing.lg },
  hint:       { fontSize: 14, color: theme.colors.text.secondary, marginTop: 6, textAlign: 'center' },
  queryCount: { fontSize: 12, color: theme.colors.primary[500], marginTop: 8, fontWeight: '600' },

  textInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md,
  },
  textInputField: {
    flex: 1, fontSize: 15, color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: theme.colors.gray[200],
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center', alignItems: 'center',
  },

  transcriptBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.sm,
    padding: 12, backgroundColor: '#EFF6FF',
    borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: '#BFDBFE',
  },
  transcriptText: { flex: 1, fontSize: 14, color: '#1D4ED8', fontStyle: 'italic' },

  questionBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.sm,
    padding: 10, backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
  },
  questionText: { flex: 1, fontSize: 13, color: theme.colors.text.secondary, fontStyle: 'italic' },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md,
    padding: theme.spacing.md, backgroundColor: '#FEF2F2',
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 3, borderLeftColor: '#DC2626',
  },
  errorText: { fontSize: 14, color: '#DC2626', flex: 1 },

  responseCard: {
    marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg, backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.xl, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  responseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: theme.spacing.sm },
  responseIconWrap: {
    width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
  },
  responseTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text.primary, flex: 1 },
  sourceTag:     { fontSize: 10, color: theme.colors.text.disabled, fontWeight: '600' },
  replayBtn:     { padding: 4 },
  responseText:  { fontSize: 15, color: theme.colors.text.primary, lineHeight: 24 },

  domainsSection: { marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: theme.colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: theme.spacing.sm,
  },
  domainsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  domainCard:  { width: '30.5%', padding: 12, borderRadius: theme.borderRadius.lg, alignItems: 'center', gap: 4 },
  domainLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  domainSub:   { fontSize: 10, color: theme.colors.text.secondary, textAlign: 'center' },

  impactSection: { marginHorizontal: theme.spacing.lg },
  statsGrid:     { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.lg, padding: 12,
    alignItems: 'center', gap: 4, elevation: 1,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: theme.colors.primary[500] },
  statLabel: { fontSize: 9, color: theme.colors.text.secondary, textAlign: 'center', lineHeight: 13 },
});
