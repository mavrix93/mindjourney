try:
    from celery import shared_task
except ImportError:
    # Celery not available, create a mock decorator
    def shared_task(func):
        return func


from django.db import transaction
from returns.result import Result, Success, Failure
from .models import Insight
from .ai_service import AIInsightExtractor, InsightData
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

            match insights_result:
                case Success(insights_data):
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

                    # Update overall sentiment
                    overall_sentiment = extractor.calculate_overall_sentiment(
                        insights_data
                    )
                    entry.overall_sentiment = overall_sentiment
                    entry.save()

                    return True

                case Failure(error):
                    # Log the error but don't return Failure object
                    print(f"Failed to extract insights for entry {entry_id}: {error}")
                    return False

                case _else:
                    print(f"Unexpected value in extract_insights_task: {_else}")
                    return False

    except Entry.DoesNotExist:
        print(f"Entry with id {entry_id} not found")
        return False
    except Exception as e:
        print(f"Error processing entry {entry_id}: {str(e)}")
        return False
