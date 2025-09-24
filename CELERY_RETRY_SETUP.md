# Celery Retry Mechanism Setup

This document describes the implementation of persistent retry mechanisms for Celery tasks to ensure all entries are processed even after server restarts.

## Changes Made

### 1. Enhanced Celery Configuration (`backend/mindjourney/settings.py`)

- Added comprehensive Celery retry settings:
  - `CELERY_TASK_DEFAULT_RETRY_DELAY = 60` (1 minute)
  - `CELERY_TASK_MAX_RETRIES = 5`
  - `CELERY_TASK_RETRY_JITTER = True` (randomness to retry delays)
  - `CELERY_RESULT_EXPIRES = 3600` (results persist for 1 hour)
  - Added `django-celery-beat` for periodic tasks

### 2. Enhanced Task Retry Logic (`backend/insights/tasks.py`)

- Updated `extract_insights_task` with:
  - `@shared_task(bind=True, autoretry_for=(Exception,), retry_kwargs={'max_retries': 5, 'countdown': 60})`
  - Proper logging for retry attempts
  - Exception re-raising to trigger retries
  - Better error handling

- Added new tasks:
  - `retry_unprocessed_entries()`: Finds and retries unprocessed entries
  - `check_entry_processing_status()`: Monitors processing status and auto-retries

### 3. Periodic Task Setup (`backend/mindjourney/celery.py`)

- Added `@app.on_after_configure.connect` signal to set up periodic tasks
- Automatic check for unprocessed entries every 5 minutes
- Graceful handling when insights app is not available

### 4. Management Commands

Created three management commands in `backend/insights/management/commands/`:

#### `retry_unprocessed_entries.py`
- Sets up periodic tasks for checking unprocessed entries
- Can run retry tasks immediately
- Usage: `python manage.py retry_unprocessed_entries --setup-periodic --run-now`

#### `check_processing_status.py`
- Checks current processing status
- Can automatically retry unprocessed entries
- Usage: `python manage.py check_processing_status --retry-unprocessed`

#### `startup_check.py`
- Runs on app startup to check for unprocessed entries
- Automatically queues unprocessed entries for retry

### 5. App Configuration (`backend/insights/apps.py`)

- Added startup check in `ready()` method
- Controlled by `RUN_STARTUP_CHECK` environment variable
- Graceful error handling

### 6. Requirements Update (`backend/requirements.txt`)

- Added `django-celery-beat==2.5.0` for periodic task management

### 7. Test Scripts

#### `test_celery_retry.py`
- Comprehensive test script to verify retry mechanism
- Simulates server restarts
- Creates test entries and verifies processing

#### `check_unprocessed.py`
- Simple script to check and retry unprocessed entries
- Can be run after server restarts

## Usage Instructions

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Run Database Migrations
```bash
cd backend
python manage.py migrate
```

### 3. Set Up Periodic Tasks
```bash
python manage.py retry_unprocessed_entries --setup-periodic
```

### 4. Start Celery Worker
```bash
celery -A mindjourney worker --loglevel=info
```

### 5. Start Celery Beat (for periodic tasks)
```bash
celery -A mindjourney beat --loglevel=info
```

### 6. Check Processing Status
```bash
python manage.py check_processing_status
```

### 7. Manual Retry (if needed)
```bash
python manage.py retry_unprocessed_entries --run-now
```

### 8. Run Test Script
```bash
python test_celery_retry.py
```

## Key Features

1. **Automatic Retry**: Tasks automatically retry on failure with exponential backoff
2. **Persistent Results**: Task results are stored in Redis for 1 hour
3. **Periodic Monitoring**: Automatic check every 5 minutes for unprocessed entries
4. **Startup Recovery**: Checks for unprocessed entries when server starts
5. **Comprehensive Logging**: Detailed logging for debugging and monitoring
6. **Graceful Degradation**: Works even when Celery is not available (for testing)

## Environment Variables

- `RUN_STARTUP_CHECK=true`: Enable startup check for unprocessed entries
- `REDIS_URL`: Redis connection URL for Celery broker and results

## Monitoring

- Check Celery worker logs for task execution
- Use `python manage.py check_processing_status` to monitor progress
- Periodic tasks are logged in Celery beat logs

## Troubleshooting

1. **Tasks not retrying**: Check Celery worker logs for errors
2. **Periodic tasks not running**: Ensure Celery beat is running
3. **Database connection issues**: Check database configuration
4. **Redis connection issues**: Verify Redis is running and accessible

## Testing

The retry mechanism can be tested by:
1. Creating entries
2. Stopping the Celery worker
3. Restarting the worker
4. Verifying all entries are processed

Use the provided test scripts for comprehensive testing.
