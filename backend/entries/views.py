from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Entry, EntryDocument
from .document_service import extract_text_from_file, detect_content_type
from .serializers import (
    EntrySerializer,
    EntryCreateSerializer,
    PublicEntrySerializer,
    EntryDocumentSerializer,
)

try:
    from insights.tasks import extract_insights_task
except ImportError:
    # Celery not available, create a mock function
    def extract_insights_task(entry_id):
        pass


class EntryViewSet(viewsets.ModelViewSet):
    serializer_class = EntrySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """Return entries for the authenticated user, or all entries if no user"""
        if self.request.user.is_authenticated:
            return Entry.objects.filter(user=self.request.user)
        else:
            # For demo purposes, return all entries when not authenticated
            return Entry.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return EntryCreateSerializer
        return EntrySerializer

    def perform_create(self, serializer):
        """Create entry and trigger insight extraction"""
        # For demo purposes, create a default user if none exists
        from django.contrib.auth.models import User

        if not self.request.user.is_authenticated:
            user, created = User.objects.get_or_create(
                username="demo_user", defaults={"email": "demo@example.com"}
            )
        else:
            user = self.request.user

        # Generate title if not provided
        data = serializer.validated_data
        if not data.get("title"):
            try:
                from insights.ai_service import AIInsightExtractor

                extractor = AIInsightExtractor()
                title_result = extractor.generate_title(data["content"])
                if title_result:
                    data["title"] = title_result
            except Exception as e:
                print(f"Failed to generate title: {e}")
                # Use first few words as fallback
                words = data["content"].split()[:5]
                data["title"] = " ".join(words) + (
                    "..." if len(data["content"].split()) > 5 else ""
                )

        entry = serializer.save(user=user)
        # Trigger async insight extraction (robust to missing Celery during CI)
        try:
            task = extract_insights_task
            delay = getattr(task, "delay", None)
            if callable(delay):
                delay(entry.id)
            else:
                task(entry.id)
        except Exception as e:
            # Do not fail request if background processing isn't available
            print(f"Skipping insight extraction in CI/test: {e}")
        return entry

    def perform_update(self, serializer):
        """Update entry and re-extract insights if content changed"""
        old_entry = self.get_object()
        entry = serializer.save()

        # Re-extract insights if content changed
        if old_entry.content != entry.content:
            try:
                task = extract_insights_task
                delay = getattr(task, "delay", None)
                if callable(delay):
                    delay(entry.id)
                else:
                    task(entry.id)
            except Exception as e:
                print(f"Skipping re-extraction in CI/test: {e}")

    @action(detail=False, methods=["get"])
    def public(self, request):
        """Get public entries from all users"""
        queryset = Entry.objects.filter(is_public=True).order_by("-created_at")

        # Filter by category if provided
        category = request.query_params.get("category")
        if category:
            queryset = queryset.filter(
                insights__category__name__icontains=category
            ).distinct()

        # Filter by category IDs (comma-separated IDs). Match ANY (OR), not ALL.
        category_ids = request.query_params.get("category_ids")
        if category_ids:
            try:
                id_list = [int(cid) for cid in category_ids.split(",") if cid.strip()]
                if id_list:
                    queryset = queryset.filter(insights__category__id__in=id_list).distinct()
            except ValueError:
                pass

        # Filter by selected faces (comma-separated IDs). Match ANY (OR), not ALL.
        face_ids = request.query_params.get("face_ids")
        if face_ids:
            try:
                id_list = [int(fid) for fid in face_ids.split(",") if fid.strip()]
                if id_list:
                    queryset = queryset.filter(faces__id__in=id_list).distinct()
            except ValueError:
                pass

        # Filter by sentiment range
        min_sentiment = request.query_params.get("min_sentiment")
        max_sentiment = request.query_params.get("max_sentiment")
        if min_sentiment:
            queryset = queryset.filter(overall_sentiment__gte=float(min_sentiment))
        if max_sentiment:
            queryset = queryset.filter(overall_sentiment__lte=float(max_sentiment))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PublicEntrySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PublicEntrySerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def upload_document(self, request, pk=None):
        """Upload a document to an entry"""
        entry = self.get_object()
        file = request.FILES.get("file")

        if not file:
            return Response(
                {"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Extract text and detect type
        content_type = detect_content_type(file)
        extracted_text = extract_text_from_file(file)

        document = EntryDocument.objects.create(
            entry=entry,
            file=file,
            filename=file.name,
            file_size=file.size,
            content_type=content_type,
            extracted_text=extracted_text,
        )

        serializer = EntryDocumentSerializer(document)
        # Trigger re-analysis since documents changed
        try:
            task = extract_insights_task
            delay = getattr(task, "delay", None)
            if callable(delay):
                delay(entry.id)
            else:
                task(entry.id)
        except Exception as e:
            print(f"Skipping re-extraction in CI/test: {e}")

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], url_path="documents/(?P<doc_id>[^/.]+)")
    def delete_document(self, request, pk=None, doc_id=None):
        """Delete a document from an entry and re-run analysis"""
        entry = self.get_object()
        try:
            document = entry.documents.get(id=doc_id)
        except EntryDocument.DoesNotExist:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

        document.delete()

        # Trigger re-analysis
        try:
            task = extract_insights_task
            delay = getattr(task, "delay", None)
            if callable(delay):
                delay(entry.id)
            else:
                task(entry.id)
        except Exception as e:
            print(f"Skipping re-extraction in CI/test: {e}")

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"])
    def search(self, request):
        """Search entries by content"""
        query = request.query_params.get("q", "")
        if not query:
            return Response(
                {"error": "Query parameter required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = self.get_queryset().filter(
            Q(title__icontains=query) | Q(content__icontains=query)
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="by_face/(?P<face_id>[^/.]+)")
    def by_face(self, request, face_id):
        """Get entries associated with a specific face"""
        try:
            face_id = int(face_id)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid face ID"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = self.get_queryset().filter(faces__id=face_id).distinct()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="by_category/(?P<category_identifier>[^/.]+)")
    def by_category(self, request, category_identifier):
        """Get entries associated with a specific category by ID or name"""
        from categories.models import Category
        
        # Try to parse as integer first (category ID)
        try:
            category_id = int(category_identifier)
            queryset = self.get_queryset().filter(insights__category__id=category_id).distinct()
        except (ValueError, TypeError):
            # If not an integer, treat as category name
            try:
                # URL decode the category name in case it contains spaces or special characters
                import urllib.parse
                category_name = urllib.parse.unquote(category_identifier)
                queryset = self.get_queryset().filter(insights__category__name__iexact=category_name).distinct()
            except Exception:
                return Response(
                    {"error": "Invalid category identifier"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def reprocess(self, request, pk=None):
        """Manually trigger insight extraction for an entry"""
        entry = self.get_object()
        
        # Reset processing status
        entry.insights_processed = False
        entry.save()
        
        # Trigger insight extraction
        try:
            task = extract_insights_task
            delay = getattr(task, "delay", None)
            if callable(delay):
                delay(entry.id)
            else:
                task(entry.id)
            
            return Response(
                {"message": "Reprocessing started", "entry_id": entry.id},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to start reprocessing: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
