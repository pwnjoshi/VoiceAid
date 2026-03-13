# How VoiceAid Works

## 🎯 App Flow

```
User taps button
    ↓
App records voice (Blue button)
    ↓
User taps again to stop
    ↓
App sends audio to backend (Green button)
    ↓
Backend processes with AI
    ↓
Backend returns AI audio response
    ↓
App plays response (Orange button)
    ↓
Back to ready state (Gray button)
```

## 📂 File Structure Explained

### `/app` - Navigation & Screens
- `_layout.tsx` - Main app navigation setup
- `(tabs)/` - Bottom tab navigation
  - `index.tsx` - Home tab (voice button)
  - `explore.tsx` - Settings tab
  - `_layout.tsx` - Tab bar configuration
- `modal.tsx` - Caretaker setup modal

### `/src` - App Logic

#### `/components`
- `VoiceButton.js` - The big circular button with color states

#### `/screens`
- `HomeScreen.js` - Main screen with voice interaction
- `SettingsScreen.js` - Settings page
- `CaretakerScreen.js` - Caretaker phone number setup

#### `/services`
- `AudioService.js` - Handles recording and playback
  - `startRecording()` - Start mic recording
  - `stopRecording()` - Stop and get audio file
  - `playAudio()` - Play audio response
  
- `ApiService.js` - Handles backend communication
  - `sendVoiceMessage()` - Send audio to backend, get response

#### `/config`
- `api.js` - Backend API URL configuration

## 🔧 Key Technologies

- **expo-av** - Audio recording and playback
- **expo-router** - Navigation between screens
- **@react-native-async-storage** - Save caretaker info locally
- **FormData** - Send audio files to backend

## 🎨 Button States Logic

```javascript
// Gray (idle) - Ready to record
state === 'idle'

// Blue (listening) - Recording voice
state === 'listening'

// Green (processing) - Sending to backend
state === 'processing'

// Orange (speaking) - Playing AI response
state === 'speaking'
```

## 🔄 State Management

The app uses React's `useState` to manage:
- Current button state
- Status text above button
- Recording/playback status

## 📡 Backend Communication

```javascript
// 1. Create form data with audio file
const formData = new FormData();
formData.append('audio', {
  uri: audioUri,
  type: 'audio/m4a',
  name: 'recording.m4a',
});

// 2. Send to backend
const response = await fetch('API_URL/voice', {
  method: 'POST',
  body: formData,
});

// 3. Get audio response
const audioBlob = await response.blob();
```

## 🎤 Audio Recording

```javascript
// Request microphone permission
await Audio.requestPermissionsAsync();

// Start recording
const { recording } = await Audio.Recording.createAsync(
  Audio.RecordingOptionsPresets.HIGH_QUALITY
);

// Stop and get file
await recording.stopAndUnloadAsync();
const uri = recording.getURI();
```

## 🔊 Audio Playback

```javascript
// Load and play audio
const { sound } = await Audio.Sound.createAsync(
  { uri: responseUri },
  { shouldPlay: true }
);

// Wait for playback to finish
sound.setOnPlaybackStatusUpdate((status) => {
  if (status.didJustFinish) {
    // Playback complete
  }
});
```

## 💾 Local Storage

```javascript
// Save caretaker phone
await AsyncStorage.setItem('caretaker_phone', phoneNumber);

// Load caretaker phone
const saved = await AsyncStorage.getItem('caretaker_phone');
```

## 🎯 Design Principles

1. **Simple UI** - One big button, clear colors
2. **Visual Feedback** - Button pulses during active states
3. **Large Text** - Easy to read for elderly users
4. **Error Handling** - Clear error messages
5. **Permissions** - Automatic permission requests

## 🔐 Permissions

### iOS (app.json)
```json
"NSMicrophoneUsageDescription": "VoiceAid needs microphone access..."
```

### Android (app.json)
```json
"permissions": [
  "android.permission.RECORD_AUDIO"
]
```

## 🚀 Next Steps for Development

1. **Configure Backend URL** in `src/config/api.js`
2. **Test on Physical Device** (microphone required)
3. **Customize Colors** in `src/components/VoiceButton.js`
4. **Add Features** in respective service files
5. **Build for Production** using `eas build`
