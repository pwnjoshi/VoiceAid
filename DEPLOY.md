# Deployment Guide

## 📦 Building for Production

### Prerequisites
- Expo account (free at https://expo.dev)
- EAS CLI installed: `npm install -g eas-cli`
- Apple Developer account (for iOS)
- Google Play Developer account (for Android)

---

## 🤖 Android Build

### Step 1: Configure app.json
```json
{
  "expo": {
    "name": "VoiceAid",
    "slug": "voiceaid",
    "version": "1.0.0",
    "android": {
      "package": "com.voiceaid.app",
      "versionCode": 1
    }
  }
}
```

### Step 2: Build APK
```bash
eas build --platform android --type apk
```

### Step 3: Build AAB (for Play Store)
```bash
eas build --platform android --type app-bundle
```

### Step 4: Upload to Google Play
1. Go to Google Play Console
2. Create new app
3. Upload AAB file
4. Fill in store listing
5. Submit for review

---

## 🍎 iOS Build

### Step 1: Configure app.json
```json
{
  "expo": {
    "name": "VoiceAid",
    "slug": "voiceaid",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.voiceaid.app",
      "buildNumber": "1"
    }
  }
}
```

### Step 2: Build IPA
```bash
eas build --platform ios
```

### Step 3: Upload to App Store
1. Go to App Store Connect
2. Create new app
3. Upload IPA using Transporter
4. Fill in app information
5. Submit for review

---

## 🔐 Environment Variables

### Create .env.production
```
API_BASE_URL=https://api.voiceaid.com
ENVIRONMENT=production
LOG_LEVEL=error
```

### Update app.json
```json
{
  "expo": {
    "extra": {
      "apiUrl": "${API_BASE_URL}",
      "environment": "${ENVIRONMENT}"
    }
  }
}
```

---

## 🚀 Release Checklist

### Before Building
- [ ] Update version in package.json
- [ ] Update version in app.json
- [ ] Test on physical device
- [ ] Run linter: `npm run lint`
- [ ] Update backend API URL
- [ ] Test all features
- [ ] Check permissions in app.json
- [ ] Update app icons
- [ ] Update splash screen

### Before Publishing
- [ ] Create app store listings
- [ ] Write app description
- [ ] Take screenshots
- [ ] Set privacy policy
- [ ] Set terms of service
- [ ] Configure pricing
- [ ] Set target audience

### After Publishing
- [ ] Monitor crash reports
- [ ] Check user reviews
- [ ] Monitor performance
- [ ] Plan updates

---

## 📝 Version Management

### Semantic Versioning
```
MAJOR.MINOR.PATCH
1.0.0

MAJOR - Breaking changes
MINOR - New features
PATCH - Bug fixes
```

### Update Version
```bash
# In package.json and app.json
"version": "1.0.1"

# In app.json for iOS
"buildNumber": "2"

# In app.json for Android
"versionCode": 2
```

---

## 🔄 Update Process

### Over-the-Air Updates (Expo)
```bash
# Publish update
eas update --branch production

# Users get update automatically
```

### Native Updates
```bash
# Rebuild and republish to stores
eas build --platform android
eas build --platform ios
```

---

## 📊 Monitoring

### Crash Reports
- Sentry integration
- Firebase Crashlytics
- Expo error tracking

### Analytics
- Firebase Analytics
- Mixpanel
- Custom logging

### Performance
- App startup time
- API response time
- Memory usage
- Battery usage

---

## 🐛 Debugging Production

### Enable Logging
```javascript
// In production
if (__DEV__) {
  console.log('Debug info');
}
```

### Remote Debugging
```bash
# Connect to production app
expo start --dev-client
```

### Error Tracking
```javascript
import * as Sentry from "sentry-expo";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  enableInExpoDevelopment: true,
  tracesSampleRate: 1.0,
});
```

---

## 💰 App Store Pricing

### Free App
- No pricing setup needed
- Monetize with ads or in-app purchases

### Paid App
- Set price tier
- Available in all regions
- One-time purchase

### In-App Purchases
- Premium features
- Subscriptions
- Consumables

---

## 📱 Store Optimization

### App Store Listing
- Compelling title
- Clear description
- Relevant keywords
- High-quality screenshots
- Engaging preview video

### Keywords
- "voice assistant"
- "elderly care"
- "accessibility"
- "AI assistant"
- "voice commands"

### Screenshots
- Show main features
- Use real device screenshots
- Add text overlays
- Show before/after

---

## 🔗 Useful Links

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Expo Documentation](https://docs.expo.dev/)

---

## 🆘 Troubleshooting

### Build Fails
- Check app.json syntax
- Verify credentials
- Check internet connection
- Review build logs

### App Crashes on Launch
- Check permissions
- Verify API URL
- Check backend connectivity
- Review error logs

### Slow Performance
- Optimize images
- Reduce bundle size
- Profile with DevTools
- Check API response time

---

## 📞 Support

- Expo Support: https://expo.dev/support
- React Native: https://reactnative.dev/
- Stack Overflow: Tag with `expo` and `react-native`
