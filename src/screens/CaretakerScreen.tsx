import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * CaretakerScreen - Setup screen for caretaker contact information
 */
const CaretakerScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savedNumber, setSavedNumber] = useState('');

  // Load saved phone number on mount
  useEffect(() => {
    loadPhoneNumber();
  }, []);

  /**
   * Load saved phone number from storage
   */
  const loadPhoneNumber = async () => {
    try {
      const saved = await AsyncStorage.getItem('caretaker_phone');
      if (saved) {
        setSavedNumber(saved);
        setPhoneNumber(saved);
      }
    } catch (error) {
      console.error('Failed to load phone number:', error);
    }
  };

  /**
   * Save phone number to storage
   */
  const savePhoneNumber = async () => {
    try {
      if (!phoneNumber.trim()) {
        Alert.alert('Error', 'Please enter a phone number');
        return;
      }

      await AsyncStorage.setItem('caretaker_phone', phoneNumber);
      setSavedNumber(phoneNumber);
      Alert.alert('Success', 'Caretaker phone number saved');
    } catch (error) {
      console.error('Failed to save phone number:', error);
      Alert.alert('Error', 'Failed to save phone number');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Caretaker Setup</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Caretaker Phone Number</Text>
        <Text style={styles.description}>
          Enter the phone number of the caretaker who will receive notifications
        </Text>
        
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          maxLength={15}
        />

        <TouchableOpacity style={styles.saveButton} onPress={savePhoneNumber}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        {savedNumber && (
          <View style={styles.savedInfo}>
            <Text style={styles.savedLabel}>Currently saved:</Text>
            <Text style={styles.savedNumber}>{savedNumber}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About Caretaker Setup</Text>
        <Text style={styles.infoText}>
          The caretaker will be notified in case of emergencies or when the user needs assistance.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  card: {
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
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  savedInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  savedLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  savedNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default CaretakerScreen;
