@echo off
REM VoiceAid Voice AI Setup Script for Windows

echo 🎤 Setting up VoiceAid Voice AI...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    exit /b 1
)

echo ✅ Python found
python --version

REM Check if config.py exists
if not exist "config.py" (
    echo 📝 Creating config.py from example...
    copy config.example.py config.py
    echo ✏️  Please edit config.py and add your Groq API key.
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Test setup
echo 🧪 Testing Voice AI setup...
python test_setup.py

echo.
echo ✅ Voice AI setup complete!
echo 📝 Next steps:
echo    1. Edit config.py and add your Groq API key
echo    2. Run: python test_api_key.py
pause
