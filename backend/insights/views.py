from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
import json
from .models import Insight
from .serializers import InsightSerializer
from .geocoding_service import AIGeocodingService
from .ai_service import AIInsightExtractor
from categories.models import Category
from entries.models import Entry
from entries.serializers import EntrySerializer


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

    @action(detail=False, methods=["post"])
    def geocode_place(self, request):
        """Geocode a place name to get coordinates"""
        place_name = request.data.get("place_name")
        context = request.data.get("context", "")
        
        if not place_name:
            return Response(
                {"error": "place_name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            geocoding_service = AIGeocodingService()
            result = geocoding_service.geocode_place(place_name, context)
            
            if result:
                latitude, longitude, full_name = result
                return Response({
                    "latitude": latitude,
                    "longitude": longitude,
                    "full_name": full_name,
                    "place_name": place_name
                })
            else:
                return Response(
                    {"error": "Could not geocode the place"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        except Exception as e:
            return Response(
                {"error": f"Geocoding failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"])
    def ai_query(self, request):
        """Use AI to query the database and return relevant entries"""
        query = request.data.get("query", "")
        
        if not query:
            return Response(
                {"error": "Query is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            # Get all entries for the user (or all entries if not authenticated)
            if request.user.is_authenticated:
                entries_queryset = Entry.objects.filter(user=request.user)
            else:
                entries_queryset = Entry.objects.all()
            
            # Get all insights for these entries
            insights_queryset = self.get_queryset()
            
            # Use AI to analyze the query and find relevant entries
            ai_extractor = AIInsightExtractor()
            
            # Create a comprehensive prompt for the AI to understand the query
            # and find relevant entries based on content, insights, and categories
            prompt = f"""
            You are an AI assistant helping to find relevant diary entries based on a user's query.
            
            User Query: "{query}"
            
            Based on this query, I need you to:
            1. Understand what the user is looking for
            2. Identify relevant keywords, topics, or themes
            3. Suggest search strategies to find matching entries
            
            Consider these aspects when matching:
            - Entry titles and content
            - Extracted insights (places, people, activities, emotions)
            - Categories and sentiment
            - Time periods or dates mentioned
            
            Return a JSON response with:
            {{
                "search_keywords": ["keyword1", "keyword2", ...],
                "search_strategies": ["strategy1", "strategy2", ...],
                "suggested_filters": {{
                    "categories": ["category1", "category2"],
                    "sentiment_range": {{"min": -1.0, "max": 1.0}},
                    "time_period": "recent|all|specific_date"
                }}
            }}
            """
            
            # Get AI response
            response = ai_extractor.model.generate_content(prompt)
            ai_analysis = getattr(response, "text", "")
            
            # Parse AI response (simplified - in production you'd want more robust parsing)
            import json
            import re
            
            try:
                # Extract JSON from AI response
                json_match = re.search(r'\{.*\}', ai_analysis, re.DOTALL)
                if json_match:
                    ai_data = json.loads(json_match.group())
                    search_keywords = ai_data.get("search_keywords", [])
                    search_strategies = ai_data.get("search_strategies", [])
                    suggested_filters = ai_data.get("suggested_filters", {})
                else:
                    # Fallback to simple keyword extraction
                    search_keywords = query.lower().split()
                    search_strategies = ["content_search", "insight_search"]
                    suggested_filters = {}
            except:
                # Fallback parsing
                search_keywords = query.lower().split()
                search_strategies = ["content_search", "insight_search"]
                suggested_filters = {}
            
            # Perform the search based on AI analysis
            matching_entries = set()
            
            # Search in entry content and titles
            for keyword in search_keywords:
                content_matches = entries_queryset.filter(
                    Q(title__icontains=keyword) | Q(content__icontains=keyword)
                )
                matching_entries.update(content_matches)
            
            # Search in insights
            for keyword in search_keywords:
                insight_matches = insights_queryset.filter(
                    Q(text_snippet__icontains=keyword) | 
                    Q(category__name__icontains=keyword)
                )
                for insight in insight_matches:
                    matching_entries.add(insight.entry)
            
            # Apply suggested filters
            if suggested_filters.get("categories"):
                category_matches = entries_queryset.filter(
                    insights__category__name__in=suggested_filters["categories"]
                ).distinct()
                matching_entries.update(category_matches)
            
            # Convert to list and serialize
            matching_entries_list = list(matching_entries)
            
            # Sort by relevance (you could implement more sophisticated ranking)
            matching_entries_list.sort(key=lambda x: x.created_at, reverse=True)
            
            # Limit results to top 10
            matching_entries_list = matching_entries_list[:10]
            
            # Generate AI answer using the found entries as context
            ai_answer = ""
            if matching_entries_list:
                try:
                    # Create context from the found entries
                    context_entries = []
                    for entry in matching_entries_list:
                        context_entries.append({
                            "title": entry.title or "Untitled Entry",
                            "content": entry.content,
                            "date": entry.created_at.strftime("%Y-%m-%d"),
                            "sentiment": entry.overall_sentiment,
                            "location": entry.location_name
                        })
                    
                    # Generate AI answer using the context
                    answer_prompt = f"""
                    You are an AI assistant helping to answer questions about a user's diary entries.
                    
                    User Question: "{query}"
                    
                    Based on the following diary entries, please provide a helpful and insightful answer:
                    
                    {json.dumps(context_entries, indent=2)}
                    
                    Guidelines for your response:
                    1. Answer the user's question directly and helpfully
                    2. Reference specific entries when relevant
                    3. Provide insights and patterns you notice
                    4. Be conversational and personal
                    5. If the question can't be answered from the entries, say so politely
                    6. Keep the response concise but informative
                    
                    Provide your answer in a natural, conversational tone.
                    """
                    
                    answer_response = ai_extractor.model.generate_content(answer_prompt)
                    ai_answer = getattr(answer_response, "text", "").strip()
                    
                except Exception as answer_error:
                    print(f"Failed to generate AI answer: {answer_error}")
                    ai_answer = "I found relevant entries but couldn't generate a specific answer. Please review the entries below."
            
            serializer = EntrySerializer(matching_entries_list, many=True)
            
            return Response({
                "query": query,
                "ai_answer": ai_answer,
                "ai_analysis": ai_analysis,
                "search_keywords": search_keywords,
                "search_strategies": search_strategies,
                "suggested_filters": suggested_filters,
                "results_count": len(matching_entries_list),
                "entries": serializer.data
            })
            
        except Exception as e:
            return Response(
                {"error": f"AI query failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
