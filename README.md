# VoiceAid

**Voice-first AI assistant for the 700M+ non-literate and digitally excluded people worldwide.**

> AWS 10,000 AIdeas Finalist — Social Impact Category  
> Built by Pawan Joshi, Bhumika Bhatt, Mehak Sethi, Vidushi Mohan

---

## The Problem

700 million adults worldwide cannot read or write. Billions more lack digital literacy. Every modern app — search engines, chatbots, government portals, health apps — assumes you can read a screen. For a non-literate farmer in rural Kenya or an elderly person in rural India, these interfaces are not just difficult. They are a wall.

VoiceAid tears down that wall with a single button and a voice.

---

## What It Does

Tap the microphone. Ask a question in your language. Get a spoken answer — instantly, without internet.

| Feature | Detail |
|---|---|
| Voice interface | Single large button, no reading required |
| Real STT | Device speech-to-text via `@react-native-voice/voice` |
| Text fallback | Auto-activates when STT unavailable (Expo Go / permissions) |
| On-device AI | Keyword-indexed knowledge base, zero API calls needed |
| AWS Bedrock RAG | When online — retrieval-augmented generation via Nova Lite |
| WebSocket streaming | Real-time text query channel to backend |
| Offline-first | Full functionality with no internet, no SIM card |
| 11 languages | English, Hindi, Marathi, Tamil, Bengali, Telugu, Swahili, Arabic, Spanish, French, Indonesian |
| Knowledge base | 6 domains: Agriculture, Health, Safety, Livelihoods, Climate, Daily Living |
| Reminders | Medicine, meal, and custom reminders with local notifications |
| Fraud protection | Proactive OTP scam voice warnings |
| App size | Under 2MB knowledge base, runs on any Android 7+ phone |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP                               │
│                                                                 │
│  ┌─────────────────────┐    ┌──────────────────────────────┐   │
│  │   OFFLINE SERVICES  │    │      VOICE INTERFACE         │   │
│  │                     │    │                              │   │
│  │  Pattern Matching   │    │   Single Button UI           │   │
│  │  RAG-like Search    │◄───│   (color-coded states)       │   │
│  │  Local Knowledge    │    │                              │   │
│  │  (offlineKnowledge  │    │   @react-native-voice/voice  │   │
│  │   .json)            │    │   expo-speech TTS            │   │
│  └─────────────────────┘    └──────────────┬───────────────┘   │
│           ▲                                │                    │
│           │ offline responses              │ bidirectional      │
│           │ (expo-speech)                  │ audio/text stream  │
└───────────┼────────────────────────────────┼────────────────────┘
            │                                │
            │ sync when online               ▼
            │                    ┌───────────────────────┐
            │                    │       BACKEND         │
            │                    │   (Node.js/Express)   │
            │                    │                       │
            │                    │  ┌─────────────────┐  │
            │                    │  │  Amazon Nova    │  │
            │                    │  │  Sonic          │  │
            │                    │  │  (bidirectional │  │
            │                    │  │   streaming)    │  │
            │                    │  └────────┬────────┘  │
            │                    │           │            │
            │                    │  ┌────────▼────────┐  │
            │                    │  │   LEX V2        │  │
            │                    │  │  Intent         │  │──► User Context
            │                    │  │  Detection      │  │    (DynamoDB)
            │                    │  │  Dialogue Mgmt  │  │
            │                    │  └────────┬────────┘  │
            │                    │           │            │
            │                    │  ┌────────▼────────┐  │
            └────────────────────│  │  BEDROCK KB     │  │
                                 │  │  Expert Docs    │  │
                                 │  │  (RAG)          │  │
                                 │  └─────────────────┘  │
                                 └───────────────────────┘
```

### Processing Flow

```
User speaks
    │
    ▼
