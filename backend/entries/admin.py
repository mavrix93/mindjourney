from django.contrib import admin
from .models import Entry, EntryDocument


class EntryDocumentInline(admin.TabularInline):
    model = EntryDocument
    extra = 0


@admin.register(Entry)
class EntryAdmin(admin.ModelAdmin):
    list_display = ["user", "title", "is_public", "overall_sentiment", "created_at"]
    list_filter = ["is_public", "created_at", "user"]
    search_fields = ["title", "content", "user__username"]
    ordering = ["-created_at"]
    inlines = [EntryDocumentInline]


@admin.register(EntryDocument)
class EntryDocumentAdmin(admin.ModelAdmin):
    list_display = ["entry", "filename", "file_size", "uploaded_at"]
    list_filter = ["uploaded_at"]
    search_fields = ["filename", "entry__title"]
