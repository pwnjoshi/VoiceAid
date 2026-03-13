#!/bin/bash

# VoiceAid Voice AI Setup Script

echo "🎤 Setting up VoiceAid Voice AI..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Check if config.py exists
if [ ! -f "config.py" ]; then
    echo "📝 Creating config.py from example..."
    cp config.example.py config.py
    echo "✏️  Please edit config.py and add your Groq API key."
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Test setup
echo "🧪 Testing Voice AI setup..."
python3 test_setup.py

echo ""
echo "✅ Voice AI setup complete!"
echo "📝 Next steps:"
echo "   1. Edit config.py and add your Groq API key"
echo "   2. Run: python3 test_api_key.py"
