from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Entry(models.Model):
    """User diary entries"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="entries")
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Overall sentiment for the entry
    overall_sentiment = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(-1.0), MaxValueValidator(1.0)],
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
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.entry} - {self.filename}"
