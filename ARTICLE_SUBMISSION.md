# AIdeas Finalist: VoiceAid – Bridging the Digital Divide for the Non-Literate and Elderly

**App Category:** Social Impact  
**Tags:** #aideas-2025 #aideas-2025-finalist #social-impact #APJC  
**Team:** Pawan Joshi, Bhumika Bhatt, Mehak Sethi, Vidushi Mohan  
**GitHub:** https://github.com/pwnjoshi/VoiceAid

---

## My Vision

VoiceAid exists to answer a fundamental, often ignored question in the tech industry: What does the digital world look like for someone who cannot read?

For over 700 million non-literate adults and hundreds of millions of elderly individuals worldwide, the current answer is stark: it is a world that is effectively closed. Every modern application — from social media to government portals and banking apps — is built on a "literacy-first" model. This model assumes that a user can decode text, navigate hierarchical menus, interpret abstract iconography, and manage multi-step logical flows.

For a 70-year-old farmer in rural Kenya who has never held a smartphone, or an elderly woman in a small village in India who is currently being scammed on the phone, these interfaces are not merely "difficult" — they are structural barriers. Even the most advanced LLMs like Gemini or GPT-4 require a level of digital literacy to prompt effectively. If you cannot type your query or read the response, the "intelligence" of the model is irrelevant.

Our vision is to replace this exclusionary model with an **orality-first architecture**. Human speech is our oldest, most intuitive, and most natural technology. By building a system that communicates entirely through speech — mirroring natural conversation with all its hesitations, regional dialects, and cultural nuances — we provide **Digital Dignity**. In VoiceAid, the non-literate user is not an afterthought or a "special case" — they are the primary design constraint.

---

## Why This Matters

### The Competitive Landscape and Structural Failures

While mainstream voice assistants like Alexa, Siri, and Google Assistant have made strides in convenience for the urban elite, they fundamentally fail the most underserved populations.

**1. The Latency Gap and Cognitive Friction**  
Traditional voice assistants follow a "cascaded" architecture: STT → NLU → LLM → TTS. This multi-step process introduces a bottleneck of 2–4 seconds. For a user with low digital literacy, a three-second silence feels like a system failure — it disrupts the rhythm of turn-taking and causes the user to abandon the interaction entirely. Amazon Nova Sonic's bidirectional streaming eliminates this by allowing the response to begin before the user even finishes speaking.

**2. Literacy Bias in Conversational Design**  
Existing assistants expect clear, structured commands and often respond with lists of options. For an elderly user, remembering three spoken options while the assistant waits is a high cognitive load. VoiceAid solves this with binary decision logic — asking simple Yes/No questions to guide the user through a flow.

**3. Generalist Knowledge vs. Local Survival**  
Asking a generalist AI about rice pest control yields generic, non-actionable advice. VoiceAid's knowledge base is grounded in specific, localized reality — the kind of information that determines whether a family eats this season or loses their life savings to a fraudster.

### The Scale of the Opportunity

- **700M+** non-literate adults globally (UNESCO)
- **2.7B** people without reliable internet access
- **500M** smallholder farmers needing agricultural advice
- Elderly populations are the #1 target of phone scams — in India alone, ₹10,000 crore is lost annually to OTP fraud

---

## How I Built This

### Architecture Overview

VoiceAid is a hybrid offline-first / cloud-optional system with a four-layer fallback chain:

```
User speaks
    │
    ▼
expo-speech-recognition (device STT — works in Expo Go)
    │
    ├── Online + AWS configured?
    │       ├── Lex V2: intent detection + slot extraction
    │       └── Bedrock Knowledge Base: RAG answer
    │               └── Nova Lite (Converse API): response generation
    │
    └── Offline / no backend?
            └── EnhancedOfflineService: keyword-indexed local search
                    └── expo-speech: spoken answer (language-tuned TTS)
```

### 1. The Intelligence Engine: Amazon Bedrock & Nova Lite

The cloud path uses Amazon Bedrock's **Converse API** with the Nova Lite model — the production-standard for multi-turn conversations. Our system prompt is the "empathy layer" of our AI, constraining responses to 2–4 sentences in simple, spoken language. When a Bedrock Knowledge Base is configured, the controller calls `RetrieveAndGenerateCommand` for grounded RAG answers before falling back to direct generation.

### 2. Intent Detection: Amazon Lex V2

Amazon Lex V2 acts as our "traffic controller." It classifies intent (`GetAgricultureInfo`, `ReportScam`, `GetEmergencyNumber`) and extracts slots that improve retrieval precision. Our Lex bot is configured with sample utterances that include hesitations ("umm," "wait") and regional speech patterns — because real users do not speak in structured commands.

### 3. Real-Time Interaction: Amazon Nova Sonic

To solve the latency wall, we integrated Amazon Nova Sonic for real-time bidirectional speech-to-speech streaming. The service implements the correct event-stream protocol with `sessionStart`, `contentStart`, audio chunks, and `sessionEnd` events. It gracefully falls back to Bedrock text generation when the bidirectional stream SDK is not yet stable — ensuring the app works today while being ready for Nova Sonic at GA.

### 4. Proactive Fraud Detection

When a user asks about OTP, bank, PIN, UPI, or mobile money, the app immediately speaks a warning before displaying the answer:

