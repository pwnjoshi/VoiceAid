@echo off
REM VoiceAid Backend Startup Script for Windows

echo 🚀 Starting VoiceAid Backend...

REM Check if .env exists
if not exist "backend\.env" (
    echo ⚠️  Warning: backend\.env not found!
    if exist "backend\.env.example" (
        echo 📝 Creating from .env.example...
        copy backend\.env.example backend\.env
    )
    echo ✏️  Please edit backend\.env with your credentials before continuing.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Start the backend
echo ✅ Starting backend server...
cd backend
call npm start
