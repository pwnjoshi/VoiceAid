# Voice AI Service with Nova Sonic

A continuous voice interaction system that listens to your voice, processes it with Nova Sonic AI, and responds with speech.

## Features

- **Voice Input**: Captures speech from your microphone
- **AI Processing**: Sends text to Nova Sonic (Claude) API
- **Voice Output**: Converts AI responses to speech
- **Continuous Loop**: Automatically listens for next input after responding

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up your API key:
```bash
# On Windows (PowerShell)
$env:ANTHROPIC_API_KEY="your-api-key-here"

# On Windows (CMD)
set ANTHROPIC_API_KEY=your-api-key-here

# Or edit the script and replace the API key directly
```

## Usage

Run the script:
```bash
python voice_ai_service.py
```

The system will:
1. Listen for your voice input
2. Convert speech to text
3. Send to Nova Sonic API
4. Receive AI response
5. Speak the response back to you
6. Automatically continue listening

Say "exit", "quit", or "stop" to end the program.

## Troubleshooting

### PyAudio Installation Issues (Windows)
If PyAudio fails to install, download the appropriate wheel file:
```bash
pip install pipwin
pipwin install pyaudio
```

### Microphone Not Working
- Check microphone permissions in Windows settings
- Ensure microphone is set as default recording device
- Test microphone in Windows Sound settings

### Speech Recognition Errors
- Speak clearly and at a moderate pace
- Reduce background noise
- Ensure stable internet connection (Google Speech Recognition requires internet)

## Project Structure

```
voice_ai_service.py    # Main script with all functions
requirements.txt       # Python dependencies
README_VOICE_AI.md    # This file
```

## Functions

- `capture_voice()`: Captures and converts speech to text
- `send_to_nova_sonic()`: Sends text to AI and gets response
- `speak_response()`: Converts text to speech and plays it
- `main_loop()`: Orchestrates the continuous interaction loop
