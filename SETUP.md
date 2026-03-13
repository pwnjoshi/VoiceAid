# VoiceAid Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend API

Edit `src/config/api.js` and update the API URL:

```javascript
export const API_BASE_URL = 'https://your-backend-api.com';
```

For local development:
```javascript
export const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000';
```

**Important**: When testing on a physical device, use your computer's local IP address (not localhost).

### 3. Start Development Server

```bash
npm start
```

### 4. Run on Device

- **Android**: Press `a` or scan QR code with Expo Go
- **iOS**: Press `i` or scan QR code with Expo Go (iOS)

## Backend API Requirements

Your backend must implement the following endpoint:

### POST /voice

**Request:**
- Content-Type: `multipart/form-data`
- Body: Audio file (field name: `audio`)
- Format: M4A or MP4 audio

**Response:**
- Content-Type: `audio/m4a` or `audio/mp4`
- Body: Audio file (AI response)

**Example Backend (Node.js/Express):**

```javascript
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/voice', upload.single('audio'), async (req, res) => {
  // 1. Get uploaded audio file
  const audioFile = req.file;
  
  // 2. Process with your AI system
  const aiResponse = await processWithAI(audioFile);
  
  // 3. Return audio response
  res.sendFile(aiResponse.path);
});
```

## Testing Without Backend

For testing the UI without a backend, you can modify `src/services/ApiService.js`:

```javascript
async sendVoiceMessage(audioUri) {
  // Mock response for testing
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return the same audio for testing
      resolve(audioUri);
    }, 2000);
  });
}
```

## Permissions

The app requires microphone permissions:

- **iOS**: Automatically requested on first use
- **Android**: Automatically requested on first use

If permissions are denied, the app will show an error message.

## Troubleshooting

### Audio Recording Not Working

1. Check microphone permissions in device settings
2. Ensure `expo-av` is properly installed
3. Try restarting the Expo development server

### API Connection Failed

1. Verify backend URL in `src/config/api.js`
2. Check that backend server is running
3. For local development, use your computer's IP address (not localhost)
4. Ensure your device and computer are on the same network

### Button Not Responding

1. Check console for errors
2. Verify all dependencies are installed
3. Try clearing cache: `npm start -- --clear`

## Building for Production

### Android

```bash
eas build --platform android
```

### iOS

```bash
eas build --platform ios
```

Refer to [Expo EAS Build documentation](https://docs.expo.dev/build/introduction/) for detailed instructions.

## Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Then update with your values.

## Project Structure

```
voiceaid/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home tab (voice button)
│   │   ├── explore.tsx    # Settings tab
│   │   └── _layout.tsx    # Tab layout
│   ├── modal.tsx          # Caretaker setup modal
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   │   └── VoiceButton.js
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.js
│   │   ├── SettingsScreen.js
│   │   └── CaretakerScreen.js
│   ├── services/          # Business logic
│   │   ├── AudioService.js
│   │   └── ApiService.js
│   └── config/            # Configuration
│       └── api.js
├── assets/                # Images and fonts
├── package.json
└── app.json              # Expo configuration
```

## Next Steps

1. Configure your backend API URL
2. Test voice recording on a physical device
3. Implement your backend API endpoint
4. Customize UI colors and text for your users
5. Add additional features as needed

## Support

For issues or questions, refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [expo-av Documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
