#!/bin/bash

# MindJourney Startup Script

echo "🚀 Starting MindJourney..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file and add your GEMINI API key"
    echo "   Then run this script again."
    exit 1
fi

# Check if Gemini API key is set
if ! grep -q "GEMINI_API_KEY=" .env; then
    echo "⚠️  Gemini API key not found in .env file"
    echo "   Please add your Gemini API key to the .env file"
    exit 1
fi

echo "✅ Environment configuration looks good"

# Start the application
echo "🐳 Starting Docker containers..."
docker-compose up --build

echo "🎉 MindJourney is now running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Admin:    http://localhost:8000/admin"
