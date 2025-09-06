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
def extract_insights_task(entry_id: int) -> Result[bool, str]:
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

                    return Success(True)

                case Failure(error):
                    return Failure(f"Failed to extract insights: {error}")

                case _else:
                    raise RuntimeError(f"Unexpected value: {_else}")

    except Entry.DoesNotExist:
        return Failure(f"Entry with id {entry_id} not found")
    except Exception as e:
        return Failure(f"Error processing entry {entry_id}: {str(e)}")
