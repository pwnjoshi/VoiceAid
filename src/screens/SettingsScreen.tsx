import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

/**
 * SettingsScreen - Placeholder for app settings
 */
const SettingsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Settings</Text>
          <Text style={styles.placeholder}>Audio quality settings will appear here</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <Text style={styles.placeholder}>Language selection will appear here</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          <Text style={styles.placeholder}>Accessibility options will appear here</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.infoText}>VoiceAid v1.0.0</Text>
          <Text style={styles.infoText}>Voice assistant for elderly users</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
});

export default SettingsScreen;
