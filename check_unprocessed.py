#!/usr/bin/env python3
"""
Simple script to check for unprocessed entries and retry them.
Run this after server restarts to ensure all entries are processed.
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindjourney.settings')
django.setup()

from entries.models import Entry
from insights.tasks import retry_unprocessed_entries
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    """Check for unprocessed entries and retry them"""
    try:
        # Count unprocessed entries
        unprocessed_count = Entry.objects.filter(insights_processed=False).count()
        total_count = Entry.objects.count()
        
        print(f"Total entries: {total_count}")
        print(f"Unprocessed entries: {unprocessed_count}")
        
        if unprocessed_count > 0:
            print(f"Found {unprocessed_count} unprocessed entries. Retrying...")
            
            # Queue retry task
            result = retry_unprocessed_entries.delay()
            print(f"Queued retry task with ID: {result.id}")
            print("Check Celery worker logs for processing status.")
        else:
            print("✅ All entries have been processed!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
