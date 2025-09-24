import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mindjourney.settings")

app = Celery("mindjourney")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")


# Signal to check for unprocessed entries when worker starts
@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    """Set up periodic tasks when Celery worker starts"""
    try:
        # Use the task name string instead of importing
        # Check for unprocessed entries every 5 minutes
        sender.add_periodic_task(
            300.0,  # 5 minutes
            'insights.tasks.check_entry_processing_status',
            name='check-unprocessed-entries'
        )
    except Exception as e:
        # Log the import error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Could not set up periodic tasks: {e}")
        # Skip if insights app not available
        pass
