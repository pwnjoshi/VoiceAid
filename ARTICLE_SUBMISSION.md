# AIdeas Finalist: VoiceAid – Bridging the Digital Divide for the Non-Literate and Elderly

**App Category:** Social Impact  
**Team:** Pawan Joshi, Bhumika Bhatt, Mehak Sethi, Vidushi Mohan  
**GitHub:** https://github.com/pwnjoshi/VoiceAid  
**Tags:** #aideas-2025 #aideas-2025-finalist #social-impact #APJC

---

## My Vision

VoiceAid exists to answer one question: what does the digital world look like for someone who cannot read?

For 700 million non-literate adults and hundreds of millions of elderly people worldwide, the answer is: it does not exist. Every app, every chatbot, every government portal assumes you can decode text, navigate menus, and manage multi-step flows. Gemini is brilliant — if you can read. Siri is convenient — if you own an iPhone and speak standard English. ChatGPT is powerful — if you have reliable internet and can type.

None of them work for a 70-year-old farmer in rural Kenya who has never held a smartphone. None of them work for an elderly woman in rural India who is being scammed on the phone right now and does not know it.

VoiceAid is built for those people. Not as an afterthought. As the primary design constraint.

Our vision is **Digital Dignity** — the idea that access to life-saving information about health, farming, and financial safety should not require literacy as a prerequisite.

---

## Why This Matters

### The Structural Failure of Current Technology

Mainstream voice assistants fail the most underserved populations for three specific reasons:

**1. Latency breaks the conversation.** Traditional STT → NLU → LLM → TTS pipelines introduce 2–4 second delays. For a user with low digital literacy, a three-second silence feels like a system failure. They abandon the interaction. Amazon Nova Sonic's bidirectional streaming eliminates this — the response begins before the user finishes speaking.

**2. Literacy bias in conversational design.** Existing assistants expect structured commands. They respond with lists of options. For an elderly user, remembering three options while waiting for a response is a high cognitive load. VoiceAid uses binary Yes/No dialogue flows — "You have a message from your son. Would you like to hear it?" — reducing cognitive friction to its minimum.

**3. Generalist knowledge is useless for specific survival needs.** Asking Gemini about rice pest control gives a generic answer. VoiceAid's knowledge base contains specific, actionable advice for 10 crops across multiple growing regions — the kind of information that determines whether a family eats this season.

### The Scale of the Opportunity

- **700M+** non-literate adults globally (UNESCO, 2023)
- **2.7B** people without reliable internet access
- **500M** smallholder farmers who need agricultural advice
- **Elderly populations** are the #1 target of phone scams — in India alone, Rs 10,000 crore is lost annually to OTP fraud

VoiceAid addresses all four groups simultaneously.

---

## How I Built This

### Architecture Overview

VoiceAid is a hybrid offline-first / cloud-optional system. The architecture has two distinct paths that activate based on connectivity:

```
User speaks
    │
    ▼
Device STT (@react-native-voice/voice)
    │
    ├── Online + AWS configured?
    │       │
    │       ├── Lex V2: intent detection
    │       └── Bedrock Knowledge Base: RAG answer
    │               │
    │               └── Nova Lite (Converse API): response generation
    │
    └── Offline / no backend?
            │
            └── EnhancedOfflineService: keyword-indexed local search
                    │
                    └── expo-speech: spoken answer
```

### 1. The Intelligence Engine: Amazon Bedrock

The cloud path uses Amazon Bedrock's **Converse API** with the **Nova Lite** model. This is the correct API for production use — not the older `InvokeModel` endpoint. The Converse API supports system prompts, multi-turn conversation, and consistent response formatting across all Bedrock models.

Our system prompt is tuned specifically for non-literate users:

```javascript
const SYSTEM_PROMPT = `You are VoiceAid, a helpful voice assistant for rural communities.
Your answers must be:
- Short (2-4 sentences maximum)
- Simple language — no jargon
- Practical and actionable
- Spoken naturally (this will be read aloud)`;
```

When a Bedrock Knowledge Base is configured, the controller first calls `RetrieveAndGenerateCommand` for grounded RAG answers. If the knowledge base is not configured, it falls back to direct Nova Lite generation. If Bedrock is unavailable entirely, it falls back to the on-device knowledge base. The user always gets an answer.

### 2. Intent Detection: Amazon Lex V2

Amazon Lex V2 sits between the user's transcript and the knowledge retrieval. It classifies intent — `GetAgricultureInfo`, `GetHealthAdvice`, `ReportScam`, `GetEmergencyNumber` — and extracts slots (crop type, ailment, country). This structured intent feeds into the knowledge base query, improving retrieval precision.

