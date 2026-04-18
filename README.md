# VoiceAid

**Voice-first AI assistant for the 700M+ non-literate and digitally excluded people worldwide.**

AWS 10,000 AIdeas Finalist — Social Impact Category

---

## The Problem

700 million adults worldwide cannot read or write. Billions more lack digital literacy. They cannot use text-based apps, search engines, or chatbots. When they need to know how to treat a sick child, protect themselves from a phone scam, or grow a better crop — they have no reliable, accessible source of information.

VoiceAid solves this with a single large button and a voice.

---

## What It Does

Tap the microphone. Ask a question in your language. Get a spoken answer — instantly, without internet.

| Feature | Detail |
|---|---|
| Voice interface | Single large button, no reading required |
| On-device AI | Pattern-matching knowledge base, zero API calls |
| Offline-first | Works with no internet, no SIM card |
| 11 languages | English, Hindi, Marathi, Tamil, Bengali, Telugu, Swahili, Arabic, Spanish, French, Indonesian |
| Knowledge base | Agriculture, Health, Safety, Livelihoods, Climate |
| Reminders | Medicine, meal, and custom reminders with local notifications |
| Fraud protection | Proactive OTP scam voice warnings |
| App size | Under 2MB — runs on any Android phone |

---

## Global Coverage

### Languages (11)
| Language | Region | Speakers |
|---|---|---|
| English | Global | 1.5B |
| Hindi | South Asia | 600M |
| Bengali | South Asia | 300M |
| Telugu | South Asia | 95M |
| Marathi | South Asia | 95M |
| Tamil | South Asia | 80M |
| Arabic | Middle East & Africa | 400M |
| French | Africa & Global | 300M |
| Spanish | Latin America | 500M |
| Swahili | East Africa | 200M |
| Indonesian | SE Asia | 270M |

### Knowledge Base
- **10 crops**: Rice, Wheat, Corn, Cassava, Sorghum, Banana, Groundnut, Tomato, Potato, Beans
- **10 health topics**: Fever, Diarrhea, Malaria, Tuberculosis, Cholera, Diabetes, Blood Pressure, HIV/AIDS, Malnutrition, Eye Problems
- **8 fraud types**: OTP scam, Mobile money fraud, Fake jobs, Investment scam, Romance scam, Phishing, Impersonation, Phone scam
- **Emergency numbers**: 16 countries including India, Kenya, Nigeria, South Africa, Bangladesh, Indonesia, Brazil, Mexico, Egypt
- **Livelihoods**: Mobile banking, savings, microfinance, land rights, labor rights
- **Climate adaptation**: Drought-tolerant crops, flood preparation, soil conservation

---

## Architecture

```
VoiceAid/
├── app/                    # Expo Router (file-based navigation)
│   └── (tabs)/
│       ├── index.tsx       # Home — voice assistant
│       ├── reminders.tsx   # Medicine & meal reminders
│       ├── knowledge.tsx   # Knowledge base search
│       └── explore.tsx     # Settings & language
├── src/
│   ├── screens/            # Full screen components
│   ├── services/
│   │   ├── EnhancedOfflineService.js  # Knowledge base search engine
│   │   ├── OfflineAIService.js        # Pattern-matching AI
│   │   ├── OfflineReminderService.js  # Local reminder engine
│   │   └── VoiceService.js            # TTS with natural voice
│   ├── data/
│   │   └── offlineKnowledge.json      # 295-line global knowledge base
│   ├── config/
│   │   └── i18n.js                    # 11-language i18n config
│   ├── locales/            # en, hi, mr, ta, bn, te, sw, ar, es, fr, id
│   └── theme/              # Design system
├── backend/                # Node.js + Express (optional cloud features)
├── __tests__/              # 37 passing Jest tests
├── start-frontend.bat      # Launch Expo dev server
└── start-backend.bat       # Launch backend server
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo Go on Android device or emulator

### Install
```bash
npm install
```

### Run
```bat
start-frontend.bat
```
Or: `npx expo start --clear` then press `a` for Android.

### Backend (optional)
```bat
start-backend.bat
```
The app works 100% offline without the backend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 / React Native 0.81 |
| Navigation | Expo Router (file-based) |
| Voice output | expo-speech (natural TTS) |
| Audio input | expo-audio |
| Storage | AsyncStorage |
| i18n | i18next + react-i18next |
| Icons | Ionicons (@expo/vector-icons) |
| Backend | Node.js + Express + AWS Bedrock |
| Testing | Jest + jest-expo (37 tests) |

---

## Tests

```bash
npm test
```

37 tests covering offline AI service, reminder service, and enhanced offline service. All passing.

---

## Why This Matters

- **700M+** non-literate adults globally cannot use text-based apps
- **2.7B** people lack reliable internet access
- **Elderly users** are the #1 target of phone scams — VoiceAid proactively warns them
- **Smallholder farmers** (500M globally) need crop advice but can't access it
- **Rural health** — diarrhea kills 500,000 children per year, mostly preventable with ORS knowledge

VoiceAid puts life-saving information in the hands of people who need it most, in their language, without requiring literacy or internet.

---

## AWS Integration

- **Amazon Bedrock** (Nova Sonic) — streaming voice AI for cloud mode
- **Amazon Lex** — conversational AI for structured queries
- **Amazon S3** — knowledge base document storage
- **AWS Amplify** — authentication and sync
- **Amazon CloudWatch** — monitoring and metrics

All AWS features are optional — the app works fully offline without them.

---

## Competition

AWS 10,000 AIdeas — Social Impact Category  
Finalist among top 50 from thousands of global submissions.
