# 🚀 RUN YOUR APP NOW

## ⚡ Quick Commands

### Step 1: Start Development Server
```bash
npm start
```

### Step 2: Choose Your Device

**For Android:**
```
Press: a
```

**For iOS:**
```
Press: i
```

**For Scanning QR Code:**
```
1. Open Expo Go app on your phone
2. Scan the QR code shown in terminal
3. App will load on your device
```

---

## 📱 What You'll See

1. **Home Screen** - Large circular button in the center
2. **Status Text** - "Tap to speak" above the button
3. **Two Tabs** - Home (microphone icon) and Settings (gear icon)

---

## 🎤 How to Test

### Test Voice Recording
1. Tap the big button
2. Speak something
3. Tap again
4. You'll see status change to "Processing..."

### Test Settings
1. Tap the "Settings" tab at the bottom
2. See the settings placeholder

### Test Caretaker Setup
1. Look for a modal/menu option
2. Enter a phone number
3. Tap Save

---

## ⚠️ Important Before Running

### Update Backend URL
Edit `src/config/api.js`:
```javascript
export const API_BASE_URL = 'https://your-backend-api.com';
```

**For local testing:**
```javascript
export const API_BASE_URL = 'http://192.168.1.100:3000';
// Replace 192.168.1.100 with your computer's IP address
```

### Get Your Computer's IP Address

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your network adapter
```

**Mac/Linux:**
```bash
ifconfig
# Look for "inet" address
```

---

## 🔧 Troubleshooting

### "Cannot find module" Error
```bash
npm install
npm start -- --clear
```

### Microphone Permission Denied
1. Go to phone Settings
2. Find VoiceAid app
3. Enable Microphone permission
4. Restart app

### Can't Connect to Backend
1. Make sure backend is running
2. Use your computer's IP (not localhost)
3. Check firewall settings
4. Both phone and computer on same network

### App Crashes on Start
1. Check console for errors
2. Verify all imports are correct
3. Run `npm install` again
4. Clear cache: `npm start -- --clear`

---

## 📊 What's Running

When you run `npm start`, you get:

- ✅ Expo development server
- ✅ Metro bundler
- ✅ QR code for scanning
- ✅ Hot reload enabled
- ✅ Error overlay
- ✅ Console logs

---

## 🎯 Next Steps After Running

1. **Test Voice Recording**
   - Tap button
   - Speak
   - Tap again
   - Check console for logs

2. **Test Backend Integration**
   - Make sure backend is running
   - Update API URL
   - Test end-to-end flow

3. **Customize**
   - Change button colors
   - Change text
   - Add features

4. **Deploy**
   - Build for Android: `eas build --platform android`
   - Build for iOS: `eas build --platform ios`

---

## 📚 Documentation

After running, check these files:

- `START_HERE.md` - Quick start guide
- `HOW_IT_WORKS.md` - How the app works
- `BACKEND_EXAMPLE.md` - Backend examples
- `DEPLOY.md` - How to deploy

---

## 💡 Pro Tips

1. **Use Physical Device** - Microphone works better on real device
2. **Check Console** - `npm start` shows all logs
3. **Hot Reload** - Changes auto-reload when you save
4. **Test Without Backend** - Edit ApiService.js to mock responses

---

## 🆘 Still Having Issues?

1. Check `SETUP.md` for detailed setup
2. Check `VERIFICATION.md` to verify everything
3. Check `BACKEND_EXAMPLE.md` for backend setup
4. Check console logs for specific errors

---

## ✨ You're Ready!

```bash
npm start
```

**That's it! Your app is running! 🎉**

---

## 📞 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm start` | Start dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run lint` | Check code |
| `npm install` | Install dependencies |

---

**Enjoy your VoiceAid app! 🚀**
