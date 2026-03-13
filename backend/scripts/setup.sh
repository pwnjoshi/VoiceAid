#!/bin/bash
# VoiceAid Backend Setup Script
# Automates initial setup and configuration

set -e

echo "🚀 VoiceAid Backend Setup"
echo "========================"

# Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi
echo "  Node.js version: $(node --version)"

# Check npm
echo "✓ Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "✗ npm is not installed"
    exit 1
fi
echo "  npm version: $(npm --version)"

# Install dependencies
echo "✓ Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "✓ Creating .env file..."
    cp .env.example .env
    echo "  ⚠️  Please update .env with your AWS credentials"
else
    echo "✓ .env file already exists"
fi

# Create necessary directories
echo "✓ Creating directories..."
mkdir -p logs
mkdir -p tmp

# Check AWS CLI
echo "✓ Checking AWS CLI..."
if ! command -v aws &> /dev/null; then
    echo "  ⚠️  AWS CLI is not installed. Install it to manage S3 and Bedrock"
    echo "  See: https://aws.amazon.com/cli/"
else
    echo "  AWS CLI version: $(aws --version)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your AWS credentials"
echo "2. Create S3 bucket: aws s3 mb s3://voiceaid-knowledge-docs"
echo "3. Setup Bedrock Knowledge Base in AWS Console"
echo "4. Run: npm run dev"
echo ""
