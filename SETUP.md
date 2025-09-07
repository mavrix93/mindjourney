# MindJourney Setup Guide

## Issues Fixed

✅ **Django Import Errors**: Made Celery imports conditional so Django can run without all dependencies installed
✅ **Leaflet Map Icons**: Fixed missing leaflet icon imports by using CDN URLs
✅ **Code Formatting**: Applied consistent double-quote formatting throughout the codebase
✅ **Docker Configuration**: Validated Docker Compose setup works correctly
✅ **Setup Scripts**: Created comprehensive setup and validation scripts

## Quick Start Options

### Option 1: Docker (Recommended)
```bash
# 1. Validate setup
./validate-docker.sh

# 2. Start the application
./start.sh
```

### Option 2: Local Development
```bash
# 1. Install dependencies
./install-deps.sh

# 2. Start backend
cd backend
python manage.py migrate
python manage.py runserver

# 3. Start frontend (new terminal)
cd frontend
npm start

# 4. Start Celery worker (new terminal)
cd backend
celery -A mindjourney worker --loglevel=info
```

### Option 3: Test Setup
```bash
# Test if everything is configured correctly
./test-setup.sh
```

## What's Working

- ✅ Django backend with REST API
- ✅ React frontend with dark star theme
- ✅ AI insights extraction (requires Gemini API key)
- ✅ Document upload functionality
- ✅ Timeline and map views
- ✅ Docker containerization
- ✅ Celery background tasks
- ✅ PostgreSQL database
- ✅ Redis caching

## Next Steps

1. **Set up Gemini API key** in `.env` file
2. **Choose your preferred setup method** (Docker recommended)
3. **Start the application** using the scripts provided
4. **Create your first diary entry** and watch AI extract insights!

## Troubleshooting

If you encounter any issues:

1. Run `./test-setup.sh` to diagnose problems
2. Check the troubleshooting section in README.md
3. Ensure all prerequisites are installed
4. Verify your Gemini API key is valid

The application is now ready to run! 🚀
