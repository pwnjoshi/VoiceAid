"""
Voice AI Service with Nova Sonic Integration (Simplified Version)
Works without PyAudio - uses text input with text-to-speech output
"""

import pyttsx3
import requests
import os
from typing import Optional

# Try to import API key from config file
try:
    from config import ANTHROPIC_API_KEY
    NOVA_SONIC_API_KEY = ANTHROPIC_API_KEY
except ImportError:
    # Fallback to environment variable
    NOVA_SONIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "your-api-key-here")

# Nova Sonic API Configuration
NOVA_SONIC_API_URL = "https://api.anthropic.com/v1/messages"


def capture_voice() -> Optional[str]:
    """
    Capture user input via text (keyboard).
    
    Returns:
        str: User input text, or None if empty
    """
    print("\n" + "="*50)
    user_input = input("You: ").strip()
    
    if not user_input:
        return None
    
    return user_input


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
        print(f"\nAI Response: {ai_response}")
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
    try:
        engine = pyttsx3.init()
        
        # Configure speech properties
        engine.setProperty('rate', 150)  # Speed of speech
        engine.setProperty('volume', 0.9)  # Volume (0.0 to 1.0)
        
        print("\nSpeaking response...")
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"Text-to-speech error: {e}")


def main_loop() -> None:
    """
    Main continuous interaction loop.
    Gets text input, processes with Nova Sonic, and speaks response.
    Continues until user types 'exit' or 'quit'.
    """
    print("=" * 50)
    print("Voice AI Service with Nova Sonic (Text Input Mode)")
    print("=" * 50)
    print("Type your message and press Enter.")
    print("Type 'exit' or 'quit' to stop the program.")
    print("=" * 50)
    
    while True:
        # Step 1: Capture text input
        user_input = capture_voice()
        
        # Skip if no input was captured
        if not user_input:
            continue
        
        # Check for exit commands
        if user_input.lower() in ['exit', 'quit', 'stop', 'goodbye']:
            print("\nGoodbye!")
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
        
        print("\n" + "-" * 50)
        # Loop continues automatically for next interaction


if __name__ == "__main__":
    main_loop()
