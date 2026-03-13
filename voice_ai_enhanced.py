"""
Voice AI Service - ENHANCED VERSION
Features: Conversation history, faster responses, better voice control
"""

import pyttsx3
import requests
import os
from typing import Optional, List, Dict

# Groq API Configuration
try:
    from config import GROQ_API_KEY
except ImportError:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your-groq-api-key")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Conversation history for context
conversation_history: List[Dict] = []


def capture_voice() -> Optional[str]:
    """Capture user input via text"""
    print("\n" + "="*50)
    user_input = input("You: ").strip()
    return user_input if user_input else None


def send_to_groq(user_input: str, remember_context: bool = True) -> Optional[str]:
    """
    Send user input to Groq AI with conversation history.
    
    Args:
        user_input: The text to send to the AI
        remember_context: Whether to remember conversation history
        
    Returns:
        str: AI-generated response text
    """
    try:
        print("Thinking...")
        
        # Add user message to history
        if remember_context:
            conversation_history.append({
                "role": "user",
                "content": user_input
            })
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Build messages with history
        messages = [
            {
                "role": "system",
                "content": "You are a helpful, friendly AI assistant. Keep responses concise (2-3 sentences) and conversational."
            }
        ]
        
        # Add conversation history (last 10 messages for context)
        if remember_context:
            messages.extend(conversation_history[-10:])
        else:
            messages.append({"role": "user", "content": user_input})
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 200
        }
        
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            response_data = response.json()
            ai_response = response_data["choices"][0]["message"]["content"]
            
            # Add AI response to history
            if remember_context:
                conversation_history.append({
                    "role": "assistant",
                    "content": ai_response
                })
            
            print(f"\nAI Response: {ai_response}")
            return ai_response
            
        else:
            print(f"API Error: {response.status_code}")
            return "I'm having trouble connecting. Please try again."
        
    except Exception as e:
        print(f"Error: {e}")
        return "Sorry, I encountered an error. Please try again."


def speak_response(text: str, rate: int = 150) -> None:
    """
    Convert text to speech with adjustable speed.
    
    Args:
        text: Text to speak
        rate: Speech rate (default 150, range 100-200)
    """
    try:
        engine = pyttsx3.init()
        engine.setProperty('rate', rate)
        engine.setProperty('volume', 0.9)
        
        print("\n🔊 Speaking response...")
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"Text-to-speech error: {e}")


def show_help():
    """Display available commands"""
    print("\n" + "="*50)
    print("COMMANDS:")
    print("  'clear' or 'reset' - Clear conversation history")
    print("  'faster' - Increase speech speed")
    print("  'slower' - Decrease speech speed")
    print("  'help' - Show this help message")
    print("  'exit' or 'quit' - Stop the program")
    print("="*50)


def main_loop() -> None:
    """Main interaction loop with enhanced features"""
    speech_rate = 150  # Default speech rate
    
    print("=" * 50)
    print("🎙️  Voice AI Service - ENHANCED VERSION")
    print("=" * 50)
    print("Powered by Groq (Llama 3.3)")
    print("Type 'help' for commands")
    print("=" * 50)
    
    while True:
        user_input = capture_voice()
        
        if not user_input:
            continue
        
        # Handle commands
        user_lower = user_input.lower()
        
        if user_lower in ['exit', 'quit', 'stop', 'goodbye']:
            print("\n👋 Goodbye!")
            speak_response("Goodbye! Have a great day!", speech_rate)
            break
        
        elif user_lower in ['clear', 'reset']:
            conversation_history.clear()
            print("✓ Conversation history cleared!")
            speak_response("Memory cleared. Starting fresh!", speech_rate)
            continue
        
        elif user_lower == 'faster':
            speech_rate = min(200, speech_rate + 25)
            print(f"✓ Speech rate increased to {speech_rate}")
            speak_response("Speaking faster now!", speech_rate)
            continue
        
        elif user_lower == 'slower':
            speech_rate = max(100, speech_rate - 25)
            print(f"✓ Speech rate decreased to {speech_rate}")
            speak_response("Speaking slower now!", speech_rate)
            continue
        
        elif user_lower == 'help':
            show_help()
            continue
        
        # Get AI response
        ai_response = send_to_groq(user_input)
        
        if ai_response:
            speak_response(ai_response, speech_rate)
        
        print("\n" + "-" * 50)


if __name__ == "__main__":
    main_loop()
