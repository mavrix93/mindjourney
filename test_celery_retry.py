#!/usr/bin/env python3
"""
Test script to verify Celery retry mechanism works correctly.
This script simulates server restarts and ensures all entries are processed.
"""

import os
import sys
import time
import django
from django.conf import settings

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindjourney.settings')
django.setup()

from entries.models import Entry
from insights.tasks import extract_insights_task, retry_unprocessed_entries, check_entry_processing_status
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_test_entries():
    """Create some test entries for processing"""
    from django.contrib.auth.models import User
    
    # Get or create a test user
    user, created = User.objects.get_or_create(
        username="test_user",
        defaults={"email": "test@example.com"}
    )
    
    # Create test entries
    test_entries = [
        {
            "title": "Test Entry 1",
            "content": "This is a test entry about my day at the park. I saw a beautiful sunset and felt very happy.",
            "user": user
        },
        {
            "title": "Test Entry 2", 
            "content": "Another test entry about visiting New York City. The weather was great and I enjoyed the food.",
            "user": user
        },
        {
            "title": "Test Entry 3",
            "content": "A third test entry about my work day. I had some challenges but overall it was productive.",
            "user": user
        }
    ]
    
    created_entries = []
    for entry_data in test_entries:
        entry = Entry.objects.create(**entry_data)
        created_entries.append(entry)
        logger.info(f"Created test entry: {entry.id} - {entry.title}")
    
    return created_entries


def check_processing_status():
    """Check the current processing status"""
    total = Entry.objects.count()
    processed = Entry.objects.filter(insights_processed=True).count()
    unprocessed = total - processed
    
    logger.info(f"Processing Status: {processed}/{total} processed ({unprocessed} unprocessed)")
    return total, processed, unprocessed


def simulate_server_restart():
    """Simulate a server restart by checking for unprocessed entries"""
    logger.info("Simulating server restart - checking for unprocessed entries...")
    
    # Check current status
    total, processed, unprocessed = check_processing_status()
    
    if unprocessed > 0:
        logger.info(f"Found {unprocessed} unprocessed entries, retrying...")
        try:
            # Queue retry task
            result = retry_unprocessed_entries.delay()
            logger.info(f"Queued retry task with ID: {result.id}")
            return result
        except Exception as e:
            logger.error(f"Failed to queue retry task: {e}")
            return None
    else:
        logger.info("All entries are processed!")
        return None


def wait_for_processing(timeout=60):
    """Wait for all entries to be processed"""
    logger.info(f"Waiting for processing to complete (timeout: {timeout}s)...")
    
    start_time = time.time()
    while time.time() - start_time < timeout:
        total, processed, unprocessed = check_processing_status()
        
        if unprocessed == 0:
            logger.info("All entries have been processed!")
            return True
            
        logger.info(f"Still processing... {processed}/{total} done")
        time.sleep(5)
    
    logger.warning(f"Timeout reached. Final status: {processed}/{total} processed")
    return False


def test_retry_mechanism():
    """Test the complete retry mechanism"""
    logger.info("Starting Celery retry mechanism test...")
    
    # Step 1: Create test entries
    logger.info("Step 1: Creating test entries...")
    entries = create_test_entries()
    
    # Step 2: Check initial status
    logger.info("Step 2: Checking initial processing status...")
    total, processed, unprocessed = check_processing_status()
    
    # Step 3: Queue processing tasks
    logger.info("Step 3: Queueing processing tasks...")
    task_results = []
    for entry in entries:
        try:
            result = extract_insights_task.delay(entry.id)
            task_results.append(result)
            logger.info(f"Queued task for entry {entry.id}: {result.id}")
        except Exception as e:
            logger.error(f"Failed to queue task for entry {entry.id}: {e}")
    
    # Step 4: Wait for initial processing
    logger.info("Step 4: Waiting for initial processing...")
    wait_for_processing(timeout=30)
    
    # Step 5: Simulate server restart
    logger.info("Step 5: Simulating server restart...")
    retry_result = simulate_server_restart()
    
    # Step 6: Wait for retry processing
    if retry_result:
        logger.info("Step 6: Waiting for retry processing...")
        wait_for_processing(timeout=30)
    
    # Step 7: Final status check
    logger.info("Step 7: Final status check...")
    total, processed, unprocessed = check_processing_status()
    
    if unprocessed == 0:
        logger.info("✅ SUCCESS: All entries have been processed!")
        return True
    else:
        logger.error(f"❌ FAILURE: {unprocessed} entries still unprocessed")
        return False


def cleanup_test_data():
    """Clean up test data"""
    logger.info("Cleaning up test data...")
    try:
        # Delete test entries
        Entry.objects.filter(user__username="test_user").delete()
        logger.info("Test data cleaned up")
    except Exception as e:
        logger.error(f"Error cleaning up test data: {e}")


if __name__ == "__main__":
    try:
        success = test_retry_mechanism()
        if success:
            print("\n🎉 Test completed successfully!")
        else:
            print("\n❌ Test failed!")
            sys.exit(1)
    finally:
        cleanup_test_data()
