# MindJourney - AI-Powered Diary with Insights

A beautiful, modern diary application that uses AI to extract insights from your entries, categorize experiences, and analyze sentiment. Built with Django and React, featuring a stunning dark star theme with particle effects.

## Features

### 🎨 Beautiful UI
- Dark star theme with animated particle background
- Neon elements and smooth animations
- Mobile-first responsive design
- Stunning timeline and map views

### 🤖 AI-Powered Insights
- Automatic extraction of places, products, movies, meals, and more
- Sentiment analysis for each insight
- Dynamic category creation
- Confidence scoring for AI predictions

### 📱 Core Functionality
- Create, edit, and delete diary entries
- Document upload support
- Public/private entry settings
- Search and filter capabilities
- Timeline view with selectable entries
- Interactive map with sentiment-based colors

### 🗺️ Map Integration
- Visual representation of places mentioned in entries
- Color-coded markers based on sentiment
- Interactive popups with insight details
- Filter by category type

## Tech Stack

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database
- **Redis** - Caching and message broker
- **Celery** - Background task processing
- **Google Gemini** - AI insights extraction
- **Pydantic** - Data validation
- **Returns** - Functional error handling

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Animations
- **React Query** - Data fetching and caching
- **React Leaflet** - Map integration
- **React Hook Form** - Form handling
- **React Dropzone** - File uploads

## Quick Start

### Prerequisites
- Docker and Docker Compose (recommended)
- OR Python 3.11+ and Node.js 18+ (for local development)
- Gemini API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mindjourney
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env and add your Gemini API key
   ```

3. **Start the application (Docker - Recommended)**
   ```bash
   ./start.sh
   ```

4. **OR Install dependencies and start manually**
   ```bash
   # Install dependencies
   ./install-deps.sh
   
   # Start backend (in one terminal)
   cd backend
   python manage.py migrate
   python manage.py runserver
   
   # Start frontend (in another terminal)
   cd frontend
   npm start
   
   # Start Celery worker (in a third terminal)
   cd backend
   celery -A mindjourney worker --loglevel=info
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

### Development Setup

#### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
export SECRET_KEY="your-secret-key"
export GEMINI_API_KEY="your-gemini-api-key"
export DB_HOST="localhost"
export DB_NAME="mindjourney"
export DB_USER="postgres"
export DB_PASSWORD="postgres"

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver

# Start Celery worker (in another terminal)
celery -A mindjourney worker --loglevel=info
```

#### Frontend Development
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Entries
- `GET /api/entries/` - List user entries
- `POST /api/entries/` - Create new entry
- `GET /api/entries/{id}/` - Get entry details
- `PATCH /api/entries/{id}/` - Update entry
- `DELETE /api/entries/{id}/` - Delete entry
- `GET /api/entries/public/` - Get public entries
- `GET /api/entries/search/` - Search entries
- `POST /api/entries/{id}/upload_document/` - Upload document

### Insights
- `GET /api/insights/` - List user insights
- `GET /api/insights/{id}/` - Get insight details
- `PATCH /api/insights/{id}/` - Update insight
- `GET /api/insights/by_category/` - Get insights by category
- `GET /api/insights/sentiment_summary/` - Get sentiment summary
- `GET /api/insights/search/` - Search insights

### Categories
- `GET /api/categories/` - List categories
- `POST /api/categories/` - Create category
- `GET /api/categories/{id}/` - Get category details
- `PATCH /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category
- `GET /api/categories/by_type/` - Get categories by type

## AI Insights Extraction

The application uses Google's Gemini to automatically extract insights from diary entries. The AI identifies:

- **Places** - Cities, countries, landmarks, venues
- **Products** - Items, brands, purchases
- **Movies** - Films, TV shows, entertainment
- **Meals** - Food, restaurants, dining experiences
- **People** - Individuals mentioned
- **Activities** - Events, hobbies, experiences
- **Emotions** - Feelings and emotional states

Each insight includes:
- Text snippet from the original entry
- Category name and type
- Sentiment score (-1.0 to 1.0)
- Confidence score (0.0 to 1.0)
- Position in the original text

## Project Structure

```
mindjourney/
├── backend/
│   ├── mindjourney/          # Django project settings
│   ├── entries/              # Entry management app
│   ├── insights/             # AI insights app
│   ├── categories/           # Category management app
│   └── manage.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.js
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Troubleshooting

### Common Issues

1. **Django Import Errors**
   - Make sure all dependencies are installed: `./install-deps.sh`
   - Or use Docker: `./start.sh`

2. **Database Connection Issues**
   - For Docker: Make sure PostgreSQL container is running
   - For local development: Install PostgreSQL and create database

3. **Gemini API Errors**
   - Ensure your API key is set in `.env` file
   - Check that you have sufficient API credits

4. **Frontend Build Issues**
   - Clear node_modules: `rm -rf frontend/node_modules && npm install`
   - Check Node.js version (requires 18+)

5. **Celery Worker Issues**
   - Make sure Redis is running
   - Check Celery logs for specific errors

### Testing Setup
```bash
# Test if everything is configured correctly
./test-setup.sh
```

### Test the AI Client (CLI)
```bash
# Inline text
GEMINI_API_KEY=your-key python test_ai.py --text "Walked around London and tried gelato."

# From file
export GEMINI_API_KEY=your-key
python test_ai.py --file sample.txt --pretty
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google for providing the Gemini API
- The React and Django communities for excellent documentation
- All the open-source libraries that made this project possible