> *"Warning. Never share your OTP, PIN, or password with anyone. Banks and government never ask for this."*

This proactive layer is the feature that matters most for elderly users — who are the primary targets of phone scams globally. The Safety tab also shows a persistent red banner with a tap-to-hear audio warning.

### 5. On-Device RAG: EnhancedOfflineService

Recognizing that internet is a luxury, we built a proper RAG system that runs entirely on-device. At startup, the app builds a keyword-to-content map from `offlineKnowledge.json`. Every query is scored against this index to find the most relevant advice. The knowledge base covers:

- **10 crops**: Rice, Wheat, Corn, Cassava, Sorghum, Banana, Groundnut, Tomato, Potato, Beans
- **12 health topics**: Fever, Diarrhea, Malaria, Tuberculosis, Cholera, Diabetes, Blood Pressure, HIV/AIDS, Malnutrition, Eye Problems, Headache, Stomach Pain
- **8 fraud types**: OTP scam, phone scam, mobile money fraud, fake jobs, romance scam, investment scam, impersonation, phishing
- **Emergency numbers for 16 countries**
- **Livelihoods**: Mobile banking, savings, microfinance, land rights
- **Climate adaptation**: Drought-tolerant crops, flood preparation

### 6. Multi-Language Support — A Modular Architecture

The judge feedback on language support resonated most. But the real improvement is not "we added more languages" — it is that **language is now a modular layer, not a fixed list**.

Each language is one JSON translation file plus one BCP-47 locale code. Adding a new language requires no application logic changes. The current 11 languages (English, Hindi, Bengali, Telugu, Marathi, Tamil, Arabic, French, Spanish, Swahili, Indonesian) cover 4.2 billion speakers. Language-specific TTS rate overrides — Arabic at 0.85x, Hindi at 0.88x — ensure natural delivery.

### 7. Scalability and Cost

The on-device layer has **zero marginal cost**. AWS Bedrock is only invoked when the user is online and the query exceeds local confidence threshold. At 1 million queries per day with 20% going to the cloud layer, the daily Bedrock cost is approximately $1.20. That is a viable cost structure for NGOs and social-impact deployments.

---

## Demo

*[YouTube embed — 3-minute demo showing voice query, live transcript, offline mode, language switch to Hindi, and OTP scam warning]*

---

## What I Learned

### Responding to Judge Feedback

**"Limited Language Support"** — Resonated most. We expanded to 11 languages covering 4.2 billion potential speakers. More importantly, we restructured language as a modular platform capability rather than a hardcoded list.

**"Limited Knowledge Base Scope"** — We expanded from 3 crops to 10 and from 4 ailments to 12, adding globally critical topics like Cassava (staple for 800M in Africa), Malaria, and Cholera. We built a modular "Knowledge Pack" architecture — new regions can add localized data without changing application code.

**"Scalability and Cost Analysis Missing"** — The layered offline-first architecture is the answer. On-device processing has zero marginal cost. Cloud processing scales with the subset of complex queries, not total user count.

**"No User Testing Evidence"** — This is the honest gap. We have not conducted formal user studies with non-literate populations. What we have done is design every interaction based on published research on low-literacy UX: binary dialogue flows, single-action screens, color-coded state indicators. The next step is a structured pilot with a community health worker program.

### Key Insights

**Accessibility is Foundation, Not a Feature.** If you do not build with the most "difficult" user in mind from Day 1, your architecture will always have a literacy bias.

**Offline-First is Non-Negotiable.** In our target regions, the internet is intermittent. Every feature must have a graceful degradation path: Cloud → Local RAG → Local Search.

**Orality is the Future.** We are not teaching the world to use tech. We are teaching tech to speak the world's language.

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Mobile Framework | React Native (Expo SDK 54) |
| Speech-to-Text | expo-speech-recognition (works in Expo Go) |
| Text-to-Speech | expo-speech (11 languages, rate-tuned) |
| AI Generation | Amazon Bedrock — Nova Lite (Converse API) |
| Knowledge Retrieval | Amazon Bedrock Knowledge Bases (RAG) |
| Intent Detection | Amazon Lex V2 |
| Voice Streaming | Amazon Nova Sonic (bidirectional, preview) |
| Offline AI | EnhancedOfflineService (on-device RAG) |
| Storage | AsyncStorage |
| i18n | i18next + react-i18next |
| Backend | Node.js + Express + WebSocket |
| Tests | Jest + jest-expo (37 passing) |

---

## Conclusion: A Route to Digital Inclusion

Technology is only truly "advanced" when it is accessible to everyone. For too long, the digital revolution has moved forward at the speed of the literate, leaving hundreds of millions behind.

VoiceAid is our challenge to that status quo. By combining the raw power of Amazon Bedrock and Nova Sonic with an orality-first design philosophy, we have created more than just an app. We have created a bridge — one that allows a farmer to protect his crops, a grandmother to manage her health, and a community to stay safe from fraud, all through the simple, dignified act of speaking.

This is our path to Digital Dignity.

---

*GitHub: https://github.com/pwnjoshi/VoiceAid*  
*Team: Pawan Joshi, Bhumika Bhatt, Mehak Sethi, Vidushi Mohan*  
*AWS 10,000 AIdeas Finalist — Social Impact — APJC Region*
