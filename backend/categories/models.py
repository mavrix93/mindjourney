from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    """Dynamic categories for insights (places, products, movies, meals, etc.)"""

    CATEGORY_TYPES = [
        ("place", "Place"),
        ("product", "Product"),
        ("movie", "Movie"),
        ("meal", "Meal"),
        ("person", "Person"),
        ("activity", "Activity"),
        ("emotion", "Emotion"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=100, unique=True)
    category_type = models.CharField(
        max_length=20, choices=CATEGORY_TYPES, default="other"
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_category_type_display()})"
