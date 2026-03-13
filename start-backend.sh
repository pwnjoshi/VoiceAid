#!/bin/bash

# VoiceAid Backend Startup Script

echo "🚀 Starting VoiceAid Backend..."

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found!"
    echo "📝 Creating from .env.example..."
    cp backend/.env.example backend/.env
    echo "✏️  Please edit backend/.env with your credentials before continuing."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Start the backend
echo "✅ Starting backend server..."
cd backend
npm start
