import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import OfflineReminderService from '../../src/services/OfflineReminderService';
import theme from '../theme';

export default function RemindersScreen() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const data = await OfflineReminderService.getReminders();
    setReminders(data);
  };

  const handleToggle = async (id) => {
    await OfflineReminderService.toggleReminder(id);
    loadReminders();
  };

  const handleDelete = (id) => {
    Alert.alert(t('reminders.delete'), '', [
      { text: t('settings.cancel'), style: 'cancel' },
      { text: t('reminders.delete'), onPress: async () => {
        await OfflineReminderService.deleteReminder(id);
        loadReminders();
      }},
    ]);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      medicine: 'medical',
      meal: 'restaurant',
      health: 'fitness',
    };
    return icons[category] || 'alarm';
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: item.active ? theme.colors.primary[100] : theme.colors.gray[100] }]}>
          <Ionicons name={getCategoryIcon(item.category)} size={24} color={item.active ? theme.colors.primary[500] : theme.colors.gray[400]} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemTime}>{item.time} • {t(`reminders.${item.frequency}`)}</Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <TouchableOpacity onPress={() => handleToggle(item.id)} style={styles.iconButton}>
          <Ionicons name={item.active ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={item.active ? theme.colors.success.main : theme.colors.gray[300]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={24} color={theme.colors.error.main} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('reminders.title')}</Text>
      </View>
      <FlatList
        data={reminders}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="alarm-outline" size={64} color={theme.colors.gray[300]} />
            <Text style={styles.emptyText}>{t('reminders.noReminders')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.paper },
  header: { padding: theme.spacing.lg, backgroundColor: theme.colors.background.default },
  title: { ...theme.typography.styles.h2, color: theme.colors.text.primary },
  list: { padding: theme.spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.background.default, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, ...theme.shadows.sm },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: theme.spacing.md },
  iconContainer: { width: 48, height: 48, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  itemContent: { flex: 1 },
  itemTitle: { ...theme.typography.styles.body1, color: theme.colors.text.primary, fontWeight: '600' },
  itemTime: { ...theme.typography.styles.caption, color: theme.colors.text.secondary, marginTop: 2 },
  itemRight: { flexDirection: 'row', gap: theme.spacing.sm },
  iconButton: { padding: theme.spacing.xs },
  empty: { alignItems: 'center', paddingVertical: theme.spacing['3xl'] },
  emptyText: { ...theme.typography.styles.body1, color: theme.colors.text.secondary, marginTop: theme.spacing.md },
});
