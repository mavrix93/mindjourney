#!/bin/bash

# MindJourney Development Setup Script

echo "🛠️  Setting up MindJourney for development..."

# Create virtual environment for backend
echo "📦 Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Set up environment variables
echo "⚙️  Setting up environment variables..."
if [ ! -f .env ]; then
    cp ../env.example .env
    echo "📝 Created .env file. Please add your Gemini API key."
fi

# Install Node.js dependencies for frontend
echo "📦 Setting up Node.js dependencies..."
cd ../frontend
npm install

echo "✅ Development setup complete!"
echo ""
echo "To start development:"
echo "1. Backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo "2. Frontend: cd frontend && npm start"
echo "3. Celery: cd backend && source venv/bin/activate && celery -A mindjourney worker --loglevel=info"
echo ""
echo "Don't forget to:"
echo "- Add your Gemini API key to backend/.env"
echo "- Set up PostgreSQL database"
echo "- Run migrations: python manage.py migrate"
