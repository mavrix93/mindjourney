try:
    from celery import shared_task
    from celery.exceptions import Retry
except ImportError:
    # Celery not available, create a mock decorator
    def shared_task(func):
        return func
    class Retry(Exception):
        pass


from django.db import transaction
from .models import Insight
from .ai_service import AIInsightExtractor, InsightData
from .geocoding_service import AIGeocodingService
from entries.models import Entry
from categories.models import Category
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, autoretry_for=(Exception,), retry_kwargs={'max_retries': 5, 'countdown': 60})
def extract_insights_task(self, entry_id: int) -> bool:
    """Celery task to extract insights from a diary entry with retry logic"""
    logger.info(f"Starting insight extraction for entry {entry_id} (attempt {self.request.retries + 1})")
    
    try:
        with transaction.atomic():
            entry = Entry.objects.get(id=entry_id)

            # Clear existing insights
            Insight.objects.filter(entry=entry).delete()

            # Build full content including any attached documents' extracted text
            documents_text = "\n\n".join(
                [doc.extracted_text for doc in entry.documents.all() if doc.extracted_text]
            )
            combined_content = entry.content
            if documents_text:
                combined_content = f"{entry.content}\n\n[Attached Documents]\n{documents_text}"

            # Extract new insights
            extractor = AIInsightExtractor()
            insights_data = extractor.extract_insights(combined_content)
            
            # Create categories and insights
            created_insights = []
            for insight_data in insights_data:
                category, created = Category.objects.get_or_create(
                    name=insight_data.category_name,
                    defaults={"category_type": insight_data.category_type},
                )

                insight = Insight.objects.create(
                    entry=entry,
                    category=category,
                    text_snippet=insight_data.text_snippet,
                    sentiment_score=insight_data.sentiment_score,
                    confidence_score=insight_data.confidence_score,
                    start_position=insight_data.start_position,
                    end_position=insight_data.end_position,
                )
                created_insights.append(insight)

            # Update overall sentiment and mark as processed
            overall_sentiment = extractor.calculate_overall_sentiment(
                insights_data
            )
            entry.overall_sentiment = overall_sentiment
            entry.insights_processed = True

            # Try to geocode places mentioned in the entry
            geocoding_service = AIGeocodingService()
            geocoded_places = geocoding_service.extract_and_geocode_places(combined_content)

            if geocoded_places:
                # Use the first (most confident) place as the main location
                main_place = geocoded_places[0]
                entry.latitude = main_place["latitude"]
                entry.longitude = main_place["longitude"]
                entry.location_name = main_place["full_name"]
                logger.info(
                    f"Geocoded entry {entry_id} to {main_place['full_name']} at {main_place['latitude']}, {main_place['longitude']}"
                )
            else:
                logger.info(f"No places found to geocode for entry {entry_id}")

            entry.save()
            logger.info(f"Successfully processed entry {entry_id}")
            return True

    except Entry.DoesNotExist:
        logger.error(f"Entry with id {entry_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error processing entry {entry_id}: {str(e)}")
        # Re-raise the exception to trigger retry
        raise


@shared_task(bind=True)
def retry_unprocessed_entries(self):
    """Find and retry processing for entries that haven't been processed yet"""
    logger.info("Checking for unprocessed entries...")
    
    try:
        # Find entries that haven't been processed yet
        unprocessed_entries = Entry.objects.filter(insights_processed=False)
        
        if not unprocessed_entries.exists():
            logger.info("No unprocessed entries found")
            return {"processed": 0, "total": 0}
        
        logger.info(f"Found {unprocessed_entries.count()} unprocessed entries")
        
        retry_count = 0
        for entry in unprocessed_entries:
            try:
                # Retry the insight extraction task
                extract_insights_task.delay(entry.id)
                retry_count += 1
                logger.info(f"Queued retry for entry {entry.id}")
            except Exception as e:
                logger.error(f"Failed to queue retry for entry {entry.id}: {str(e)}")
        
        logger.info(f"Queued {retry_count} entries for retry")
        return {"processed": retry_count, "total": unprocessed_entries.count()}
        
    except Exception as e:
        logger.error(f"Error in retry_unprocessed_entries: {str(e)}")
        raise


@shared_task(bind=True)
def check_entry_processing_status(self):
    """Check the status of entry processing and log statistics"""
    try:
        total_entries = Entry.objects.count()
        processed_entries = Entry.objects.filter(insights_processed=True).count()
        unprocessed_entries = total_entries - processed_entries
        
        logger.info(f"Entry processing status: {processed_entries}/{total_entries} processed ({unprocessed_entries} unprocessed)")
        
        if unprocessed_entries > 0:
            logger.warning(f"Found {unprocessed_entries} unprocessed entries")
            # Automatically retry unprocessed entries
            retry_unprocessed_entries.delay()
        
        return {
            "total": total_entries,
            "processed": processed_entries,
            "unprocessed": unprocessed_entries
        }
        
    except Exception as e:
        logger.error(f"Error checking entry processing status: {str(e)}")
        raise
