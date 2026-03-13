/**
 * Settings Screen
 * Professional settings with language, voice, and preferences
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changeLanguage, getAvailableLanguages } from '../config/i18n';
import VoiceService from '../services/VoiceService';
import theme from '../theme';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState({
    offlineMode: true,
    batterySaver: false,
    notifications: true,
    voiceSpeed: 'normal',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('@voiceaid:settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem('@voiceaid:settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleLanguageChange = () => {
    const languages = getAvailableLanguages();
    Alert.alert(
      t('settings.selectLanguage'),
      '',
      languages.map(lang => ({
        text: lang.nativeName,
        onPress: () => changeLanguage(lang.code),
      }))
    );
  };

  const handleVoiceSpeedChange = () => {
    const speeds = ['slow', 'normal', 'fast'];
    Alert.alert(
      t('settings.voiceSpeed'),
      '',
      speeds.map(speed => ({
        text: t(`settings.${speed}`),
        onPress: async () => {
          await VoiceService.setSpeed(speed);
          saveSettings({ ...settings, voiceSpeed: speed });
        },
      }))
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.title')}</Text>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.item} onPress={handleLanguageChange}>
          <View style={styles.itemLeft}>
            <Ionicons name="language" size={24} color={theme.colors.primary[500]} />
            <Text style={styles.itemText}>{t('settings.language')}</Text>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.itemValue}>
              {getAvailableLanguages().find(l => l.code === i18n.language)?.nativeName}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Voice Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice</Text>
        <TouchableOpacity style={styles.item} onPress={handleVoiceSpeedChange}>
          <View style={styles.itemLeft}>
            <Ionicons name="speedometer" size={24} color={theme.colors.primary[500]} />
            <Text style={styles.itemText}>{t('settings.voiceSpeed')}</Text>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.itemValue}>{t(`settings.${settings.voiceSpeed}`)}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="cloud-offline" size={24} color={theme.colors.primary[500]} />
            <View>
              <Text style={styles.itemText}>{t('settings.offlineMode')}</Text>
              <Text style={styles.itemDesc}>{t('settings.offlineModeDesc')}</Text>
            </View>
          </View>
          <Switch
            value={settings.offlineMode}
            onValueChange={(value) => saveSettings({ ...settings, offlineMode: value })}
          />
        </View>

        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="battery-charging" size={24} color={theme.colors.primary[500]} />
            <View>
              <Text style={styles.itemText}>{t('settings.batterySaver')}</Text>
              <Text style={styles.itemDesc}>{t('settings.batterySaverDesc')}</Text>
            </View>
          </View>
          <Switch
            value={settings.batterySaver}
            onValueChange={(value) => saveSettings({ ...settings, batterySaver: value })}
          />
        </View>

        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="notifications" size={24} color={theme.colors.primary[500]} />
            <View>
              <Text style={styles.itemText}>{t('settings.notifications')}</Text>
              <Text style={styles.itemDesc}>{t('settings.notificationsDesc')}</Text>
            </View>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => saveSettings({ ...settings, notifications: value })}
          />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="information-circle" size={24} color={theme.colors.primary[500]} />
            <Text style={styles.itemText}>{t('settings.version')}</Text>
          </View>
          <Text style={styles.itemValue}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.paper,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
  },
  title: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
  },
  section: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
    paddingVertical: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  itemText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
  },
  itemDesc: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  itemValue: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
  },
});
