/**
 * HomeScreen â€” Gemini-style Voice Assistant
 *
 * - Auto-starts listening when app opens
 * - Replies as soon as user stops talking (continuous: false)
 * - Clean minimal UI â€” mic button center stage
 * - Text input fallback when STT unavailable (Expo Go)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import NetInfo from '@react-native-community/netinfo';

import VoiceService from '../services/VoiceService';
import EnhancedOfflineService from '../services/EnhancedOfflineService';
import ApiService from '../services/ApiService';
import ConversationMemory from '../services/ConversationMemory';
import ScamGuardService from '../services/ScamGuardService';
import RAGService from '../services/RAGService';
import AnalyticsService from '../services/AnalyticsService';

// Lazy-load LocalLLMService
let LocalLLMService = null;
try { LocalLLMService = require('../services/LocalLLMService').default; } catch {}

// â”€â”€ Safe STT import â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let ExpoSpeechRecognitionModule = null;
let useSpeechRecognitionEvent = (_e, _cb) => {};
try {
  const stt = require('expo-speech-recognition');
  if (stt?.ExpoSpeechRecognitionModule) {
    ExpoSpeechRecognitionModule = stt.ExpoSpeechRecognitionModule;
    useSpeechRecognitionEvent = stt.useSpeechRecognitionEvent;
  }
} catch { /* Expo Go â€” text input fallback */ }

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const S = {
  IDLE:       'idle',
  LISTENING:  'listening',
  PROCESSING: 'processing',
  SPEAKING:   'speaking',
};

const LOCALE_MAP = {
  en: 'en-US', hi: 'hi-IN', mr: 'mr-IN',
  ta: 'ta-IN', bn: 'bn-IN', te: 'te-IN',
  sw: 'sw-KE', ar: 'ar-SA', es: 'es-ES',
  fr: 'fr-FR', id: 'id-ID',
};

// Language display names for the quick switcher
const LANG_LABELS = {
  en: 'EN', hi: 'à¤¹à¤¿', mr: 'à¤®', ta: 'à®¤', bn: 'à¦¬à¦¾',
  te: 'à°¤à±†', sw: 'SW', ar: 'Ø¹', es: 'ES', fr: 'FR', id: 'ID',
};

// Language names for TTS instruction in system prompt
const LANG_NAMES = {
  en: 'English', hi: 'Hindi', mr: 'Marathi', ta: 'Tamil', bn: 'Bengali',
  te: 'Telugu', sw: 'Swahili', ar: 'Arabic', es: 'Spanish', fr: 'French', id: 'Indonesian',
};

// Quick-access languages shown on home screen
const QUICK_LANGS = ['en', 'hi', 'bn', 'ta', 'sw'];

