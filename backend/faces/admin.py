from django.contrib import admin
from .models import Face, UserFaceSubscription


@admin.register(Face)
class FaceAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "icon", "created_at")
    search_fields = ("name",)


@admin.register(UserFaceSubscription)
class UserFaceSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "face", "created_at")
    list_filter = ("face",)
    search_fields = ("user__username", "face__name")