@react-native-voice/voice (device STT)
    │
    ├─── Online + backend up?
    │         │
    │         ▼
    │    POST /api/voice/v2/text
    │         │
    │         ├── Lex V2 intent detection
    │         │
    │         └── Bedrock Knowledge Base RAG
    │                   │
    │                   ▼
    │              Nova Lite response
    │
    └─── Offline / backend down?
              │
              ▼
         EnhancedOfflineService.search()
              │
              ├── Keyword index lookup
              ├── Confidence scoring
              └── Category fallback
                        │
                        ▼
                   expo-speech TTS
                   (language-tuned)
```

---

## Project Structure

```
VoiceAid/
├── app/                          # Expo Router (file-based navigation)
│   ├── (tabs)/
│   │   ├── index.tsx             # Home — voice assistant
│   │   ├── reminders.tsx         # Medicine & meal reminders
│   │   ├── knowledge.tsx         # Knowledge base browser
│   │   └── explore.tsx           # Settings & language
│   └── _layout.tsx               # Root layout + SafeAreaProvider
│
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js         # Voice UI with STT + text fallback
│   │   ├── KnowledgeScreen.js    # Searchable knowledge base
│   │   ├── RemindersScreen.js    # Reminder management
│   │   └── SettingsScreen.js     # Language, voice speed, preferences
│   │
│   ├── services/
│   │   ├── EnhancedOfflineService.js   # On-device RAG search engine
│   │   ├── OfflineAIService.js         # Wrapper (delegates to Enhanced)
│   │   ├── OfflineReminderService.js   # Local reminder scheduling
│   │   ├── VoiceService.js             # TTS with 11-language support
│   │   ├── ApiService.js               # Backend HTTP client + fallback
│   │   └── StreamingAudioService.js    # WebSocket text/audio channel
│   │
│   ├── data/
│   │   └── offlineKnowledge.json       # 295-line global knowledge base
│   │
│   ├── config/
│   │   ├── i18n.js                     # 11-language i18n config
│   │   └── api.js                      # API endpoints config
│   │
│   ├── locales/                        # Translation files
│   │   ├── en.json, hi.json, mr.json
│   │   ├── ta.json, bn.json, te.json
│   │   ├── sw.json, ar.json, es.json
│   │   ├── fr.json, id.json
│   │
│   └── theme/                          # Design system
│       ├── colors.js
│       ├── typography.js
│       └── index.js
│
├── backend/                      # Node.js + Express API
│   ├── server.js                 # Express + WebSocket server
│   ├── controllers/
│   │   ├── voiceController.js    # Text/voice query handler
│   │   └── knowledgeController.js
│   ├── services/
│   │   ├── bedrockService.js     # Bedrock Converse API (Nova Lite)
│   │   ├── knowledgeService.js   # Bedrock Knowledge Base RAG
│   │   ├── lexService.js         # Lex V2 intent detection
│   │   ├── novaSonicService.js   # Nova Sonic bidirectional streaming
│   │   └── streamingService.js   # WebSocket session management
│   ├── routes/
│   │   ├── voiceRoutesV2.js
│   │   └── knowledgeRoutesV2.js
│   └── config/
│       └── awsConfig.js
│
├── __tests__/
│   └── offline-features.test.js  # 37 passing tests
│
├── __mocks__/                    # Jest mocks for native modules
├── eas.json                      # EAS Build configuration
├── app.json                      # Expo app configuration
├── start-frontend.bat            # Launch Expo dev server
└── start-backend.bat             # Launch backend server
```

---

## Knowledge Base Coverage

### Languages (11) — 4.2B+ speakers
| Language | Region | Native Name |
|---|---|---|
| English | Global | English |
| Hindi | South Asia | हिंदी |
| Bengali | South Asia | বাংলা |
| Telugu | South Asia | తెలుగు |
| Marathi | South Asia | मराठी |
| Tamil | South Asia | தமிழ் |
| Arabic | Middle East & Africa | العربية |
| French | Africa & Global | Français |
| Spanish | Latin America | Español |
| Swahili | East Africa | Kiswahili |
| Indonesian | SE Asia | Bahasa Indonesia |

### Knowledge Domains
| Domain | Coverage |
|---|---|
| Agriculture | 10 crops: Rice, Wheat, Corn, Cassava, Sorghum, Banana, Groundnut, Tomato, Potato, Beans |
| Health | 12 ailments: Fever, Diarrhea, Malaria, TB, Cholera, Diabetes, Blood Pressure, HIV/AIDS, Malnutrition, Eye Problems, Headache, Stomach Pain |
| Safety | 8 fraud types + emergency numbers for 16 countries |
| Livelihoods | Mobile banking, savings, microfinance, land rights, labor rights |
| Climate | Drought adaptation, flood preparation, soil conservation |
| Daily Living | Nutrition, hygiene, government schemes (PM-KISAN, Ayushman Bharat) |

### Emergency Numbers — 16 Countries
Global (112), India, Kenya, Nigeria, South Africa, Ghana, Tanzania, Ethiopia, Bangladesh, Pakistan, Indonesia, Philippines, Brazil, Mexico, Egypt, Morocco

---

## Getting Started

### Prerequisites
- Node.js 18+
- Android emulator or physical Android device
- Expo Go (for quick demo) or EAS Build (for full voice features)

### Install
```bash
npm install
cd backend && npm install
```

### Run (Expo Go — text input mode)
```bat
start-frontend.bat
```
Or: `npx expo start --clear` then press `a`

> Note: In Expo Go, `@react-native-voice/voice` is unavailable. The app automatically shows a text input fallback so all features still work.

### Run (Full voice — dev build)
```bash
npx eas build --profile development --platform android
```
Install the generated APK on your device. Full STT works in dev builds.

### Run backend
```bat
start-backend.bat
```
Backend runs on `http://localhost:3000`. The app works fully offline without it.

