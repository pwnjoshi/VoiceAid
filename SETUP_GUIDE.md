# Complete Setup Guide - Voice AI Service

## Quick Start (Text Input Mode - No Microphone)

### 1. Set API Key
```powershell
$env:ANTHROPIC_API_KEY="your-api-key-here"
```

### 2. Run the Simple Version
```bash
python voice_ai_service_simple.py
```

This works immediately! You type, AI speaks back.

---

## Full Voice Mode (With Microphone)

If you want REAL voice input (speaking instead of typing), follow these steps:

### Option A: Install PyAudio with Pre-built Wheel (Easiest)

1. Download the PyAudio wheel for Python 3.14:
   - Visit: https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio
   - Download: `PyAudio‑0.2.14‑cp314‑cp314‑win_amd64.whl`

2. Install it:
```bash
pip install path\to\PyAudio‑0.2.14‑cp314‑cp314‑win_amd64.whl
```

3. Run the full version:
```bash
python voice_ai_service.py
```

### Option B: Install Visual C++ Build Tools (More Complex)

1. Download Microsoft C++ Build Tools:
   https://visualstudio.microsoft.com/visual-cpp-build-tools/

2. Install with "Desktop development with C++" workload

3. Install PyAudio:
```bash
pip install PyAudio
```

4. Run:
```bash
python voice_ai_service.py
```

---

## How to Use

### Text Input Mode (voice_ai_service_simple.py)
1. Run the script
2. Type your message and press Enter
3. AI will respond with voice
4. Type "exit" to quit

### Voice Input Mode (voice_ai_service.py)
1. Run the script
2. Speak when you see "Listening..."
3. AI will respond with voice
4. Say "exit" to quit

---

## Troubleshooting

### "API request error"
- Check your API key is set correctly
- Verify you have internet connection
- Ensure your API key is valid

### "Microphone error"
- Check microphone permissions in Windows Settings
- Set microphone as default recording device
- Use the simple version (text input) as fallback

### Text-to-speech not working
- Restart the script
- Check speaker volume
- Verify pyttsx3 is installed: `pip list | findstr pyttsx3`

---

## Files Overview

- `voice_ai_service_simple.py` - Text input + voice output (works now!)
- `voice_ai_service.py` - Voice input + voice output (needs PyAudio)
- `requirements.txt` - Python dependencies
- `README_VOICE_AI.md` - Detailed documentation
- `SETUP_GUIDE.md` - This file
