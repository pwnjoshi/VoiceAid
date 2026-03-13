# VoiceAid - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Backend API
Edit `src/config/api.js`:
```javascript
export const API_BASE_URL = 'https://your-backend-api.com';
```

### Step 3: Run the App
```bash
npm start
```

Then press:
- `a` for Android
- `i` for iOS

## 📱 How to Use the App

1. **Tap the big button** to start recording
2. **Speak your message**
3. **Tap again** to stop and send to AI
4. **Listen** to the AI response

## 🎨 Button Colors

- **Gray** = Ready (tap to start)
- **Blue** = Listening (recording your voice)
- **Green** = Processing (sending to AI)
- **Orange** = Speaking (playing AI response)

## ⚙️ Settings

- **Bottom Tab**: Tap "Settings" to see app settings
- **Caretaker Setup**: Access from the modal to add caretaker phone number

## 🔧 Backend API Required

Your backend needs one endpoint:

**POST /voice**
- Receives: Audio file
- Returns: Audio file (AI response)

## 📝 Testing Without Backend

To test the UI without a backend, edit `src/services/ApiService.js`:

```javascript
async sendVoiceMessage(audioUri) {
  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  // Return same audio for testing
  return audioUri;
}
```

## ❓ Common Issues

**Microphone not working?**
- Check app permissions in device settings
- Restart the app

**Can't connect to backend?**
- Use your computer's IP address (not localhost)
- Make sure backend is running
- Check firewall settings

## 📚 More Info

See `SETUP.md` for detailed setup instructions.
