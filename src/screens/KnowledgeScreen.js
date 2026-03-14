import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Speech from 'expo-speech';
import EnhancedOfflineService from '../services/EnhancedOfflineService';
import theme from '../theme';

const CATEGORIES = [
  { id: 'agriculture', icon: 'leaf', color: '#059669', queries: ['Rice planting tips', 'Pest control', 'Wheat harvest', 'Soil fertilizer'] },
  { id: 'health', icon: 'medical', color: '#DC2626', queries: ['Fever treatment', 'Headache relief', 'Cough remedy', 'Stomach pain'] },
  { id: 'safety', icon: 'shield-checkmark', color: '#2563EB', queries: ['OTP scam alert', 'Emergency numbers', 'Fraud awareness', 'Home safety'] },
];

export default function KnowledgeScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activeCategory, setActiveCategory] = useState('agriculture');

  const search = async (q) => {
    const text = (q || query).trim();
    if (!text) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await EnhancedOfflineService.search(text);
      setResult(res);
    } catch (e) {
      setResult({ success: false, response: 'Could not find information. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (speaking) {
      await Speech.stop();
      setSpeaking(false);
    } else if (result && result.response) {
      setSpeaking(true);
      Speech.speak(result.response, {
        rate: 0.9,
        onDone: () => setSpeaking(false),
        onError: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
      });
    }
  };

  const activeTab = CATEGORIES.find(function(c) { return c.id === activeCategory; });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Knowledge Base</Text>
          <Text style={styles.subtitle}>Ask anything — works offline</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={theme.colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ask a question..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={function() { search(); }}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={function() { setQuery(''); }}>
                <Ionicons name="close-circle" size={18} color={theme.colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={function() { search(); }}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {CATEGORIES.map(function(cat) {
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.tab, activeCategory === cat.id ? { borderBottomColor: cat.color, borderBottomWidth: 2 } : null]}
                onPress={function() { setActiveCategory(cat.id); }}
              >
                <Ionicons name={cat.icon} size={16} color={activeCategory === cat.id ? cat.color : theme.colors.gray[400]} />
                <Text style={[styles.tabText, activeCategory === cat.id ? { color: cat.color } : null]}>
                  {t('knowledge.' + cat.id)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.chipsWrap}>
          {activeTab && activeTab.queries.map(function(q) {
            return (
              <TouchableOpacity
                key={q}
                style={[styles.chip, { borderColor: activeTab.color + '40' }]}
                onPress={function() { setQuery(q); search(q); }}
              >
                <Text style={[styles.chipText, { color: activeTab.color }]}>{q}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary[500]} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {result && !loading && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="bulb" size={18} color={theme.colors.primary[500]} />
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
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background.paper },
  scroll: { paddingBottom: 40 },
  header: {
    paddingTop: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text.primary },
  subtitle: { fontSize: 14, color: theme.colors.text.secondary, marginTop: 4 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: theme.colors.gray[200],
  },
  searchInput: { flex: 1, fontSize: 15, color: theme.colors.text.primary },
  searchBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center', alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row', backgroundColor: theme.colors.background.default,
    borderBottomWidth: 1, borderBottomColor: theme.colors.gray[100],
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 12 },
  tabText: { fontSize: 13, fontWeight: '600', color: theme.colors.gray[400] },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: theme.spacing.lg },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: theme.colors.background.default, borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  loadingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: theme.spacing.lg, justifyContent: 'center' },
  loadingText: { fontSize: 14, color: theme.colors.text.secondary },
  resultCard: {
    marginHorizontal: theme.spacing.lg, padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: theme.spacing.sm },
  resultTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: theme.colors.primary[500] },
  speakBtn: { padding: 4 },
  resultText: { fontSize: 15, color: theme.colors.text.primary, lineHeight: 24 },
});