The Lex bot is configured with sample utterances that include hesitations, informal grammar, and regional speech patterns — because real users say "umm my rice has white spots what do I do" not "query: rice pest control."

### 3. Nova Sonic: Bidirectional Streaming

Amazon Nova Sonic enables real-time speech-to-speech streaming. Unlike cascaded pipelines, Nova Sonic processes audio as a continuous stream — understanding when a user pauses to think versus when they have finished speaking. This enables natural interruptions and turn-taking.

The `NovaSonicService` implements the correct bidirectional event-stream protocol:

```javascript
async function* inputStream() {
  yield { sessionStart: { promptName, inferenceConfiguration, audioInputConfiguration } };
  yield { contentStart: { role: 'USER', type: 'AUDIO' } };
  // Audio chunks at 16kHz PCM
  for (let i = 0; i < audioBuffer.length; i += CHUNK_SIZE) {
    yield { audioInput: { content: audioBuffer.slice(i, i + CHUNK_SIZE).toString('base64') } };
  }
  yield { contentEnd: {} };
  yield { sessionEnd: {} };
}
```

Nova Sonic is currently in preview. The service gracefully falls back to Bedrock text generation when the bidirectional stream SDK is not yet stable — ensuring the app works today while being ready for Nova Sonic when it reaches GA.

### 4. On-Device RAG: EnhancedOfflineService

The offline path is not a simple keyword lookup. It is a proper RAG-like system built entirely on-device:

1. At startup, `buildSearchIndex()` walks the entire `offlineKnowledge.json` and builds a keyword → content map
2. At query time, the user's words are scored against every indexed entry
3. The highest-scoring entry is returned with a confidence score
4. If confidence is below threshold, a category-specific fallback is returned

The knowledge base covers:
- **10 crops**: Rice, Wheat, Corn, Cassava, Sorghum, Banana, Groundnut, Tomato, Potato, Beans — with planting, pests, fertilizer, harvest, and water guidance for each
- **12 health topics**: Fever, Diarrhea, Malaria, Tuberculosis, Cholera, Diabetes, Blood Pressure, HIV/AIDS, Malnutrition, Eye Problems, Headache, Stomach Pain — with symptoms, home treatment, when to see a doctor, and prevention
- **8 fraud types**: OTP scam, phone scam, mobile money fraud, fake jobs, romance scam, investment scam, impersonation, phishing
- **Emergency numbers for 16 countries**: India, Kenya, Nigeria, South Africa, Ghana, Tanzania, Ethiopia, Bangladesh, Pakistan, Indonesia, Philippines, Brazil, Mexico, Egypt, Morocco, plus global 112
- **Livelihoods**: Mobile banking, savings, microfinance, land rights, labor rights
- **Climate adaptation**: Drought-tolerant crops, flood preparation, soil conservation

### 5. The Mobile Interface

The UI is built around a single design principle: **one action at a time**.

The home screen has one large circular button. Its color communicates state without text:
- **Indigo** — ready to listen
- **Blue** — listening (with pulse animation)
- **Green** — processing
- **Orange** — speaking
- **Red** — error

When the user speaks, their transcript appears in real-time in a blue box below the button. When the answer arrives, it is spoken aloud and displayed as text. A replay button lets them hear it again.

For environments where `@react-native-voice/voice` is unavailable (Expo Go sandbox), the app automatically shows a text input field — ensuring the knowledge base and TTS always work regardless of build type.

### 6. Multi-Language Support

11 languages are supported with full i18n via `i18next`:

| Language | Region | BCP-47 |
|---|---|---|
| English | Global | en-US |
| Hindi | South Asia | hi-IN |
| Bengali | South Asia | bn-IN |
| Telugu | South Asia | te-IN |
| Marathi | South Asia | mr-IN |
| Tamil | South Asia | ta-IN |
| Arabic | Middle East & Africa | ar-SA |
| French | Africa & Global | fr-FR |
| Spanish | Latin America | es-ES |
| Swahili | East Africa | sw-KE |
| Indonesian | SE Asia | id-ID |

Language is auto-detected from device locale and persisted in AsyncStorage. TTS uses language-specific rate overrides — Hindi and Marathi at 0.88x, Tamil and Arabic at 0.85x — for natural delivery.

### 7. Proactive Fraud Detection

When a user asks about OTP, bank, PIN, UPI, or mobile money, the app immediately speaks a warning before displaying the answer:

