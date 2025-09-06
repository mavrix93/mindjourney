#!/bin/bash

# MindJourney Dependencies Installation Script

echo "🔧 Installing MindJourney dependencies..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd ../frontend
npm install

echo "✅ Dependencies installed successfully!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && python manage.py runserver"
echo "2. Frontend: cd frontend && npm start"
echo "3. Celery: cd backend && celery -A mindjourney worker --loglevel=info"
echo ""
echo "Or use Docker: ./start.sh"
