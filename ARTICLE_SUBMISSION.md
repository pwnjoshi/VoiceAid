# AIdeas Finalist: VoiceAid – Bridging the Digital Divide for the Non-Literate and Elderly

**App Category:** Social Impact  
**Tags:** #aideas-2025 #aideas-2025-finalist #social-impact #APJC  
**Team:** Pawan Joshi, Bhumika Bhatt, Mehak Sethi, Vidushi Mohan  
**GitHub:** https://github.com/pwnjoshi/VoiceAid

---

## My Vision

VoiceAid is a voice-first assistant built for people who are left behind by text-based technology — non-literate adults, elderly users, and people living in places where internet connectivity is unreliable or absent.

The idea is simple: if a person can speak, they should be able to get help. They should not need to read a screen, type a query, or navigate a menu to access information that could protect their health, improve their harvest, or keep them safe from fraud.

Most voice assistants today are built for users who are already digitally confident. They expect structured commands, fast internet, and a level of familiarity with apps that hundreds of millions of people simply do not have. VoiceAid is built for a different user — one who may be holding a smartphone for the first time, who speaks in a regional dialect, and who needs an answer they can act on immediately.

The core design principle is what I call **orality-first**: the entire experience is built around spoken conversation, not text. One large button. Color-coded states. Short spoken answers. Binary yes/no decision paths. No reading required at any point.

But the deeper vision is not just about the interface. It is about building a system that is genuinely extensible — one that can grow into new languages, new regions, and new knowledge domains without being rebuilt from scratch each time. That is what separates a prototype from a real product.

---

## Why This Matters

The scale of the problem is not abstract. UNESCO estimates 700 million adults worldwide cannot read or write. The World Bank puts 2.7 billion people without reliable internet access. These two groups overlap significantly, and they are the people most likely to be harmed by the digital divide — not just inconvenienced by it.

Consider three real scenarios:

A smallholder farmer in rural Kenya notices white spots on his maize crop. He cannot read the pesticide label. He cannot search online. He loses the crop. With VoiceAid, he taps a button, describes what he sees, and hears a specific, actionable answer in Swahili.

An elderly woman in rural India receives a phone call. The caller claims to be from her bank and asks for her OTP. She does not know what an OTP is or why sharing it is dangerous. VoiceAid detects the scam pattern in her question and immediately speaks a warning before she can respond.

A mother in rural Bangladesh wants to know whether her child's fever requires a doctor visit. She cannot read the health pamphlet at the clinic. VoiceAid tells her the symptoms to watch for, what to do at home, and exactly when to go to the hospital.

These are not edge cases. They are the daily reality for hundreds of millions of people. The existing technology landscape has not solved this because it was not designed with these users in mind. VoiceAid is.

---

## How I Built This

### The Architecture: Three Layers, One Promise

VoiceAid is built as a layered system. The promise to the user is always the same — ask a question, get a spoken answer — but the path to that answer adapts based on what is available.

**Layer 1: Voice Interface**  
The mobile app uses `expo-speech-recognition` for speech-to-text, which works in Expo Go on Android without requiring a custom build. This was a deliberate choice: it means the app can be demonstrated and tested on any Android device immediately, without a complex setup. The recognized text is shown live as the user speaks, so they can see they are being understood. Text-to-speech uses `expo-speech` with language-specific rate tuning — Hindi and Marathi at 0.88x, Tamil and Arabic at 0.85x — for natural delivery.

**Layer 2: Cloud Intelligence (when online)**  
When the device is online and the backend is reachable, the query goes to the Express server, which calls Amazon Bedrock's Converse API with the Nova Lite model. The system prompt is tuned specifically for non-literate users: answers must be two to four sentences, use simple language, and be spoken naturally. If a Bedrock Knowledge Base is configured, the controller first calls `RetrieveAndGenerateCommand` for grounded RAG answers before falling back to direct generation. Amazon Lex V2 sits in front of this to classify intent — `GetAgricultureInfo`, `GetHealthAdvice`, `ReportScam` — and extract slots that improve retrieval precision.

**Layer 3: On-Device Intelligence (always available)**  
This is the most important layer. At startup, `EnhancedOfflineService` builds a keyword-to-content search index from the local `offlineKnowledge.json`. Every query is scored against this index. The highest-scoring entry is returned with a confidence value. If confidence is below threshold, a category-specific fallback is returned. The user always gets an answer, even with no internet and no backend.

The fallback chain is: Nova Sonic streaming → Bedrock RAG → on-device search → pattern matching. Each level degrades gracefully. The user never sees a failure state.

### The Real Architectural Improvement

The judge feedback asked for more languages and more knowledge. The honest response is not "we added more." The honest response is: **we built the system so that adding more is the easy part.**

