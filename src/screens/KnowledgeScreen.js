import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Speech from 'expo-speech';
import EnhancedOfflineService from '../services/EnhancedOfflineService';
import theme from '../theme';

const CATEGORIES = [
  {
    id: 'agriculture',
    icon: 'leaf',
    color: '#059669',
    bg: '#ECFDF5',
    queries: [
      'Rice planting tips', 'Cassava harvest',
      'Pest control corn', 'Banana diseases',
      'Groundnut fertilizer', 'Sorghum drought',
    ],
  },
  {
    id: 'health',
    icon: 'medical',
    color: '#DC2626',
    bg: '#FEF2F2',
    queries: [
      'Fever treatment', 'Diarrhea ORS',
      'Malaria prevention', 'Tuberculosis symptoms',
      'Diabetes management', 'Malnutrition children',
    ],
  },
  {
    id: 'safety',
    icon: 'shield-checkmark',
    color: '#2563EB',
    bg: '#EFF6FF',
    queries: [
      'OTP scam warning', 'Mobile money fraud',
      'Emergency numbers', 'Fake job scam',
      'Investment fraud', 'Phishing links',
    ],
  },
  {
    id: 'livelihoods',
    icon: 'cash',
    color: '#D97706',
    bg: '#FFFBEB',
    queries: [
      'Mobile banking safety', 'How to save money',
      'Start small business', 'Land rights',
      'Microfinance loans', 'Record keeping',
    ],
  },
];

const SCAM_KEYWORDS = ['otp', 'scam', 'fraud', 'upi', 'bank', 'password', 'pin', 'mobile money', 'phishing'];

