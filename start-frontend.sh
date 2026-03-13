#!/bin/bash

# VoiceAid Frontend Startup Script

echo "📱 Starting VoiceAid Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start Expo
echo "✅ Starting Expo development server..."
npx expo start