const STATE_CONFIG = {
  [S.IDLE]:       { color: '#6366F1', icon: 'mic-outline',         label: 'Tap to speak' },
  [S.LISTENING]:  { color: '#3B82F6', icon: 'mic',                 label: 'Listening...' },
  [S.PROCESSING]: { color: '#10B981', icon: 'ellipsis-horizontal', label: 'Thinking...' },
  [S.SPEAKING]:   { color: '#F59E0B', icon: 'mic-outline',         label: 'Tap to interrupt' },
};

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function HomeScreen() {
  const { t, i18n } = useTranslation();

  const [state,       setState_]    = useState(S.IDLE);
  const [isOnline,    setIsOnline]  = useState(false);
  const [backendUp,   setBackendUp] = useState(false);
  const [transcript,  setTranscript]= useState('');
  const [partial,     setPartial]   = useState('');
  const [response,    setResponse]  = useState('');
  const [answerSrc,   setAnswerSrc] = useState('');
  const [errorMsg,    setErrorMsg]  = useState('');
  const [textInput,   setTextInput] = useState('');
  const [sttReady,    setSttReady]  = useState(!!ExpoSpeechRecognitionModule);
  const [inputFocused, setInputFocused] = useState(false);
  const [llmReady,    setLlmReady]  = useState(false);
  // activeLang: the language for voice I/O â€” can differ from UI language
  const [activeLang,  setActiveLang] = useState(i18n.language || 'en');

  const stateRef        = useRef(S.IDLE);
  const finalTextRef    = useRef('');
  const partialRef      = useRef('');
  const autoStarted     = useRef(false);
  const inputRef        = useRef(null);
  const silenceTimer    = useRef(null);
  const userStoppedRef  = useRef(false);
  const bargeInActiveRef = useRef(false); // true when STT is running during TTS

  // Animations
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const pulseLoop  = useRef(null);
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(20)).current;

  const sttLocale = LOCALE_MAP[activeLang] || 'en-US';
  const activeLangRef = useRef(activeLang);
  useEffect(() => { activeLangRef.current = activeLang; }, [activeLang]);
  const sttLocaleRef = useRef(sttLocale);
  useEffect(() => { sttLocaleRef.current = LOCALE_MAP[activeLang] || 'en-US'; }, [activeLang]);

  const setState = (s) => { stateRef.current = s; setState_(s); };

  // â”€â”€ STT events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useSpeechRecognitionEvent('start', () => {
    // Don't change state to LISTENING during barge-in (we're still SPEAKING)
    if (!bargeInActiveRef.current) {
      setState(S.LISTENING);
    }
    clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      if (stateRef.current === S.LISTENING) {
        ExpoSpeechRecognitionModule?.stop();
        setState(S.IDLE);
      }
      bargeInActiveRef.current = false;
    }, 8000);
  });

  useSpeechRecognitionEvent('end', () => {
    clearTimeout(silenceTimer.current);
    bargeInActiveRef.current = false;
    if (stateRef.current === S.LISTENING) {
      const text = finalTextRef.current;
      if (text) {
        processText(text);
      } else {
        setState(S.IDLE);
      }
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript || '';
    if (event.isFinal) {
      clearTimeout(silenceTimer.current);
      finalTextRef.current = text;
      partialRef.current = '';
      setTranscript(text);
      setPartial('');

      // â”€â”€ Barge-in: user spoke while app was speaking â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      if (bargeInActiveRef.current) {
        bargeInActiveRef.current = false;
        VoiceService.stop().then(() => {
          setState(S.IDLE);
          if (text) processText(text);
        });
        return;
      }

      if (stateRef.current === S.LISTENING) processText(text);
    } else {
      setPartial(text);
      partialRef.current = text;
      clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        if (stateRef.current === S.LISTENING) {
          ExpoSpeechRecognitionModule?.stop();
        }
        bargeInActiveRef.current = false;
      }, 3000);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    clearTimeout(silenceTimer.current);
    bargeInActiveRef.current = false;
    const code = event.error || '';
    if (code === 'not-allowed' || code === 'service-not-allowed') {
      setSttReady(false);
    }
    setPartial('');
    if (stateRef.current === S.LISTENING) {
      setState(S.IDLE);
    }
  });

  // â”€â”€ Network â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const unsub = NetInfo.addEventListener(async (s) => {
      const online = !!s.isConnected;
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

  // â”€â”€ Auto-init TinyLlama if enabled and downloaded â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!LocalLLMService) return;
    (async () => {
      await LocalLLMService.loadPreference();
      if (LocalLLMService.isEnabled) {
        const downloaded = await LocalLLMService.isModelDownloaded();
        if (downloaded && !LocalLLMService.isReady) {
          // Model already downloaded â€” load it silently
          const ok = await LocalLLMService.initialize();
          setLlmReady(ok);
        } else {
          setLlmReady(LocalLLMService.isReady);
        }
      }
    })();
  }, []);
  useEffect(() => {
    if (!autoStarted.current && sttReady) {
      autoStarted.current = true;
      setTimeout(() => startListening(), 600);
    }
    return () => {
      clearTimeout(silenceTimer.current);
    };
  }, [sttReady]);

  // â”€â”€ Pulse animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (state === S.LISTENING) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.28, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else if (state === S.SPEAKING) {
      // Gentle slow pulse during speaking â€” shows it's interruptible
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 1200, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else if (state === S.PROCESSING) {
      pulseLoop.current?.stop();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.95, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseLoop.current?.stop();
      Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [state]);

  // â”€â”€ Fade-in answer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const showAnswer = (text) => {
    fadeAnim.setValue(0);
    slideAnim.setValue(16);
    setResponse(text);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  // â”€â”€ Haptic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const haptic = (type = 'medium') => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(
      type === 'light' ? Haptics.ImpactFeedbackStyle.Light :
      type === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy :
      Haptics.ImpactFeedbackStyle.Medium
    ).catch(() => {});
  };

  // â”€â”€ Start STT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const startListening = async () => {
    if (!ExpoSpeechRecognitionModule || !sttReady) return;
    if (stateRef.current === S.LISTENING || stateRef.current === S.PROCESSING) return;

    setErrorMsg('');
    setPartial('');
    finalTextRef.current = '';
    haptic('medium');

    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) { setSttReady(false); return; }

      ExpoSpeechRecognitionModule.start({
        lang:            sttLocaleRef.current,
        interimResults:  true,
        maxAlternatives: 1,
        continuous:      false,   // stops after user pauses â€” like Gemini
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
      });
    } catch (err) {
      console.error('STT start:', err);
      setState(S.IDLE);
    }
  };

  // â”€â”€ Stop STT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const stopListening = () => {
    if (!ExpoSpeechRecognitionModule) return;
    try { ExpoSpeechRecognitionModule.stop(); } catch {}
  };

  // â”€â”€ Mic button press â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleMicPress = async () => {
    haptic('medium');

    // If STT not available â†’ focus text input
    if (!sttReady) {
      setInputFocused(true);
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    if (state === S.SPEAKING) {
      // Stop TTS immediately and start listening
      bargeInActiveRef.current = false;
      clearTimeout(silenceTimer.current);
      try { ExpoSpeechRecognitionModule?.stop(); } catch {}
      await VoiceService.stop();
      setState(S.IDLE);
      setResponse('');
      setTranscript('');
      setPartial('');
      finalTextRef.current = '';
      partialRef.current = '';
      // Start listening right away
      setTimeout(() => startListening(), 200);
    } else if (state === S.LISTENING) {
      clearTimeout(silenceTimer.current);
      setState(S.IDLE);
      userStoppedRef.current = true;
      try { ExpoSpeechRecognitionModule?.stop(); } catch {}
      const text = finalTextRef.current || partialRef.current;
      if (text) setTimeout(() => processText(text), 100);
    } else if (state === S.IDLE) {
      setResponse('');
      setTranscript('');
      setErrorMsg('');
      userStoppedRef.current = false;
      startListening();
    }
  };

  // â”€â”€ Text submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleTextSubmit = () => {
    const text = textInput.trim();
    if (!text) return;
    setTranscript(text);
    setTextInput('');
    processText(text);
  };

  // â”€â”€ Answer the question â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const processText = useCallback(async (spokenText) => {
    if (stateRef.current === S.PROCESSING || stateRef.current === S.SPEAKING) return;
    const text = (spokenText || '').trim();
    if (!text) { setState(S.IDLE); return; }

    const startTime = Date.now();
    haptic('light');
    setState(S.PROCESSING);

    // â”€â”€ Scam Guard â€” runs FIRST, before any AI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const scamCheck = ScamGuardService.check(text);
    if (scamCheck.isScam) {
      await ScamGuardService.triggerWarning(i18n.language, text);
      AnalyticsService.recordScamBlocked();
      const warning = i18n.language === 'hi'
        ? 'à¤°à¥à¤•à¤¿à¤! à¤¯à¤¹ à¤§à¥‹à¤–à¤¾ à¤¹à¥‹ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤«à¥‹à¤¨ à¤•à¤¾à¤Ÿà¤¿à¤à¥¤'
        : 'STOP! This may be a scam. Hang up now.';
      showAnswer(warning);
      setAnswerSrc('scam-guard');
      setTranscript(text);
      setState(S.SPEAKING);
      await VoiceService.speak(warning, {
        language: i18n.language,
        onDone:    () => { setState(S.IDLE); setTimeout(() => startListening(), 600); },
        onError:   () => setState(S.IDLE),
        onStopped: () => setState(S.IDLE),
      });
      return;
    }

    let answer = '';
    let src = 'offline';

    try {
      // â”€â”€ Path 1: TinyLlama streaming with RAG context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      if (LocalLLMService?.isReady && LocalLLMService.isEnabled) {
        src = 'tinyllama-local';
        setState(S.SPEAKING);

        // RAG: get relevant knowledge chunks to ground the response
        const { context } = RAGService.buildContext(text);
        const augmentedQuery = context
          ? `Relevant knowledge:\n${context}\n\nQuestion: ${text}`
          : text;

        const sentences = [];
        let firstSentenceSpoken = false;

        const fullAnswer = await LocalLLMService.generateStreaming(augmentedQuery, async (sentence) => {
          sentences.push(sentence);
          answer += (answer ? ' ' : '') + sentence;
          showAnswer(answer);
          setAnswerSrc(src);

          if (!firstSentenceSpoken) {
            firstSentenceSpoken = true;
            VoiceService.speakSentence(sentence, activeLangRef.current).then(() => {
              (async () => {
                for (let i = 1; i < sentences.length; i++) {
                  if (stateRef.current !== S.SPEAKING) break;
                  await VoiceService.speakSentence(sentences[i], activeLangRef.current);
                }
                if (stateRef.current === S.SPEAKING) {
                  setState(S.IDLE);
                  setTimeout(() => { if (stateRef.current === S.IDLE) startListening(); }, 600);
                }
              })();
            });
          }
        }, activeLangRef.current);

        setTranscript(text);
        const latency = Date.now() - startTime;
        AnalyticsService.recordQuery({ source: src, latencyMs: latency, language: activeLangRef.current });
        ApiService.logQuery(text, fullAnswer, src).catch(() => {});
        haptic('light');
        return;
      }

      // â”€â”€ Path 2: AWS Bedrock â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      if (isOnline && backendUp) {
        const aws = await ApiService.queryText(text, i18n.language);
        if (aws?.response) { answer = aws.response; src = 'aws'; }
      }

      // â”€â”€ Path 3: On-device knowledge base â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      if (!answer) {
        const off = await EnhancedOfflineService.search(text);
        answer = off.response || 'I could not find an answer. Please try again.';
        src = 'offline';
      }

      showAnswer(answer);
      setAnswerSrc(src);
      setTranscript(text);
      setState(S.SPEAKING);
      const latency = Date.now() - startTime;
      AnalyticsService.recordQuery({ source: src, latencyMs: latency, language: activeLangRef.current });
      ApiService.logQuery(text, answer, src).catch(() => {});
      ConversationMemory.add('user', text).catch(() => {});
      ConversationMemory.add('assistant', answer).catch(() => {});

      await VoiceService.speak(answer, {
        language:  activeLangRef.current,
        onDone:    () => {
          setState(S.IDLE);
          // Ask 'Did that help?' follow-up in user's language
          setTimeout(() => {
            if (stateRef.current !== S.IDLE) return;
            const followUp = activeLangRef.current === 'hi' ? 'क्या इससे मदद मिली?' : activeLangRef.current === 'sw' ? 'Je hiyo ilisaidia?' : 'Did that help?';
            VoiceService.speak(followUp, { language: activeLangRef.current, rate: 0.85, onDone: () => { setState(S.IDLE); setTimeout(() => startListening(), 400); }, onError: () => { setState(S.IDLE); setTimeout(() => startListening(), 400); } });
          }, 800);
        },
        onError:   () => { setState(S.IDLE); },
        onStopped: () => { setState(S.IDLE); },
      });

      haptic('light');
    } catch (err) {
      console.error('processText:', err);
      setState(S.IDLE);
    }
  }, [isOnline, backendUp, i18n.language, sttReady, sttLocale]);

  // â”€â”€ Derived â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const cfg        = STATE_CONFIG[state];
  const isActive   = state === S.LISTENING || state === S.PROCESSING;
  const liveText   = partial || (state === S.LISTENING ? '' : transcript);

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >

        {/* â”€â”€ Top bar â”€â”€ */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.appName}>VoiceAid</Text>
            <Text style={styles.appSub}>AI Voice Assistant</Text>
          </View>
          <View style={styles.topBarRight}>
            {llmReady && (
              <View style={styles.llmBadge}>
                <Ionicons name="hardware-chip" size={11} color="#7C3AED" />
                <Text style={styles.llmBadgeText}>TinyLlama</Text>
              </View>
            )}
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#9CA3AF' }]} />
              <Text style={styles.statusText}>
                {isOnline ? (backendUp ? 'AWS' : 'Online') : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        {/* Language switcher */}
        <View style={styles.langRow}>
          {['en', 'hi', 'bn', 'ta', 'sw'].map(lang => (
            <TouchableOpacity
              key={lang}
              style={[styles.langBtn, activeLang === lang && styles.langBtnActive]}
              onPress={() => { setActiveLang(lang); if (i18n.language !== lang) i18n.changeLanguage(lang); }}
            >
              <Text style={[styles.langBtnText, activeLang === lang && styles.langBtnTextActive]}>
                {{"en":"EN","hi":"हि","bn":"বা","ta":"த","sw":"SW"}[lang]}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.langMoreBtn} onPress={() => {
            const all = ['mr','te','ar','es','fr','id'];
            const cur = all.indexOf(activeLang);
            const next = cur >= 0 ? all[(cur+1)%all.length] : all[0];
            setActiveLang(next); i18n.changeLanguage(next);
          }}>
            <Ionicons name="globe-outline" size={14} color="#6B7280" />
            <Text style={styles.langMoreText}>{['mr','te','ar','es','fr','id'].includes(activeLang) ? {"mr":"म","te":"తె","ar":"ع","es":"ES","fr":"FR","id":"ID"}[activeLang] : "More"}</Text>
          </TouchableOpacity>
        </View>

        {/* â”€â”€ Live transcript â”€â”€ */}
        <View style={styles.transcriptArea}>
          {liveText ? (
            <Text style={[
              styles.transcriptText,
              state === S.LISTENING && styles.transcriptLive,
            ]} numberOfLines={3}>
              {liveText}
            </Text>
          ) : (
            <Text style={styles.transcriptPlaceholder}>
              {state === S.IDLE && !response
                ? sttReady ? 'Listening for your question...' : 'Type your question below'
                : state === S.PROCESSING ? 'Processing...'
                : state === S.SPEAKING ? 'Speaking...'
                : ''}
            </Text>
          )}
        </View>

        {/* â”€â”€ Mic button â”€â”€ */}
        <View style={styles.micArea}>
          {/* Outer ring â€” when listening OR speaking (tap to interrupt) */}
          {(state === S.LISTENING || state === S.SPEAKING) && (
            <Animated.View
              style={[
                styles.micRing,
                { transform: [{ scale: pulseAnim }], borderColor: cfg.color + '40' },
              ]}
            />
          )}

          <Animated.View style={{ transform: [{ scale: state === S.LISTENING ? pulseAnim : new Animated.Value(1) }] }}>
            <TouchableOpacity
              style={[styles.micBtn, { backgroundColor: cfg.color }]}
              onPress={handleMicPress}
              activeOpacity={0.85}
              disabled={state === S.PROCESSING}
            >
              <Ionicons name={cfg.icon} size={52} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <Text style={[styles.micLabel, { color: cfg.color }]}>{cfg.label}</Text>

          {/* Stop hint */}
          {state === S.LISTENING && (
            <Text style={styles.stopHint}>Tap to stop</Text>
          )}
          {state === S.SPEAKING && (
            <Text style={styles.stopHint}>Tap mic to interrupt</Text>
          )}
        </View>

        {/* â”€â”€ Text input fallback â”€â”€ */}
        {!sttReady && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputField}
              placeholder="Ask anything..."
              placeholderTextColor="#9CA3AF"
              value={textInput}
              onChangeText={setTextInput}
              onSubmitEditing={handleTextSubmit}
              returnKeyType="send"
              editable={state === S.IDLE}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !textInput.trim() && styles.sendBtnDisabled]}
              onPress={handleTextSubmit}
              disabled={!textInput.trim() || state !== S.IDLE}
            >
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* â”€â”€ Error â”€â”€ */}
        {errorMsg ? (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* â”€â”€ Answer card â”€â”€ */}
        {response ? (
          <Animated.View
            style={[
              styles.answerCard,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Source badge */}
            <View style={styles.answerMeta}>
              <View style={[styles.sourceBadge, {
                backgroundColor: answerSrc === 'aws' ? '#ECFDF5' : answerSrc === 'tinyllama-local' ? '#F5F3FF' : '#EEF2FF'
              }]}>
                <Ionicons
                  name={answerSrc === 'aws' ? 'cloud-outline' : answerSrc === 'tinyllama-local' ? 'hardware-chip-outline' : 'hardware-chip-outline'}
                  size={12}
                  color={answerSrc === 'aws' ? '#059669' : answerSrc === 'tinyllama-local' ? '#7C3AED' : '#6366F1'}
                />
                <Text style={[styles.sourceText, {
                  color: answerSrc === 'aws' ? '#059669' : answerSrc === 'tinyllama-local' ? '#7C3AED' : '#6366F1'
                }]}>
                  {answerSrc === 'aws' ? 'AWS Bedrock' : answerSrc === 'tinyllama-local' ? 'TinyLlama' : 'On-device AI'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => VoiceService.speak(response, { language: activeLangRef.current })}
                style={styles.replayBtn}
              >
                <Ionicons name="volume-medium-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.answerText}>{response}</Text>

            {/* What was asked */}
            {transcript ? (
              <Text style={styles.questionText}>"{transcript}"</Text>
            ) : null}
          </Animated.View>
        ) : null}

        {/* â”€â”€ Domain chips â”€â”€ */}
        {!response && state === S.IDLE && (
          <View style={styles.chipsSection}>
            <Text style={styles.chipsLabel}>Ask about</Text>
            <View style={styles.chipsRow}>
              {[
                { icon: 'leaf',             label: 'Farming',   color: '#059669', bg: '#ECFDF5', q: 'How do I control pests on my crops?' },
                { icon: 'medical',          label: 'Health',    color: '#DC2626', bg: '#FEF2F2', q: 'What should I do for fever?' },
                { icon: 'shield-checkmark', label: 'Safety',    color: '#2563EB', bg: '#EFF6FF', q: 'How to protect from OTP scams?' },
                { icon: 'cash',             label: 'Finance',   color: '#D97706', bg: '#FFFBEB', q: 'How to save money safely?' },
              ].map(item => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.chip, { backgroundColor: item.bg }]}
                  onPress={() => {
                    setTranscript(item.q);
                    processText(item.q);
                  }}
                >
                  <Ionicons name={item.icon} size={16} color={item.color} />
                  <Text style={[styles.chipText, { color: item.color }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { flexGrow: 1, paddingBottom: 32 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  appName: { fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  appSub:  { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  llmBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F5F3FF', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, borderColor: '#E9D5FF',
  },
  llmBadgeText: { fontSize: 10, fontWeight: '700', color: '#7C3AED' },

  // Language switcher
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexWrap: 'wrap',
  },
  langBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1.5,
    borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  langBtnActive: {
    borderColor: '#6366F1', backgroundColor: '#EEF2FF',
  },
  langBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  langBtnTextActive: { color: '#6366F1' },
  langMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1.5,
    borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  langMoreText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },

  // Transcript
  transcriptArea: {
    minHeight: 72,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  transcriptText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 26,
  },
  transcriptLive: {
    color: '#3B82F6',
    fontStyle: 'italic',
  },
  transcriptPlaceholder: {
    fontSize: 15,
    color: '#D1D5DB',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Mic
  micArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    position: 'relative',
  },
  micRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
  },
  micBtn: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  micLabel: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  stopHint: {
    marginTop: 6,
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Text input fallback
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center', alignItems: 'center',
    elevation: 2,
  },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' },

  // Error
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 24,
    marginBottom: 8,
  },
  errorText: { fontSize: 13, color: '#EF4444' },

  // Answer card
  answerCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  answerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sourceText: { fontSize: 11, fontWeight: '700' },
  replayBtn:  { padding: 4 },
  answerText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 26,
    fontWeight: '400',
  },
  questionText: {
    marginTop: 12,
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  // Domain chips
  chipsSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  chipsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
});