export default function KnowledgeScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('Rice planting tips');
  const [result, setResult] = useState({
    success: true,
    response: 'Plant rice in flooded fields. Sow seeds 2-3 cm deep with row spacing of 20 cm. Best season is June-July during monsoon. Use certified seeds for 20-30% better yield. Apply urea 50kg per acre after 20 days for best results.',
    confidence: 0.92,
    source: 'offline-knowledge-base',
  });
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activeCategory, setActiveCategory] = useState('agriculture');

  const search = async (q) => {
    const text = (q || query).trim();
    if (!text) return;
    setLoading(true);
    setResult(null);

    // Proactive voice warning for scam queries
    const lower = text.toLowerCase();
    if (SCAM_KEYWORDS.some(kw => lower.includes(kw))) {
      Speech.speak(
        'Warning. Never share your OTP, PIN, or password with anyone. Banks and government never ask for this.',
        { rate: 0.85 }
      );
    }

    try {
      const res = await EnhancedOfflineService.search(text);
      setResult(res);
    } catch {
      setResult({ success: false, response: 'Could not find information. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (speaking) {
      await Speech.stop();
      setSpeaking(false);
    } else if (result?.response) {
      setSpeaking(true);
      Speech.speak(result.response, {
        rate: 0.88,
        pitch: 1.0,
        onDone: () => setSpeaking(false),
        onError: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
      });
    }
  };

  const activeTab = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>Knowledge Base</Text>
          <Text style={styles.subtitle}>Global knowledge — 100% offline</Text>
        </View>

        {/* Scam alert banner on safety tab */}
        {activeCategory === 'safety' && (
          <TouchableOpacity
            style={styles.scamBanner}
            onPress={() => Speech.speak(
              'Important safety warning. Never share your OTP, bank PIN, or password with anyone on phone or message. This is always a scam. Hang up immediately and call your bank.',
              { rate: 0.82 }
            )}
          >
            <Ionicons name="warning" size={18} color="#fff" />
            <Text style={styles.scamBannerText}>Never share OTP or PIN — tap to hear warning</Text>
            <Ionicons name="volume-high" size={16} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={17} color={theme.colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ask anything..."
              placeholderTextColor={theme.colors.text.disabled}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => search()}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={17} color={theme.colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => search()}>
            <Ionicons name="arrow-forward" size={19} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Category tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.tab,
                activeCategory === cat.id && { backgroundColor: cat.bg, borderColor: cat.color },
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={15}
                color={activeCategory === cat.id ? cat.color : theme.colors.gray[400]}
              />
              <Text style={[styles.tabText, activeCategory === cat.id && { color: cat.color }]}>
                {t(`knowledge.${cat.id}`) || cat.id}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick chips */}
        <View style={styles.chipsWrap}>
          {activeTab?.queries.map(q => (
            <TouchableOpacity
              key={q}
              style={[styles.chip, { borderColor: activeTab.color + '50', backgroundColor: activeTab.bg }]}
              onPress={() => { setQuery(q); search(q); }}
            >
              <Text style={[styles.chipText, { color: activeTab.color }]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary[500]} size="small" />
            <Text style={styles.loadingText}>Searching knowledge base...</Text>
          </View>
        )}

        {result && !loading && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={[styles.resultIconWrap, { backgroundColor: activeTab?.color || theme.colors.primary[500] }]}>
                <Ionicons name="bulb" size={14} color="#fff" />
              </View>
              <Text style={styles.resultTitle}>Answer</Text>
              <TouchableOpacity onPress={handleSpeak} style={styles.speakBtn}>
                <Ionicons
                  name={speaking ? 'stop-circle' : 'volume-high'}
                  size={22}
                  color={speaking ? theme.colors.error.main : theme.colors.primary[500]}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.resultText}>{result.response}</Text>
            {result.confidence != null && (
              <View style={styles.metaRow}>
                <View style={[styles.confidenceBadge, { backgroundColor: result.confidence > 0.6 ? '#ECFDF5' : '#FEF3C7' }]}>
                  <Text style={[styles.confidenceText, { color: result.confidence > 0.6 ? '#059669' : '#D97706' }]}>
                    {Math.round(result.confidence * 100)}% match
                  </Text>
                </View>
                <Text style={styles.sourceText}>{result.source || 'offline knowledge base'}</Text>
              </View>
            )}
          </View>
        )}

        {/* Coverage stats */}
        <View style={styles.coverageCard}>
          <Text style={styles.coverageTitle}>Knowledge Coverage</Text>
          <View style={styles.coverageGrid}>
            {[
              { icon: 'leaf', label: '10 Crops', sub: 'Rice to Cassava', color: '#059669' },
              { icon: 'medical', label: '10 Ailments', sub: 'Fever to HIV', color: '#DC2626' },
              { icon: 'shield-checkmark', label: '8 Scam Types', sub: 'OTP to Phishing', color: '#2563EB' },
              { icon: 'globe', label: '16 Countries', sub: 'Emergency numbers', color: '#7C3AED' },
              { icon: 'cash', label: 'Livelihoods', sub: 'Finance & rights', color: '#D97706' },
              { icon: 'partly-sunny', label: 'Climate', sub: 'Drought & floods', color: '#0891B2' },
            ].map(item => (
              <View key={item.label} style={styles.coverageItem}>
                <Ionicons name={item.icon} size={18} color={item.color} />
                <Text style={[styles.coverageLabel, { color: item.color }]}>{item.label}</Text>
                <Text style={styles.coverageSub}>{item.sub}</Text>
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
  title: { fontSize: 26, fontWeight: '800', color: theme.colors.text.primary, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: theme.colors.text.secondary, marginTop: 3 },
  scamBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#DC2626',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 11,
  },
  scamBannerText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#fff' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  searchInput: { flex: 1, fontSize: 15, color: theme.colors.text.primary },
  searchBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center', alignItems: 'center',
  },
  tabScroll: { backgroundColor: theme.colors.background.default },
  tabContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    backgroundColor: theme.colors.background.paper,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: theme.colors.gray[400] },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: theme.spacing.lg },
  chip: {
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 16,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  loadingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: theme.spacing.lg, justifyContent: 'center',
  },
  loadingText: { fontSize: 14, color: theme.colors.text.secondary },
  resultCard: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
    marginBottom: theme.spacing.lg,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: theme.spacing.sm },
  resultIconWrap: {
    width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
  },
  resultTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: theme.colors.text.primary },
  speakBtn: { padding: 4 },
  resultText: { fontSize: 15, color: theme.colors.text.primary, lineHeight: 24 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  confidenceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  confidenceText: { fontSize: 11, fontWeight: '700' },
  sourceText: { fontSize: 11, color: theme.colors.text.disabled },
  coverageCard: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
  },
  coverageTitle: {
    fontSize: 13, fontWeight: '700', color: theme.colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: theme.spacing.md,
  },
  coverageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  coverageItem: { width: '30%', alignItems: 'center', gap: 3 },
  coverageLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  coverageSub: { fontSize: 10, color: theme.colors.text.disabled, textAlign: 'center' },
});
