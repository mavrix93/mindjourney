from rest_framework import serializers
from .models import Insight
from categories.serializers import CategorySerializer


class InsightSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Insight
        fields = [
            "id",
            "category",
            "category_id",
            "text_snippet",
            "sentiment_score",
            "confidence_score",
            "start_position",
            "end_position",
            "is_manual_edit",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
