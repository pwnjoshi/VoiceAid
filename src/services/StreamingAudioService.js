/**
 * Streaming Audio Service
 * Real-time bidirectional audio streaming with WebSocket
 */
import { Audio } from 'expo-av';
import { API_BASE_URL } from '../config/api';

class StreamingAudioService {
  constructor() {
    this.ws = null;
    this.recording = null;
    this.sound = null;
    this.isStreaming = false;
    this.sessionId = null;
    this.audioQueue = [];
    this.isPlaying = false;
  }

  /**
   * Connect to WebSocket streaming server
   */
  async connect(context = {}) {
    return new Promise((resolve, reject) => {
      const wsUrl = API_BASE_URL.replace('http', 'ws') + '/stream';
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('[Streaming] Connected to server');
      };
      
      this.ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          await this.handleServerMessage(message);
          
          if (message.type === 'session') {
            this.sessionId = message.sessionId;
            resolve(this.sessionId);
          }
        } catch (error) {
          console.error('[Streaming] Message handling error:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('[Streaming] WebSocket error:', error);
        reject(error);
      };
      
      this.ws.onclose = () => {
        console.log('[Streaming] Disconnected from server');
        this.cleanup();
      };
    });
  }

  /**
   * Start streaming audio to server
   */
  async startStreaming(context = {}) {
    try {
      // Request microphone permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error('Microphone permission denied');
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_PCM_16BIT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM_16BIT,
          sampleRate: 16000,
          numberOfChannels: 1,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await this.recording.startAsync();
      this.isStreaming = true;

      // Send start message to server
      this.ws.send(JSON.stringify({
        type: 'start',
        context: context
      }));

      // Stream audio chunks in real-time
      this.streamAudioChunks();

      console.log('[Streaming] Started recording and streaming');
    } catch (error) {
      console.error('[Streaming] Start error:', error);
      throw error;
    }
  }

  /**
   * Stream audio chunks to server
   */
  async streamAudioChunks() {
    const chunkInterval = 100; // Send chunks every 100ms
    
    const intervalId = setInterval(async () => {
      if (!this.isStreaming || !this.recording) {
        clearInterval(intervalId);
        return;
      }

      try {
        // Get current recording status
        const status = await this.recording.getStatusAsync();
        
        if (status.isRecording && status.durationMillis > 0) {
          // In a real implementation, you'd extract audio chunks here
          // For now, we'll send a placeholder
          // This requires native module access to get raw audio buffers
          
          // TODO: Implement native audio chunk extraction
          // const audioChunk = await this.extractAudioChunk();
          // if (audioChunk && this.ws.readyState === WebSocket.OPEN) {
          //   this.ws.send(audioChunk);
          // }
        }
      } catch (error) {
        console.error('[Streaming] Chunk streaming error:', error);
      }
    }, chunkInterval);
  }

  /**
   * Stop streaming
   */
  async stopStreaming() {
    try {
      this.isStreaming = false;

      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        
        // Send complete audio file
        if (uri && this.ws.readyState === WebSocket.OPEN) {
          const audioData = await this.readAudioFile(uri);
          this.ws.send(audioData);
          
          // Send stop message
          this.ws.send(JSON.stringify({ type: 'stop' }));
        }
        
        this.recording = null;
      }

      console.log('[Streaming] Stopped recording');
    } catch (error) {
      console.error('[Streaming] Stop error:', error);
      throw error;
    }
  }

  /**
   * Handle messages from server
   */
  async handleServerMessage(message) {
    switch (message.type) {
      case 'audio':
        // Queue audio chunk for playback
        this.audioQueue.push(message.data);
        if (!this.isPlaying) {
          await this.playAudioQueue();
        }
        break;
        
      case 'transcription':
        // User speech transcription
        if (this.onTranscription) {
          this.onTranscription(message.text, message.confidence);
        }
        break;
        
      case 'intent':
        // Detected intent
        if (this.onIntent) {
          this.onIntent(message.intent, message.slots);
        }
        break;
        
      case 'complete':
        // Complete response received
        if (this.onComplete) {
          this.onComplete({
            transcription: message.transcription,
            intent: message.intent,
            slots: message.slots
          });
        }
        
        // Play response audio
        if (message.audioResponse) {
          await this.playAudioResponse(message.audioResponse);
        }
        break;
        
      case 'error':
        console.error('[Streaming] Server error:', message.error);
        if (this.onError) {
          this.onError(message.error);
        }
        break;
    }
  }

  /**
   * Play queued audio chunks
   */
  async playAudioQueue() {
    this.isPlaying = true;
    
    while (this.audioQueue.length > 0) {
      const audioData = this.audioQueue.shift();
      await this.playAudioChunk(audioData);
    }
    
    this.isPlaying = false;
  }

  /**
   * Play single audio chunk
   */
  async playAudioChunk(audioData) {
    try {
      // Convert base64 to audio and play
      // This is a simplified version
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/pcm;base64,${audioData}` },
        { shouldPlay: true }
      );
      
      await sound.playAsync();
      
      // Wait for playback to finish
      await new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('[Streaming] Audio playback error:', error);
    }
  }

  /**
   * Play complete audio response
   */
  async playAudioResponse(base64Audio) {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/pcm;base64,${base64Audio}` },
        { shouldPlay: true }
      );
      
      this.sound = sound;
      await sound.playAsync();
      
      return new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
            this.sound = null;
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('[Streaming] Response playback error:', error);
      throw error;
    }
  }

  /**
   * Read audio file as buffer
   */
  async readAudioFile(uri) {
    // This would require expo-file-system
    // For now, return placeholder
    return new ArrayBuffer(0);
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.cleanup();
  }

  cleanup() {
    this.isStreaming = false;
    this.sessionId = null;
    this.audioQueue = [];
    this.isPlaying = false;
    
    if (this.recording) {
      this.recording.stopAndUnloadAsync().catch(console.error);
      this.recording = null;
    }
    
    if (this.sound) {
      this.sound.unloadAsync().catch(console.error);
      this.sound = null;
    }
  }

  // Event handlers (set by consumer)
  onTranscription = null;
  onIntent = null;
  onComplete = null;
  onError = null;
}

export default new StreamingAudioService();
