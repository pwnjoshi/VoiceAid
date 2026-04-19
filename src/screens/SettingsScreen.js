import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changeLanguage, getAvailableLanguages } from '../config/i18n';
import VoiceService from '../services/VoiceService';
import LocalLLMService from '../services/LocalLLMService';
import theme from '../theme';

const REGION_COLORS = {
  'Global':              '#6366F1',
  'South Asia':          '#059669',
  'Africa':              '#D97706',
  'Middle East & Africa':'#DC2626',
  'Latin America':       '#7C3AED',
  'Africa & Global':     '#0891B2',
  'SE Asia':             '#2563EB',
};

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState({
    offlineMode: true,
    batterySaver: false,
    notifications: true,
    voiceSpeed: 'normal',
  });
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [llmInfo, setLlmInfo]         = useState({ downloaded: false, sizeMB: 0, isReady: false, isEnabled: true, isLoading: false });
  const [llmProgress, setLlmProgress] = useState(0);
  const [llmStatus, setLlmStatus]     = useState('');

  useEffect(() => {
    loadSettings();
    loadLlmInfo();
  }, []);

  const loadLlmInfo = async () => {
    await LocalLLMService.loadPreference();
    const info = await LocalLLMService.getModelInfo();
    setLlmInfo(info);
    setLlmStatus(info.isReady ? 'Ready' : info.downloaded ? 'Downloaded, not loaded' : 'Not downloaded');
  };

  const handleLlmToggle = async (enabled) => {
    await LocalLLMService.setEnabled(enabled);
    const info = await LocalLLMService.getModelInfo();
    setLlmInfo(info);
    if (!enabled) setLlmStatus('Disabled');
  };

  const handleLlmDownload = async () => {
    Alert.alert(
      'Download TinyLlama (600MB)',
      'This downloads the TinyLlama 1.1B AI model. Use WiFi. Once downloaded, VoiceAid will use it for all offline conversations.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download on WiFi',
          onPress: async () => {
            LocalLLMService.onProgress = (pct) => setLlmProgress(pct);
            LocalLLMService.onStatusChange = (s) => setLlmStatus(s);
            const ok = await LocalLLMService.initialize();
            const info = await LocalLLMService.getModelInfo();
            setLlmInfo(info);
            setLlmProgress(0);
            if (ok) {
              setLlmStatus('Ready — TinyLlama active');
              Alert.alert('Ready', 'TinyLlama is loaded. All voice conversations now use on-device AI.');
            } else {
              setLlmStatus('Failed — check connection');
              Alert.alert('Failed', 'Could not download or load the model. Check your internet connection and try again.');
            }
          },
        },
      ]
    );
  };

  const handleLlmDelete = () => {
    Alert.alert(
      'Delete Model',
      `Delete TinyLlama (${llmInfo.sizeMB}MB) from device? You can re-download it later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await LocalLLMService.deleteModel();
            const info = await LocalLLMService.getModelInfo();
            setLlmInfo(info);
            setLlmStatus('Deleted');
          },
        },
      ]
    );
  };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('@voiceaid:settings');
      if (stored) setSettings(JSON.parse(stored));
    } catch (e) { console.error(e); }
  };

  const saveSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem('@voiceaid:settings', JSON.stringify(newSettings));
    } catch (e) { console.error(e); }
  };

  const handleVoiceSpeedChange = () => {
    Alert.alert(t('settings.voiceSpeed'), '', [
      { text: t('settings.slow'),   onPress: async () => { await VoiceService.setSpeed('slow');   saveSettings({ ...settings, voiceSpeed: 'slow' }); } },
      { text: t('settings.normal'), onPress: async () => { await VoiceService.setSpeed('normal'); saveSettings({ ...settings, voiceSpeed: 'normal' }); } },
      { text: t('settings.fast'),   onPress: async () => { await VoiceService.setSpeed('fast');   saveSettings({ ...settings, voiceSpeed: 'fast' }); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const languages = getAvailableLanguages();
  const currentLang = languages.find(l => l.code === i18n.language);

  // Group languages by region
  const regions = {};
  languages.forEach(lang => {
    if (!regions[lang.region]) regions[lang.region] = [];
    regions[lang.region].push(lang);
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.title')}</Text>
          <Text style={styles.subtitle}>Customize your VoiceAid experience</Text>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <TouchableOpacity style={styles.item} onPress={() => setShowLangPicker(!showLangPicker)}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="language" size={20} color={theme.colors.primary[500]} />
              </View>
              <View>
                <Text style={styles.itemText}>{t('settings.language')}</Text>
                <Text style={styles.itemDesc}>{currentLang?.nativeName} — {currentLang?.region}</Text>
              </View>
            </View>
            <Ionicons
              name={showLangPicker ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={theme.colors.gray[400]}
            />
          </TouchableOpacity>

          {showLangPicker && (
            <View style={styles.langPicker}>
              {Object.entries(regions).map(([region, langs]) => (
                <View key={region}>
                  <Text style={styles.regionLabel}>{region}</Text>
                  {langs.map(lang => (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.langRow,
                        i18n.language === lang.code && styles.langRowActive,
                      ]}
                      onPress={() => { changeLanguage(lang.code); setShowLangPicker(false); }}
                    >
                      <View style={[styles.regionDot, { backgroundColor: REGION_COLORS[region] || '#6366F1' }]} />
                      <Text style={styles.langNative}>{lang.nativeName}</Text>
                      <Text style={styles.langName}>{lang.name}</Text>
                      {i18n.language === lang.code && (
                        <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary[500]} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Voice */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice</Text>
          <TouchableOpacity style={styles.item} onPress={handleVoiceSpeedChange}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="speedometer" size={20} color="#059669" />
              </View>
              <Text style={styles.itemText}>{t('settings.voiceSpeed')}</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemValue}>{t(`settings.${settings.voiceSpeed}`)}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.gray[400]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>

          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="cloud-offline" size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.itemText}>{t('settings.offlineMode')}</Text>
                <Text style={styles.itemDesc}>{t('settings.offlineModeDesc')}</Text>
              </View>
            </View>
            <Switch
              value={settings.offlineMode}
              onValueChange={v => saveSettings({ ...settings, offlineMode: v })}
              trackColor={{ true: theme.colors.primary[500] }}
            />
          </View>

          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="battery-charging" size={20} color="#D97706" />
              </View>
              <View>
                <Text style={styles.itemText}>{t('settings.batterySaver')}</Text>
                <Text style={styles.itemDesc}>{t('settings.batterySaverDesc')}</Text>
              </View>
            </View>
            <Switch
              value={settings.batterySaver}
              onValueChange={v => saveSettings({ ...settings, batterySaver: v })}
              trackColor={{ true: theme.colors.primary[500] }}
            />
          </View>

          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="notifications" size={20} color="#7C3AED" />
              </View>
              <View>
                <Text style={styles.itemText}>{t('settings.notifications')}</Text>
                <Text style={styles.itemDesc}>{t('settings.notificationsDesc')}</Text>
              </View>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={v => saveSettings({ ...settings, notifications: v })}
              trackColor={{ true: theme.colors.primary[500] }}
            />
          </View>
        </View>

        {/* Local LLM */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local AI Model</Text>

          {/* Enable/disable toggle */}
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="hardware-chip" size={20} color="#7C3AED" />
              </View>
              <View>
                <Text style={styles.itemText}>TinyLlama 1.1B</Text>
                <Text style={styles.itemDesc}>On-device conversational AI</Text>
              </View>
            </View>
            <Switch
              value={llmInfo.isEnabled}
              onValueChange={handleLlmToggle}
              trackColor={{ true: '#7C3AED' }}
            />
          </View>

          {/* Status + action */}
          {llmInfo.isEnabled && (
            <View style={styles.llmCard}>
              {/* Status row */}
              <View style={styles.llmStatusRow}>
                <View style={[styles.llmDot, {
                  backgroundColor: llmInfo.isReady ? '#10B981' : llmInfo.downloaded ? '#F59E0B' : '#9CA3AF'
                }]} />
                <Text style={styles.llmStatusText}>{llmStatus || (llmInfo.isReady ? 'Ready' : llmInfo.downloaded ? 'Downloaded' : 'Not downloaded')}</Text>
              </View>

              {/* Progress bar */}
              {llmInfo.isLoading && llmProgress > 0 && (
                <View style={styles.llmProgressWrap}>
                  <View style={[styles.llmProgressBar, { width: `${llmProgress}%` }]} />
                  <Text style={styles.llmProgressText}>{llmProgress}%</Text>
                </View>
              )}

              {/* Info */}
              <Text style={styles.llmInfo}>
                {llmInfo.isReady
                  ? `Model loaded (${llmInfo.sizeMB}MB) — all voice queries use TinyLlama`
                  : llmInfo.downloaded
                  ? `Model on device (${llmInfo.sizeMB}MB) — will load on next query`
                  : 'Model not downloaded. ~600MB required. WiFi recommended.'}
              </Text>

              {/* Action buttons */}
              <View style={styles.llmActions}>
                {!llmInfo.downloaded && (
                  <TouchableOpacity
                    style={[styles.llmBtn, styles.llmBtnPrimary]}
                    onPress={handleLlmDownload}
                    disabled={llmInfo.isLoading}
                  >
                    <Ionicons name="download-outline" size={16} color="#fff" />
                    <Text style={styles.llmBtnText}>
                      {llmInfo.isLoading ? `Downloading ${llmProgress}%` : 'Download Model'}
                    </Text>
                  </TouchableOpacity>
                )}
                {llmInfo.downloaded && !llmInfo.isReady && (
                  <TouchableOpacity
                    style={[styles.llmBtn, styles.llmBtnPrimary]}
                    onPress={async () => {
                      LocalLLMService.onStatusChange = (s) => setLlmStatus(s);
                      await LocalLLMService.initialize();
                      const info = await LocalLLMService.getModelInfo();
                      setLlmInfo(info);
                    }}
                    disabled={llmInfo.isLoading}
                  >
                    <Ionicons name="play-outline" size={16} color="#fff" />
                    <Text style={styles.llmBtnText}>Load Model</Text>
                  </TouchableOpacity>
                )}
                {llmInfo.isReady && (
                  <TouchableOpacity
                    style={[styles.llmBtn, styles.llmBtnSecondary]}
                    onPress={async () => {
                      await LocalLLMService.release();
                      const info = await LocalLLMService.getModelInfo();
                      setLlmInfo(info);
                      setLlmStatus('Released from memory');
                    }}
                  >
                    <Ionicons name="stop-outline" size={16} color="#7C3AED" />
                    <Text style={[styles.llmBtnText, { color: '#7C3AED' }]}>Release</Text>
                  </TouchableOpacity>
                )}
                {llmInfo.downloaded && (
                  <TouchableOpacity
                    style={[styles.llmBtn, styles.llmBtnDanger]}
                    onPress={handleLlmDelete}
                  >
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    <Text style={[styles.llmBtnText, { color: '#DC2626' }]}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutName}>VoiceAid</Text>
            <Text style={styles.aboutTagline}>Voice-first AI for the digitally excluded</Text>
            <View style={styles.aboutStats}>
              <View style={styles.aboutStat}>
                <Text style={styles.aboutStatNum}>11</Text>
                <Text style={styles.aboutStatLabel}>Languages</Text>
              </View>
              <View style={styles.aboutStatDivider} />
              <View style={styles.aboutStat}>
                <Text style={styles.aboutStatNum}>700M+</Text>
                <Text style={styles.aboutStatLabel}>Target users</Text>
              </View>
              <View style={styles.aboutStatDivider} />
              <View style={styles.aboutStat}>
                <Text style={styles.aboutStatNum}>100%</Text>
                <Text style={styles.aboutStatLabel}>Offline</Text>
              </View>
            </View>
            <Text style={styles.aboutVersion}>Version 1.0.0  •  AWS 10,000 AIdeas Finalist</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background.paper },
  header: {
    padding: theme.spacing.lg,
    paddingTop: 20,
    backgroundColor: theme.colors.background.default,
  },
  title: { fontSize: 26, fontWeight: '800', color: theme.colors.text.primary, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: theme.colors.text.secondary, marginTop: 3 },
  section: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
    paddingVertical: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 14 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  itemText: { fontSize: 15, fontWeight: '600', color: theme.colors.text.primary },
  itemDesc: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 1 },
  itemValue: { fontSize: 14, color: theme.colors.text.secondary },

  // LLM card
  llmCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: 14,
    backgroundColor: '#FAFAFA',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  llmStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  llmDot: { width: 8, height: 8, borderRadius: 4 },
  llmStatusText: { fontSize: 13, fontWeight: '600', color: theme.colors.text.primary },
  llmProgressWrap: {
    height: 6, backgroundColor: '#E9D5FF', borderRadius: 3,
    marginBottom: 8, overflow: 'hidden', position: 'relative',
  },
  llmProgressBar: { height: '100%', backgroundColor: '#7C3AED', borderRadius: 3 },
  llmProgressText: { fontSize: 11, color: '#7C3AED', fontWeight: '700', marginTop: 2 },
  llmInfo: { fontSize: 12, color: theme.colors.text.secondary, lineHeight: 18, marginBottom: 12 },
  llmActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  llmBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  llmBtnPrimary: { backgroundColor: '#7C3AED' },
  llmBtnSecondary: { backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#7C3AED' },
  llmBtnDanger: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#DC2626' },
  llmBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  // Language picker
  langPicker: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  regionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 6,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 2,
  },
  langRowActive: { backgroundColor: theme.colors.primary[50] },
  regionDot: { width: 8, height: 8, borderRadius: 4 },
  langNative: { fontSize: 15, fontWeight: '600', color: theme.colors.text.primary, flex: 1 },
  langName: { fontSize: 12, color: theme.colors.text.secondary },

  // About card
  aboutCard: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  aboutName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  aboutTagline: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  aboutStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  aboutStat: { alignItems: 'center', paddingHorizontal: 20 },
  aboutStatNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
  aboutStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  aboutStatDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.3)' },
  aboutVersion: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
});
