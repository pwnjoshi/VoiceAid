"""Quick test to verify your API key works"""

import requests
from config import ANTHROPIC_API_KEY

print("Testing API Key...")
print(f"Key starts with: {ANTHROPIC_API_KEY[:20]}...")

headers = {
    "x-api-key": ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
}

payload = {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello"}]
}

try:
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers=headers,
        json=payload
    )
    
    if response.status_code == 200:
        print("✓ API Key is VALID and working!")
        print(f"Response: {response.json()['content'][0]['text']}")
    else:
        print(f"✗ API Key ERROR: {response.status_code}")
        print(f"Message: {response.text}")
        
except Exception as e:
    print(f"✗ Error: {e}")
