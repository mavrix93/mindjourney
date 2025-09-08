try:
    from celery import shared_task
except ImportError:
    # Celery not available, create a mock decorator
    def shared_task(func):
        return func


from django.db import transaction
from common.result import Result, Success, Failure
from .models import Insight
from .ai_service import AIInsightExtractor, InsightData
from .geocoding_service import AIGeocodingService
from entries.models import Entry
from categories.models import Category


@shared_task
def extract_insights_task(entry_id: int) -> bool:
    """Celery task to extract insights from a diary entry"""
    try:
        with transaction.atomic():
            entry = Entry.objects.get(id=entry_id)

            # Clear existing insights
            Insight.objects.filter(entry=entry).delete()

            # Extract new insights
            extractor = AIInsightExtractor()
            insights_result = extractor.extract_insights(entry.content)

            if insights_result.is_successful():
                insights_data = insights_result.value
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
                geocoding_result = geocoding_service.extract_and_geocode_places(
                    entry.content
                )

                if geocoding_result.is_successful():
                    geocoded_places = geocoding_result.value
                    if geocoded_places:
                        # Use the first (most confident) place as the main location
                        main_place = geocoded_places[0]
                        entry.latitude = main_place["latitude"]
                        entry.longitude = main_place["longitude"]
                        entry.location_name = main_place["full_name"]
                        print(
                            f"Geocoded entry {entry_id} to {main_place['full_name']} at {main_place['latitude']}, {main_place['longitude']}"
                        )
                    else:
                        print(f"No places found to geocode for entry {entry_id}")
                else:
                    print(
                        f"Geocoding failed for entry {entry_id}: {geocoding_result.failure()}"
                    )

                entry.save()
                return True
            else:
                error = insights_result.failure()
                # Log the error but don't return Failure object
                print(f"Failed to extract insights for entry {entry_id}: {error}")
                return False

    except Entry.DoesNotExist:
        print(f"Entry with id {entry_id} not found")
        return False
    except Exception as e:
        print(f"Error processing entry {entry_id}: {str(e)}")
        return False
