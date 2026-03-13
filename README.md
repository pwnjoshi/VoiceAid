# VoiceAid - Voice Assistant for Elderly Users

A React Native mobile app built with Expo that allows elderly and non-literate users to interact with an AI assistant using voice.

## Features

- **Voice Recording**: Record user's voice with a simple tap
- **AI Integration**: Send audio to backend API and receive AI responses
- **Audio Playback**: Play AI-generated responses
- **Simple UI**: Large circular button with color-coded states
- **Caretaker Setup**: Configure caretaker contact information
- **Settings**: Basic app settings

## Button States

- **Gray (Idle)**: Ready to record
- **Blue (Listening)**: Recording user's voice
- **Green (Processing)**: Sending audio to backend API
- **Orange (Speaking)**: Playing AI response

## Project Structure

```
/src
  /components
    VoiceButton.js          # Main voice interaction button
  /screens
    HomeScreen.js           # Main screen with voice button
    SettingsScreen.js       # Settings placeholder
    CaretakerScreen.js      # Caretaker phone number setup
  /services
    AudioService.js         # Audio recording and playback
    ApiService.js           # Backend API communication
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## Backend API Configuration

Update the API URL in `src/services/ApiService.js`:

```javascript
const API_BASE_URL = 'https://your-backend-api.com';
```

### API Endpoint

**POST /voice**
- **Request**: FormData with audio file
- **Response**: Audio file (AI response)

## Required Permissions

- **Microphone**: For recording user's voice
- **Audio Playback**: For playing AI responses

## Tech Stack

- React Native
- Expo
- expo-av (audio recording/playback)
- expo-router (navigation)
- @react-native-async-storage/async-storage (local storage)

## Usage

1. **Home Screen**: Tap the large circular button to start recording
2. **Recording**: Speak your message, then tap again to stop
3. **Processing**: Wait while the audio is sent to the backend
4. **Response**: Listen to the AI's response
5. **Settings**: Access app settings from the bottom tab
6. **Caretaker**: Set up caretaker contact via the modal screen

## Development Notes

- The app is designed for mobile only (iOS and Android)
- Backend API must be implemented separately
- Audio format: M4A (high quality)
- All UI text should be large and readable for elderly users
- Button animations provide visual feedback

## Future Enhancements

- Offline mode with cached responses
- Multiple language support
- Emergency contact quick dial
- Voice command shortcuts
- Audio history playback

## License

Private - VoiceAid Project
