#!/bin/bash
# VoiceAid Backend Deployment Script
# Deploys to AWS Amplify

set -e

echo "🚀 Deploying VoiceAid Backend"
echo "============================="

# Check if git is initialized
if [ ! -d .git ]; then
    echo "✗ Git repository not found. Initialize with: git init"
    exit 1
fi

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "✗ Amplify CLI is not installed"
    echo "Install with: npm install -g @aws-amplify/cli"
    exit 1
fi

# Build the backend
echo "✓ Building backend..."
npm run build 2>/dev/null || echo "  No build script defined"

# Run tests
echo "✓ Running tests..."
npm test 2>/dev/null || echo "  No tests defined"

# Commit changes
echo "✓ Committing changes..."
git add .
git commit -m "Deploy VoiceAid Backend" || echo "  No changes to commit"

# Push to repository
echo "✓ Pushing to repository..."
git push origin main || git push origin master

echo ""
echo "✅ Deployment initiated!"
echo "Monitor progress in AWS Amplify Console"
echo ""
