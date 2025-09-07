from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Entry, EntryDocument
from insights.serializers import InsightSerializer


class EntryDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntryDocument
        fields = ["id", "file", "filename", "file_size", "uploaded_at"]
        read_only_fields = ["id", "filename", "file_size", "uploaded_at"]


class EntrySerializer(serializers.ModelSerializer):
    documents = EntryDocumentSerializer(many=True, read_only=True)
    insights = InsightSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Entry
        fields = [
            "id",
            "user",
            "title",
            "content",
            "is_public",
            "overall_sentiment",
            "insights_processed",
            "latitude",
            "longitude",
            "location_name",
            "created_at",
            "updated_at",
            "documents",
            "insights",
        ]
        read_only_fields = [
            "id",
            "user",
            "created_at",
            "updated_at",
            "overall_sentiment",
            "insights_processed",
            "latitude",
            "longitude",
            "location_name",
        ]


class EntryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = ["id", "title", "content", "is_public"]
        read_only_fields = ["id"]


class PublicEntrySerializer(serializers.ModelSerializer):
    """Serializer for public entries (without sensitive user info)"""

    user = serializers.StringRelatedField(read_only=True)
    insights = InsightSerializer(many=True, read_only=True)

    class Meta:
        model = Entry
        fields = [
            "id",
            "user",
            "title",
            "content",
            "overall_sentiment",
            "created_at",
            "insights",
        ]
        read_only_fields = ["id", "user", "created_at", "overall_sentiment"]
