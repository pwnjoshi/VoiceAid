"""
Voice AI Service with Groq API (FREE and FAST)
Real AI responses with text-to-speech
Get free API key from: https://console.groq.com/keys
"""

import pyttsx3
import requests
import os
from typing import Optional

# Groq API Configuration (FREE)
try:
    from config import GROQ_API_KEY
except ImportError:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your-groq-api-key")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def capture_voice() -> Optional[str]:
    """Capture user input via text"""
    print("\n" + "="*50)
    user_input = input("You: ").strip()
    return user_input if user_input else None


def send_to_groq(user_input: str) -> Optional[str]:
    """
    Send user input to Groq AI and get response.
    
    Args:
        user_input: The text to send to the AI
        
    Returns:
        str: AI-generated response text
    """
    try:
        print("Thinking...")
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful, friendly AI assistant. Keep responses concise and conversational."
                },
                {
                    "role": "user",
                    "content": user_input
                }
            ],
            "temperature": 0.7,
            "max_tokens": 150
        }
        
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            response_data = response.json()
            ai_response = response_data["choices"][0]["message"]["content"]
            
            print(f"\nAI Response: {ai_response}")
            return ai_response
            
        else:
            print(f"API Error: {response.status_code}")
            print(f"Response: {response.text}")
            return "I'm having trouble connecting. Please check your API key."
        
    except Exception as e:
        print(f"Error: {e}")
        return "Sorry, I encountered an error. Please try again."


def speak_response(text: str) -> None:
    """Convert text to speech"""
    try:
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        engine.setProperty('volume', 0.9)
        
        print("\nSpeaking response...")
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"Text-to-speech error: {e}")


def main_loop() -> None:
    """Main interaction loop"""
    print("=" * 50)
    print("Voice AI Service with Groq (FREE)")
    print("=" * 50)
    
    if GROQ_API_KEY == "your-groq-api-key":
        print("\n⚠ WARNING: Groq API key not set!")
        print("Get your FREE key from: https://console.groq.com/keys")
        print("Add it to config.py as: GROQ_API_KEY = 'your-key-here'")
        print("\nRunning in DEMO mode...\n")
    
    print("Type your message and press Enter.")
    print("Type 'exit' or 'quit' to stop.")
    print("=" * 50)
    
    while True:
        user_input = capture_voice()
        
        if not user_input:
            continue
        
        if user_input.lower() in ['exit', 'quit', 'stop', 'goodbye']:
            print("\nGoodbye!")
            speak_response("Goodbye! Have a great day!")
            break
        
        ai_response = send_to_groq(user_input)
        
        if ai_response:
            speak_response(ai_response)
        
        print("\n" + "-" * 50)


if __name__ == "__main__":
    main_loop()
