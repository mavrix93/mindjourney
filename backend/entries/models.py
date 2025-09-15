from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings


class Entry(models.Model):
    """User diary entries"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="entries")
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Faces (personas/groups) linked to this entry
    # Import is local in type hint to avoid import cycle during app loading
    faces = models.ManyToManyField("faces.Face", related_name="entries", blank=True)

    # Overall sentiment for the entry
    overall_sentiment = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(-1.0), MaxValueValidator(1.0)],
    )

    # Processing status for AI insights
    insights_processed = models.BooleanField(default=False)

    # Geo-location fields for places mentioned in the entry
    latitude = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)],
        help_text="Latitude coordinate for the main place mentioned in this entry",
    )
    longitude = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)],
        help_text="Longitude coordinate for the main place mentioned in this entry",
    )
    location_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Name of the main place mentioned in this entry",
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Entries"

    def __str__(self):
        return f"{self.user.username} - {self.title or self.content[:50]}..."


class EntryDocument(models.Model):
    """Documents attached to entries"""

    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="entry_documents/")
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=100, blank=True)
    extracted_text = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.entry} - {self.filename}"
