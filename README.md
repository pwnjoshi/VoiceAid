# VoiceAid

A voice-first mobile app for rural communities — works fully offline, supports English and Hindi, and runs on low-end Android devices.

## What it does

- **Voice assistant** — tap the mic, ask a question, get a spoken answer
- **Knowledge base** — agriculture, health, and safety information stored on-device
- **Reminders** — medicine, meal, and custom reminders with local notifications
- **Settings** — language switching (English/Hindi), voice speed, offline mode toggle

Everything works without internet. No API keys needed to run the app.

---

## Project structure

```
VoiceAid/
├── app/                    # Expo Router screens (tabs)
│   ├── (tabs)/
│   │   ├── index.tsx       # Home / voice tab
│   │   ├── reminders.tsx   # Reminders tab
│   │   ├── knowledge.tsx   # Knowledge base tab
│   │   └── explore.tsx     # Settings tab
│   └── _layout.tsx
├── src/
│   ├── screens/            # Screen components
│   ├── services/           # Offline AI, voice, reminders
│   ├── data/               # offlineKnowledge.json
│   ├── config/             # i18n, Amplify, API config
│   ├── theme/              # Colors, typography, spacing
│   └── locales/            # en.json, hi.json
├── backend/                # Node.js Express API (optional, cloud features)
├── __tests__/              # Jest tests
├── start-frontend.bat      # Start Expo dev server
└── start-backend.bat       # Start backend server
```

---

## Getting started

### Prerequisites

- Node.js 18+
- Expo Go app on your Android device/emulator
- (Optional) Android emulator via Android Studio

### Install

```bash
npm install
```

### Run the app

```bat
start-frontend.bat
```

Or manually:

```bash
npx expo start --clear
```

Scan the QR code with Expo Go, or press `a` to open on Android emulator.

### Run the backend (optional)

Only needed for cloud/AI features. The app works fully offline without it.

```bat
start-backend.bat
```

Backend runs on `http://localhost:3000`.

---

## Running tests

```bash
npm test
```

All 37 tests cover offline AI, reminder service, and enhanced offline service.

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Expo SDK 54 / React Native 0.81 |
| Navigation | Expo Router (file-based) |
| Voice output | expo-speech |
| Audio input | expo-audio |
| Storage | AsyncStorage |
| i18n | i18next / react-i18next |
| Icons | @expo/vector-icons (Ionicons) |
| Backend | Node.js + Express |

---

## Languages

Switch between English and Hindi from the Settings tab. The language preference is saved locally and persists across app restarts.

---

## Offline capability

The app bundles a local knowledge base (`src/data/offlineKnowledge.json`) covering:

- **Agriculture** — rice, wheat, corn planting, pest control, fertilizers, harvesting
- **Health** — fever, cough, headache, stomach pain — home remedies and when to see a doctor
- **Safety** — OTP scams, fraud awareness, emergency numbers (112, 100, 101, 108)

No internet connection is required for any of these features.
