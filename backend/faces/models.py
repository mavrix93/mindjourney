from django.db import models
from django.contrib.auth.models import User


class Face(models.Model):
    """Represents a persona/role/group that users can subscribe to.

    Examples: "father", "software developer", "male", "citizen of UK", "gardener".
    """

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    # Can store an emoji, short icon name, or URL to an image
    icon = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class UserFaceSubscription(models.Model):
    """Subscription of a user to a face."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="face_subscriptions")
    face = models.ForeignKey(Face, on_delete=models.CASCADE, related_name="subscriptions")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "face")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.username} -> {self.face.name}"