### Configure AWS (optional)
Copy `backend/.env.example` to `backend/.env` and fill in:
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
KNOWLEDGE_BASE_ID=...        # Bedrock Knowledge Base ID
LEX_BOT_ID=...               # Lex V2 Bot ID
```
Without AWS credentials, the app uses the on-device knowledge base automatically.

---

## Running Tests

```bash
npm test
```

37 tests covering `EnhancedOfflineService`, `OfflineReminderService`, and `OfflineAIService`. All passing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 / React Native 0.81 |
| Navigation | Expo Router (file-based) |
| Speech-to-Text | @react-native-voice/voice |
| Text-to-Speech | expo-speech (natural, multi-language) |
| Storage | AsyncStorage |
| i18n | i18next + react-i18next |
| Icons | Ionicons (@expo/vector-icons) |
| Backend | Node.js + Express |
| AI Core | Amazon Bedrock (Nova Lite via Converse API) |
| RAG | Amazon Bedrock Knowledge Bases |
| Intent | Amazon Lex V2 |
| Streaming | Amazon Nova Sonic (bidirectional, when available) |
| WebSocket | ws library |
| Build | EAS Build |
| Tests | Jest + jest-expo |

---

## Competitive Differentiation

| Feature | VoiceAid | Gemini | Siri | ChatGPT |
|---|---|---|---|---|
| Works offline | Yes | No | No | No |
| No reading required | Yes | No | No | No |
| Single-button UI | Yes | No | No | No |
| Non-literate users | Designed for | Not considered | Not considered | Not considered |
| Proactive scam warnings | Yes | No | No | No |
| Rural agriculture knowledge | Deep | Generic | None | Generic |
| Works on $50 Android | Yes | Requires data | iOS only | Requires data |
| 11 languages offline | Yes | Online only | Limited | Online only |

---

## AWS Services Used

- **Amazon Bedrock** — Nova Lite model via Converse API for text generation
- **Amazon Bedrock Knowledge Bases** — RAG with S3-backed expert documents
- **Amazon Nova Sonic** — Bidirectional speech-to-speech streaming (preview)
- **Amazon Lex V2** — Intent detection and dialogue management
- **Amazon S3** — Knowledge document storage
- **AWS Amplify** — DataStore sync for offline-first data

---

## Competition

AWS 10,000 AIdeas — Social Impact Category
Finalist among top 50 from thousands of global submissions.
Community voting: April 17–23, 2026.

GitHub: https://github.com/pwnjoshi/VoiceAid