> "Warning. Never share your OTP, PIN, or password with anyone. Banks and government never ask for this."

This proactive layer is the feature that matters most for elderly users — who are the primary targets of phone scams globally.

### 8. Reminders

The `OfflineReminderService` manages medicine, meal, and custom reminders entirely on-device. No backend required. Reminders are stored in AsyncStorage and checked every minute. The notification stub is designed to be replaced with `expo-notifications` in a production build.

---

## Demo

[YouTube embed — 3 minute demo showing voice query, offline mode, language switching, and OTP scam warning]

---

## What I Learned

### From the Judge Feedback

**"Limited language support restricts reach."** This was the most actionable feedback. We expanded from 2 languages (English, Hindi) to 11 — covering 4.2 billion speakers across South Asia, Africa, Latin America, and SE Asia. The architecture was already ready for this; it was a matter of writing the translation files and adding the locales to i18n.

**"Knowledge base scope limited to 3 crops and 4 ailments."** We expanded to 10 crops and 12 ailments, adding globally critical crops like Cassava (staple for 800M in Africa) and Sorghum (most drought-resistant cereal), and globally critical health topics like Tuberculosis, Cholera, and HIV/AIDS — the diseases that actually kill people in our target regions.

**"No evidence of real-world user testing."** This is the honest gap. We have not done formal user testing with non-literate populations. What we have done is design every interaction based on published research on low-literacy UX — binary dialogue flows, color-coded states, single-action screens, no text labels on primary actions.

**"Scalability and cost analysis missing."** The offline-first architecture is the answer to this. The on-device knowledge base handles the vast majority of queries at zero marginal cost. AWS Bedrock is only invoked when the user is online and the query exceeds the local knowledge base's confidence threshold. At scale, this means AWS costs scale with the subset of users who are online and asking complex questions — not with total user count.

### Key Insights from Development

**Offline-first is not a feature — it is the foundation.** Every architectural decision was made with the question: "what happens when there is no internet?" The answer had to be "the app still works." This constraint forced us to build a genuinely useful on-device system rather than a thin wrapper around cloud APIs.

**The AWS ecosystem is genuinely powerful for this use case.** Bedrock Knowledge Bases + Lex V2 + Nova Sonic is a complete voice AI stack. The challenge is not capability — it is configuration. Getting the right IAM permissions, the right model ARNs, and the right API formats took significant time. The documentation for Nova Sonic's bidirectional streaming in particular required careful reading of the preview SDK.

**Graceful degradation is a product feature.** The app has four levels of degradation: Nova Sonic streaming → Bedrock RAG → on-device search → pattern matching. Users never see an error screen. They always get an answer. This is what makes it usable in the real world.

**The real competition is not other apps.** The real competition is the status quo — where a non-literate farmer has no access to pest control advice and loses their crop, or where an elderly person shares their OTP because no one warned them. Measured against that baseline, even the offline pattern-matching fallback is a meaningful improvement.

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Mobile Framework | React Native (Expo SDK 54) |
| Navigation | Expo Router (file-based) |
| Speech-to-Text | @react-native-voice/voice |
| Text-to-Speech | expo-speech (natural, multi-language) |
| Local Storage | AsyncStorage |
| Internationalization | i18next + react-i18next |
| Icons | Ionicons (@expo/vector-icons) |
| Backend | Node.js + Express |
| AI Generation | Amazon Bedrock (Nova Lite, Converse API) |
| Knowledge Retrieval | Amazon Bedrock Knowledge Bases (RAG) |
| Intent Detection | Amazon Lex V2 |
| Voice Streaming | Amazon Nova Sonic (bidirectional, preview) |
| Document Storage | Amazon S3 |
| WebSocket | ws library |
| Build System | EAS Build |
| Testing | Jest + jest-expo (37 tests) |

---

## Conclusion

Technology is only truly advanced when it is accessible to everyone.

VoiceAid is not the most technically complex project in this competition. It is not using the largest model or the most AWS services. What it is doing is harder: it is designing for the user who has been systematically excluded from every previous wave of technology.

The farmer who cannot read the pest control label. The grandmother who cannot navigate the medicine reminder app. The elderly man who does not know that the person asking for his OTP is a criminal.

For those users, VoiceAid is not a convenience. It is access to information that changes outcomes.

That is what we built. That is why it matters.

---

*GitHub: https://github.com/pwnjoshi/VoiceAid*  
*Team: Pawan Joshi (@pwnjoshi), Bhumika Bhatt, Mehak Sethi, Vidushi Mohan*
