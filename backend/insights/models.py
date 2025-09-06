from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from entries.models import Entry
from categories.models import Category


class Insight(models.Model):
    """AI-extracted insights from diary entries"""

    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="insights")
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="insights"
    )

    # The specific text that was categorized
    text_snippet = models.TextField()

    # Sentiment score (-1.0 to 1.0)
    sentiment_score = models.FloatField(
        validators=[MinValueValidator(-1.0), MaxValueValidator(1.0)]
    )

    # Confidence score (0.0 to 1.0)
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )

    # Position in the original text
    start_position = models.PositiveIntegerField()
    end_position = models.PositiveIntegerField()

    # Whether this insight was manually edited by the user
    is_manual_edit = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_position"]
        unique_together = ["entry", "category", "start_position", "end_position"]

    def __str__(self):
        return f"{self.entry} - {self.category.name}: {self.text_snippet[:50]}..."
