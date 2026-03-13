"""Test script to verify all components are working"""

print("=" * 50)
print("Testing Voice AI Setup")
print("=" * 50)

# Test 1: Check imports
print("\n1. Testing imports...")
try:
    import pyttsx3
    print("   ✓ pyttsx3 installed")
except ImportError:
    print("   ✗ pyttsx3 NOT installed - run: pip install pyttsx3")

try:
    import requests
    print("   ✓ requests installed")
except ImportError:
    print("   ✗ requests NOT installed - run: pip install requests")

# Test 2: Check config file
print("\n2. Testing config file...")
try:
    from config import HUGGINGFACE_API_KEY
    if HUGGINGFACE_API_KEY and HUGGINGFACE_API_KEY != "your-huggingface-api-key":
        print(f"   ✓ Hugging Face API key found: {HUGGINGFACE_API_KEY[:10]}...")
    else:
        print("   ✗ Hugging Face API key not set in config.py")
except ImportError:
    print("   ✗ config.py file not found")
except Exception as e:
    print(f"   ✗ Error reading config: {e}")

# Test 3: Test text-to-speech
print("\n3. Testing text-to-speech...")
try:
    engine = pyttsx3.init()
    print("   ✓ Text-to-speech engine initialized")
    print("   Testing voice output...")
    engine.say("Hello, this is a test")
    engine.runAndWait()
    print("   ✓ Voice output working!")
except Exception as e:
    print(f"   ✗ Text-to-speech error: {e}")

# Test 4: Test API connection
print("\n4. Testing Hugging Face API...")
try:
    from config import HUGGINGFACE_API_KEY
    import requests
    
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    payload = {"inputs": "Hello"}
    url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"
    
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    
    if response.status_code == 200:
        print("   ✓ API connection successful!")
    elif response.status_code == 503:
        print("   ⚠ Model is loading (this is normal, try again in 20 seconds)")
    else:
        print(f"   ✗ API error: {response.status_code}")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ✗ API test error: {e}")

print("\n" + "=" * 50)
print("Setup test complete!")
print("=" * 50)
