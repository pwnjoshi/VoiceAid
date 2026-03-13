#!/bin/bash

# Setup AWS Amplify for VoiceAid
# This script initializes Amplify with DataStore

echo "🚀 Setting up AWS Amplify..."

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "❌ Amplify CLI not found. Installing..."
    npm install -g @aws-amplify/cli
fi

echo "✅ Amplify CLI found"

# Initialize Amplify project
echo "📦 Initializing Amplify project..."
amplify init --yes

# Add API with GraphQL
echo "📡 Adding GraphQL API..."
amplify add api

# Add Auth
echo "🔐 Adding Authentication..."
amplify add auth

# Add Storage
echo "💾 Adding Storage..."
amplify add storage

# Push to cloud
echo "☁️  Deploying to AWS..."
amplify push --yes

echo ""
echo "✅ Amplify setup complete!"
echo "📝 Configuration has been added to src/aws-exports.js"
echo ""
echo "Next steps:"
echo "1. Import Amplify configuration in your app"
echo "2. Configure DataStore models"
echo "3. Test offline sync"
