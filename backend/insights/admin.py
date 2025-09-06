from django.contrib import admin
from .models import Insight


@admin.register(Insight)
class InsightAdmin(admin.ModelAdmin):
    list_display = [
        "entry",
        "category",
        "text_snippet",
        "sentiment_score",
        "confidence_score",
        "is_manual_edit",
    ]
    list_filter = ["category", "is_manual_edit", "created_at"]
    search_fields = ["text_snippet", "entry__title", "entry__content"]
    ordering = ["-created_at"]
