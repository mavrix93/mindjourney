# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.
# Use lazy import to avoid Django app registry issues
import os

# Only import celery if we're not in a Django management command
if 'DJANGO_SETTINGS_MODULE' in os.environ:
    try:
        from .celery import app as celery_app
        __all__ = ("celery_app",)
    except ImportError:
        # Celery not installed, skip
        pass
