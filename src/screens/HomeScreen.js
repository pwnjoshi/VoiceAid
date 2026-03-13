import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import VoiceButton from '../components/VoiceButton';
import AudioService from '../services/AudioService';
import ApiService from '../services/ApiService';

/**
 * HomeScreen - Main screen with voice interaction button
 */
const HomeScreen = () => {
  const [state, setState] = useState('idle'); // idle, listening, processing, speaking
  const [statusText, setStatusText] = useState('Tap to speak');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      AudioService.cleanup();
    };
  }, []);

  /**
   * Handle voice button press
   */
  const handleVoicePress = async () => {
    if (state === 'idle') {
      // Start recording
      await startRecording();
    } else if (state === 'listening') {
      // Stop recording and process
      await stopRecordingAndProcess();
    }
  };

  /**
   * Start recording user's voice
   */
  const startRecording = async () => {
    try {
      setState('listening');
      setStatusText('Listening...');
      
      await AudioService.startRecording();
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
      setState('idle');
      setStatusText('Tap to speak');
    }
  };

  /**
   * Stop recording and send to backend
   */
  const stopRecordingAndProcess = async () => {
    try {
      // Stop recording
      const audioUri = await AudioService.stopRecording();
      
      if (!audioUri) {
        throw new Error('No audio recorded');
      }

      // Change to processing state
      setState('processing');
      setStatusText('Processing...');

      // Send to backend API
      const responseUri = await ApiService.sendVoiceMessage(audioUri);

      // Change to speaking state
      setState('speaking');
      setStatusText('Speaking...');

      // Play AI response
      await AudioService.playAudio(responseUri);

      // Return to idle state
      setState('idle');
      setStatusText('Tap to speak');
    } catch (error) {
      console.error('Processing error:', error);
      Alert.alert('Error', 'Failed to process voice message. Please try again.');
      setState('idle');
      setStatusText('Tap to speak');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{statusText}</Text>
      
      <VoiceButton
        state={state}
        onPress={handleVoicePress}
        disabled={state === 'processing' || state === 'speaking'}
      />

      <Text style={styles.instructionText}>
        {state === 'idle' && 'Tap to start speaking'}
        {state === 'listening' && 'Tap again when done'}
        {state === 'processing' && 'Sending to AI...'}
        {state === 'speaking' && 'AI is responding...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  statusText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 60,
    color: '#333',
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 20,
    marginTop: 40,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default HomeScreen;
