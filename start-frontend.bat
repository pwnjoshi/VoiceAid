@echo off
REM VoiceAid Frontend Startup Script for Windows

echo 📱 Starting VoiceAid Frontend...

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
)

REM Start Expo
echo ✅ Starting Expo development server...
call npx expo start
