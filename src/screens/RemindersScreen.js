import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Modal, TextInput, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import OfflineReminderService from '../services/OfflineReminderService';
import theme from '../theme';

const CATEGORIES = [
  { id: 'medicine', icon: 'medical', label: 'Medicine' },
  { id: 'meal', icon: 'restaurant', label: 'Meal' },
  { id: 'health', icon: 'fitness', label: 'Health' },
  { id: 'custom', icon: 'alarm', label: 'Custom' },
];

const FREQUENCIES = ['daily', 'weekly', 'once'];

const DEFAULT_FORM = {
  title: '',
  message: '',
  time: '08:00',
  category: 'medicine',
  frequency: 'daily',
};

export default function RemindersScreen() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadReminders(); }, []);

  const loadReminders = async () => {
    const data = await OfflineReminderService.getReminders();
    setReminders(data);
  };

  const openAdd = () => {
    setForm(DEFAULT_FORM);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert('Title required', 'Please enter a reminder title.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(form.time)) {
      Alert.alert('Invalid time', 'Enter time as HH:MM (e.g. 08:30)');
      return;
    }
    setSaving(true);
    try {
      await OfflineReminderService.addReminder({
        title: form.title.trim(),
        message: form.message.trim(),
        time: form.time,
        category: form.category,
        frequency: form.frequency,
      });
      setModalVisible(false);
      await loadReminders();
    } catch (e) {
      Alert.alert('Error', 'Could not save reminder. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    await OfflineReminderService.toggleReminder(id);
    loadReminders();
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Reminder', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await OfflineReminderService.deleteReminder(id);
          loadReminders();
        },
      },
    ]);
  };

  const getCategoryIcon = (cat) =>
    CATEGORIES.find(c => c.id === cat)?.icon || 'alarm';

  const renderItem = ({ item }) => (
    <View style={[styles.card, !item.active && styles.cardInactive]}>
      <View style={[styles.iconWrap, { backgroundColor: item.active ? theme.colors.primary[100] : theme.colors.gray[100] }]}>
        <Ionicons
          name={getCategoryIcon(item.category)}
          size={22}
          color={item.active ? theme.colors.primary[500] : theme.colors.gray[400]}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, !item.active && styles.textMuted]}>{item.title}</Text>
        <Text style={styles.cardMeta}>
          {item.time}  •  {item.frequency}
          {item.message ? `  •  ${item.message}` : ''}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleToggle(item.id)} style={styles.actionBtn}>
          <Ionicons
            name={item.active ? 'checkmark-circle' : 'ellipse-outline'}
            size={26}
            color={item.active ? theme.colors.success.main : theme.colors.gray[300]}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
          <Ionicons name="trash-outline" size={22} color={theme.colors.error.main} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('reminders.title')}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reminders}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="alarm-outline" size={64} color={theme.colors.gray[300]} />
            <Text style={styles.emptyTitle}>{t('reminders.noReminders')}</Text>
            <Text style={styles.emptyHint}>Tap + to add your first reminder</Text>
          </View>
        }
      />

      {/* Add Reminder Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Reminder</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text style={[styles.modalSave, saving && styles.textMuted]}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            {/* Title */}
            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Blood pressure pill"
              value={form.title}
              onChangeText={v => setForm(f => ({ ...f, title: v }))}
              maxLength={60}
            />

            {/* Message */}
            <Text style={styles.fieldLabel}>Note (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Take with food"
              value={form.message}
              onChangeText={v => setForm(f => ({ ...f, message: v }))}
              maxLength={100}
            />

            {/* Time */}
            <Text style={styles.fieldLabel}>Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              placeholder="08:00"
              value={form.time}
              onChangeText={v => setForm(f => ({ ...f, time: v }))}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            {/* Category */}
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, form.category === cat.id && styles.chipActive]}
                  onPress={() => setForm(f => ({ ...f, category: cat.id }))}
                >
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={form.category === cat.id ? '#fff' : theme.colors.text.secondary}
                  />
                  <Text style={[styles.chipText, form.category === cat.id && styles.chipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Frequency */}
            <Text style={styles.fieldLabel}>Frequency</Text>
            <View style={styles.chipRow}>
              {FREQUENCIES.map(freq => (
                <TouchableOpacity
                  key={freq}
                  style={[styles.chip, form.frequency === freq && styles.chipActive]}
                  onPress={() => setForm(f => ({ ...f, frequency: freq }))}
                >
                  <Text style={[styles.chipText, form.frequency === freq && styles.chipTextActive]}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
    ...theme.shadows.sm,
  },
  title: { fontSize: 26, fontWeight: '700', color: theme.colors.text.primary },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { padding: theme.spacing.md, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardInactive: { opacity: 0.55 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.text.primary },
  cardMeta: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 3 },
  textMuted: { color: theme.colors.text.disabled },
  cardActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 6 },
  empty: { alignItems: 'center', paddingVertical: 64 },
  emptyTitle: { fontSize: 16, color: theme.colors.text.secondary, marginTop: 16, fontWeight: '600' },
  emptyHint: { fontSize: 13, color: theme.colors.text.disabled, marginTop: 6 },
  // Modal
  modalSafe: { flex: 1, backgroundColor: theme.colors.background.paper },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text.primary },
  modalCancel: { fontSize: 16, color: theme.colors.text.secondary },
  modalSave: { fontSize: 16, fontWeight: '700', color: theme.colors.primary[500] },
  modalBody: { padding: theme.spacing.lg },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    marginTop: theme.spacing.lg,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[100],
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  chipActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  chipText: { fontSize: 14, color: theme.colors.text.secondary, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
});
