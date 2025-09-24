from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class InsightsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "insights"
    
    def ready(self):
        """Run startup checks when the app is ready"""
        try:
            # Only run in production or when explicitly requested
            import os
            if os.environ.get('RUN_STARTUP_CHECK', 'false').lower() == 'true':
                from django.core.management import call_command
                call_command('startup_check')
        except Exception as e:
            logger.error(f"Error during insights app startup: {e}")
