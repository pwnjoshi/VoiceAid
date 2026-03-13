import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import EnhancedOfflineService from '../../src/services/EnhancedOfflineService';
import VoiceService from '../services/VoiceService';
import theme from '../theme';

export default function KnowledgeScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { id: 'agriculture', icon: 'leaf', color: theme.colors.success.main },
    { id: 'health', icon: 'medical', color: theme.colors.error.main },
    { id: 'safety', icon: 'shield-checkmark', color: theme.colors.info.main },
    { id: 'general', icon: 'information-circle', color: theme.colors.primary[500] },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const result = await EnhancedOfflineService.search(searchQuery);
    setSearchResult(result);
  };

  const handleSpeak = async () => {
    if (searchResult?.response) {
      await VoiceService.speak(searchResult.response);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('knowledge.general')}</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={theme.colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ask a question..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categories}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, selectedCategory === cat.id && styles.categoryCardActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                  <Ionicons name={cat.icon} size={32} color={cat.color} />
                </View>
                <Text style={styles.categoryText}>{t(`knowledge.${cat.id}`)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {searchResult && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Answer</Text>
              <TouchableOpacity onPress={handleSpeak} style={styles.speakButton}>
                <Ionicons name="volume-high" size={24} color={theme.colors.primary[500]} />
              </TouchableOpacity>
            </View>
            <Text style={styles.resultText}>{searchResult.response}</Text>
            <View style={styles.resultFooter}>
              <View style={styles.badge}>
                <Ionicons name="cloud-offline" size={16} color={theme.colors.offline} />
                <Text style={styles.badgeText}>Offline</Text>
              </View>
              <Text style={styles.confidenceText}>
                {Math.round(searchResult.confidence * 100)}% confidence
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.paper },
  header: { padding: theme.spacing.lg, backgroundColor: theme.colors.background.default },
  title: { ...theme.typography.styles.h2, color: theme.colors.text.primary },
  searchContainer: { padding: theme.spacing.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background.default, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.lg, gap: theme.spacing.sm, ...theme.shadows.sm },
  searchInput: { flex: 1, ...theme.typography.styles.body1, color: theme.colors.text.primary },
  content: { flex: 1 },
  categoriesContainer: { padding: theme.spacing.md },
  sectionTitle: { ...theme.typography.styles.h4, color: theme.colors.text.primary, marginBottom: theme.spacing.md },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  categoryCard: { width: '47%', backgroundColor: theme.colors.background.default, padding: theme.spacing.lg, borderRadius: theme.borderRadius.xl, alignItems: 'center', ...theme.shadows.sm },
  categoryCardActive: { borderWidth: 2, borderColor: theme.colors.primary[500] },
  categoryIcon: { width: 64, height: 64, borderRadius: theme.borderRadius.xl, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.sm },
  categoryText: { ...theme.typography.styles.body2, color: theme.colors.text.primary, fontWeight: '600' },
  resultContainer: { margin: theme.spacing.md, padding: theme.spacing.lg, backgroundColor: theme.colors.background.default, borderRadius: theme.borderRadius.xl, ...theme.shadows.md },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  resultTitle: { ...theme.typography.styles.h4, color: theme.colors.text.primary },
  speakButton: { padding: theme.spacing.sm },
  resultText: { ...theme.typography.styles.body1, color: theme.colors.text.primary, lineHeight: 24, marginBottom: theme.spacing.md },
  resultFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.offline + '20', paddingHorizontal: theme.spacing.sm, paddingVertical: 4, borderRadius: theme.borderRadius.md, gap: 4 },
  badgeText: { ...theme.typography.styles.caption, color: theme.colors.offline, fontWeight: '600' },
  confidenceText: { ...theme.typography.styles.caption, color: theme.colors.text.secondary },
});
