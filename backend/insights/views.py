from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import Insight
from .serializers import InsightSerializer
from categories.models import Category


class InsightViewSet(viewsets.ModelViewSet):
    serializer_class = InsightSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """Return insights for entries owned by the authenticated user, or all insights if no user"""
        if self.request.user.is_authenticated:
            return Insight.objects.filter(entry__user=self.request.user)
        else:
            # For demo purposes, return all insights when not authenticated
            return Insight.objects.all()

    @action(detail=False, methods=["get"])
    def by_category(self, request):
        """Get insights grouped by category"""
        category_id = request.query_params.get("category_id")
        if category_id:
            insights = self.get_queryset().filter(category_id=category_id)
        else:
            insights = self.get_queryset()

        serializer = self.get_serializer(insights, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def sentiment_summary(self, request):
        """Get sentiment summary by category"""
        queryset = self.get_queryset()

        # Group by category and calculate average sentiment
        sentiment_data = (
            queryset.values("category__name", "category__category_type")
            .annotate(avg_sentiment=Avg("sentiment_score"), count=Count("id"))
            .order_by("category__name")
        )

        return Response(sentiment_data)

    @action(detail=False, methods=["get"])
    def search(self, request):
        """Search insights by text snippet"""
        query = request.query_params.get("q", "")
        if not query:
            return Response(
                {"error": "Query parameter required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        insights = self.get_queryset().filter(text_snippet__icontains=query)
        serializer = self.get_serializer(insights, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def entries_by_category(self, request):
        """Get all entries that have insights for a specific category"""
        category_name = request.query_params.get("category_name")
        category_type = request.query_params.get("category_type")

        if not category_name and not category_type:
            return Response(
                {"error": "category_name or category_type parameter required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get insights for the category
        insights_queryset = self.get_queryset()
        if category_name:
            insights_queryset = insights_queryset.filter(
                category__name__icontains=category_name
            )
        if category_type:
            insights_queryset = insights_queryset.filter(
                category__category_type=category_type
            )

        # Get unique entries from these insights
        entries = set()
        for insight in insights_queryset:
            entries.add(insight.entry)

        # Serialize entries
        from entries.serializers import EntrySerializer

        serializer = EntrySerializer(list(entries), many=True)
        return Response(serializer.data)