Language support in VoiceAid is a modular layer. Each language is a JSON translation file plus a BCP-47 locale code for STT and TTS. Adding a new language requires writing one translation file and one locale mapping — not changing any application logic. The current 11 languages (English, Hindi, Bengali, Telugu, Marathi, Tamil, Arabic, French, Spanish, Swahili, Indonesian) cover 4.2 billion speakers, but the architecture supports any language that Android's speech recognition supports.

Knowledge is organized as domain packs, not a flat list of facts. Each domain — agriculture, health, safety, livelihoods, climate — has its own section in the knowledge JSON with a consistent structure. Adding a new crop or a new ailment means adding one object to the right section. The search index rebuilds automatically at startup. A regional NGO could contribute a "cassava diseases in East Africa" pack without touching any application code.

This is the difference between a prototype and a platform.

### Scalability and Cost

The judge feedback asked for a scalability and cost analysis. Here is the honest one.

The on-device layer has zero marginal cost. It runs on the device, uses no API calls, and scales to any number of users without any infrastructure cost. For the majority of queries — common health questions, basic farming advice, scam warnings — the on-device layer is sufficient.

The cloud layer (Bedrock) is only invoked when the user is online and the query exceeds the local knowledge base's confidence threshold. At scale, this means AWS costs scale with the subset of users who are online and asking complex questions, not with total user count. Amazon Nova Lite costs approximately $0.00006 per 1,000 input tokens. A typical query is 50-100 tokens. At 1 million queries per day, with 20% going to the cloud layer, the daily Bedrock cost is approximately $1.20. That is a viable cost structure for a social-impact product.

Nova Sonic streaming is reserved for the highest-value interactions — real-time voice conversations where latency matters. Its cost is higher, but it is only used when the user is in a full conversational session, not for simple knowledge queries.

### User Testing: What We Know and What We Do Not

The judge feedback noted the absence of real-world user testing. This is the most honest gap in the project.

We have not conducted formal user studies with non-literate populations. What we have done is design every interaction based on published research on low-literacy UX: binary dialogue flows from the GSMA Connected Women research, single-action screens from the Praekelt Foundation's mobile health work, and color-coded state indicators from accessibility research on cognitive load reduction.

The text input fallback — which appears automatically when speech recognition is unavailable — was added specifically because we know from field research that first-time smartphone users often have difficulty with microphone permissions. The app should never fail to be useful.

The next step for VoiceAid is a structured pilot with a community health worker program in a rural area. That is the honest answer to the user testing gap: we know what we have not done, and we have a plan for doing it.

---

## Demo

*[YouTube embed — 3-minute demo showing voice query in English, language switch to Hindi, offline mode, and OTP scam warning]*

---

## What I Learned

### The feedback that changed how I think

The most important piece of judge feedback was not about features. It was the implicit challenge behind all five critiques: **prove that this is a real product, not a demo.**

A demo can claim any number of languages. A real product explains how languages are added, maintained, and tested. A demo can list knowledge topics. A real product explains how knowledge is structured so it can be expanded by people who are not engineers.

That reframing changed everything about how I describe VoiceAid. The story is no longer "we support 11 languages and 10 crops." The story is "we built a system where language and knowledge are modular, so the product can grow into any region without being rebuilt."

### The offline-first lesson

The second insight was about what "offline-first" actually means in practice. It is not enough to have a fallback. The fallback has to be good enough to be the primary experience for most users most of the time.

In our target regions, internet connectivity is intermittent, not absent. Users may have 2G for part of the day and nothing for the rest. The on-device knowledge base has to be comprehensive enough that a user who never connects to the internet still gets real value from the app. That is why the knowledge base covers 10 crops, 12 health topics, 8 fraud types, and emergency numbers for 16 countries — not because we wanted a bigger number, but because those are the topics that matter most to the people who will use this offline.

### The scalability insight

The third insight was about cost structure. Social-impact technology has to be financially sustainable to be real. A product that costs $10 per user per month cannot reach the people who need it most.

The layered architecture solves this. The expensive cloud processing is reserved for the queries that genuinely need it. The cheap on-device processing handles everything else. That is not a compromise — it is the right design for this use case.

---

## Closing Thought

VoiceAid is not trying to be the most powerful AI assistant. It is trying to be the most useful one for the people who have been left out of every previous wave of technology.

The best social-impact products are not the ones that look impressive in a demo. They are the ones that remain understandable, dependable, and respectful in the hands of the people who need them most — especially when the internet is slow, the battery is low, and the user has never used an app before.

That is the product we are building.

---

*GitHub: https://github.com/pwnjoshi/VoiceAid*  
*Team: Pawan Joshi, Bhumika Bhatt, Mehak Sethi, Vidushi Mohan*  
*AWS 10,000 AIdeas Finalist — Social Impact — APJC Region*
