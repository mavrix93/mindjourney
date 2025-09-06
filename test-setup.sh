#!/bin/bash

# MindJourney Setup Test Script

echo "🧪 Testing MindJourney setup..."

# Test Django backend
echo "🔍 Testing Django backend..."
cd backend

# Check if dependencies are installed
if python -c "import django, rest_framework, celery" 2>/dev/null; then
    echo "✅ Python dependencies are installed"
    
    # Test Django configuration
    if python manage.py check --deploy 2>/dev/null; then
        echo "✅ Django configuration is valid"
    else
        echo "⚠️  Django configuration has issues (this is normal without database setup)"
    fi
else
    echo "❌ Python dependencies not installed. Run ./install-deps.sh first"
fi

# Test React frontend
echo "🔍 Testing React frontend..."
cd ../frontend

if [ -d "node_modules" ]; then
    echo "✅ Node.js dependencies are installed"
    
    # Test if React can build
    if npm run build 2>/dev/null; then
        echo "✅ React frontend builds successfully"
    else
        echo "⚠️  React frontend build failed"
    fi
else
    echo "❌ Node.js dependencies not installed. Run ./install-deps.sh first"
fi

echo ""
echo "🎉 Setup test complete!"
echo ""
echo "To start the full application:"
echo "1. Install dependencies: ./install-deps.sh"
echo "2. Start with Docker: ./start.sh"
echo "3. Or start manually:"
echo "   - Backend: cd backend && python manage.py runserver"
echo "   - Frontend: cd frontend && npm start"
