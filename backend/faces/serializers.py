from rest_framework import serializers
from .models import Face, UserFaceSubscription


class FaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Face
        fields = [
            "id",
            "name",
            "description",
            "icon",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class UserFaceSubscriptionSerializer(serializers.ModelSerializer):
    face = FaceSerializer(read_only=True)
    face_id = serializers.PrimaryKeyRelatedField(
        source="face", queryset=Face.objects.all(), write_only=True
    )

    class Meta:
        model = UserFaceSubscription
        fields = ["id", "face", "face_id", "created_at"]
        read_only_fields = ["id", "created_at", "face"]

