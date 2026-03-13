"""
Voice AI Service with Nova Sonic Integration
Continuous voice interaction loop: listen -> process -> respond -> repeat
"""

import speech_recognition as sr
import pyttsx3
import requests
import json
import os
from typing import Optional

# Nova Sonic API Configuration
NOVA_SONIC_API_URL = "https://api.anthropic.com/v1/messages"
NOVA_SONIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "your-api-key-here")


def capture_voice() -> Optional[str]:
    """
    Capture voice input from microphone and convert to text.
    
    Returns:
        str: Recognized text from speech, or None if recognition fails
    """
    recognizer = sr.Recognizer()
    
    with sr.Microphone() as source:
        print("Listening... (speak now)")
        
        # Adjust for ambient noise
        recognizer.adjust_for_ambient_noise(source, duration=0.5)
        
        try:
            # Listen for audio input
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
            print("Processing speech...")
            
            # Convert speech to text using Google Speech Recognition
            text = recognizer.recognize_google(audio)
            print(f"You said: {text}")
            return text
            
        except sr.WaitTimeoutError:
            print("No speech detected. Listening again...")
            return None
        except sr.UnknownValueError:
            print("Could not understand audio. Please try again.")
            return None
        except sr.RequestError as e:
            print(f"Speech recognition error: {e}")
            return None


def send_to_nova_sonic(user_input: str) -> Optional[str]:
    """
    Send user input to Nova Sonic API and get AI response.
    
    Args:
        user_input: The text to send to the AI
        
    Returns:
        str: AI-generated response text, or None if request fails
    """
    headers = {
        "x-api-key": NOVA_SONIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 1024,
        "messages": [
            {
                "role": "user",
                "content": user_input
            }
        ]
    }
    
    try:
        print("Sending to Nova Sonic...")
        response = requests.post(NOVA_SONIC_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        # Extract response text from API response
        response_data = response.json()
        ai_response = response_data["content"][0]["text"]
        print(f"AI Response: {ai_response}")
        return ai_response
        
    except requests.exceptions.RequestException as e:
        print(f"API request error: {e}")
        return None
    except (KeyError, IndexError) as e:
        print(f"Error parsing API response: {e}")
        return None


def speak_response(text: str) -> None:
    """
    Convert text to speech and play it through speakers.
    
    Args:
        text: The text to convert to speech
    """
    engine = pyttsx3.init()
    
    # Configure speech properties
    engine.setProperty('rate', 150)  # Speed of speech
    engine.setProperty('volume', 0.9)  # Volume (0.0 to 1.0)
    
    print("Speaking response...")
    engine.say(text)
    engine.runAndWait()


def main_loop() -> None:
    """
    Main continuous interaction loop.
    Listens for voice input, processes with Nova Sonic, and speaks response.
    Continues until user says 'exit' or 'quit'.
    """
    print("=" * 50)
    print("Voice AI Service with Nova Sonic")
    print("=" * 50)
    print("Say 'exit' or 'quit' to stop the program.")
    print()
    
    while True:
        # Step 1: Capture voice input
        user_input = capture_voice()
        
        # Skip if no input was captured
        if not user_input:
            continue
        
        # Check for exit commands
        if user_input.lower() in ['exit', 'quit', 'stop', 'goodbye']:
            print("Goodbye!")
            speak_response("Goodbye! Have a great day!")
            break
        
        # Step 2: Send to Nova Sonic API
        ai_response = send_to_nova_sonic(user_input)
        
        # Skip if API request failed
        if not ai_response:
            speak_response("Sorry, I encountered an error. Please try again.")
            continue
        
        # Step 3: Speak the response
        speak_response(ai_response)
        
        print("\n" + "-" * 50 + "\n")
        # Loop continues automatically for next interaction


if __name__ == "__main__":
    main_loop()
