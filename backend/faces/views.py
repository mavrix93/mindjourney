from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from typing import List, Dict

from .models import Face, UserFaceSubscription
from .serializers import FaceSerializer, UserFaceSubscriptionSerializer


class FaceViewSet(viewsets.ModelViewSet):
    queryset = Face.objects.all()
    serializer_class = FaceSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=["get"], url_path="subscribed")
    def subscribed(self, request):
        """List faces the current user is subscribed to.

        For demo when unauthenticated, return all faces (so UI can render).
        """
        user = request.user if request.user.is_authenticated else None
        if user is None:
            faces = Face.objects.all()
            serializer = self.get_serializer(faces, many=True)
            return Response(serializer.data)

        subs = UserFaceSubscription.objects.filter(user=user).select_related("face")
        faces = [s.face for s in subs]
        serializer = self.get_serializer(faces, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="suggest")
    def suggest(self, request):
        """Suggest faces based on provided text/title query params.

        Query params:
        - text: main text
        - title: optional title
        Returns a list of suggested faces with reasons and suggested icon.
        """
        text = (request.query_params.get("text") or "").lower()
        title = (request.query_params.get("title") or "").lower()
        blob = f"{title} \n {text}".strip()

        if not blob:
            return Response([], status=status.HTTP_200_OK)

        # Simple keyword-based heuristics; extendable
        suggestions_map: Dict[str, List[str]] = {
            "gardener": ["garden", "gardening", "plant", "potato", "soil", "seed", "harvest"],
            "programmer": ["code", "coding", "program", "programming", "software", "bug", "compile"],
            "software developer": ["refactor", "deploy", "release", "framework", "library", "api"],
            "pythonist": ["python", "pip", "pytest", "numpy", "pandas", "django", "fastapi"],
            "photographer": ["camera", "canon", "nikon", "sony", "lens", "shoot", "exposure", "photo", "picture"],
            "adventurer": ["hike", "trail", "camp", "mountain", "climb", "adventure", "explore", "wild"],
            "father": ["son", "daughter", "kids", "family", "dad", "father"],
            "coworker": ["meeting", "coworker", "colleague", "office", "standup", "sprint"],
        }

        icon_map: Dict[str, str] = {
            "gardener": "🌱",
            "programmer": "💻",
            "software developer": "🧑‍💻",
            "pythonist": "🐍",
            "photographer": "📷",
            "adventurer": "🥾",
            "father": "👨‍👧‍👦",
            "coworker": "🏢",
        }

        matches: List[Dict] = []
        for face_name, keywords in suggestions_map.items():
            if any(k in blob for k in keywords):
                # Try to find an existing face by case-insensitive name
                face_obj = Face.objects.filter(name__iexact=face_name).first()
                matches.append({
                    "id": face_obj.id if face_obj else None,
                    "name": face_name,
                    "icon": face_obj.icon if face_obj and face_obj.icon else icon_map.get(face_name, "🙂"),
                    "reason": f"Matched keywords for {face_name}",
                })

        # De-duplicate by name preserving order
        seen = set()
        unique_matches = []
        for m in matches:
            key = m["name"].lower()
            if key not in seen:
                seen.add(key)
                unique_matches.append(m)

        return Response(unique_matches)

    @action(detail=True, methods=["post"], url_path="subscribe")
    def subscribe(self, request, pk=None):
        face = self.get_object()
        # Demo mode: create a demo user if unauthenticated so UI can subscribe
        user = request.user
        if not user.is_authenticated:
            from django.contrib.auth.models import User
            user, _ = User.objects.get_or_create(username="demo_user", defaults={"email": "demo@example.com"})
        sub, _ = UserFaceSubscription.objects.get_or_create(user=user, face=face)
        return Response({"status": "subscribed", "subscription_id": sub.id})

    @action(detail=True, methods=["post"], url_path="unsubscribe")
    def unsubscribe(self, request, pk=None):
        face = self.get_object()
        # Demo mode: operate on demo user if unauthenticated
        user = request.user
        if not user.is_authenticated:
            from django.contrib.auth.models import User
            user, _ = User.objects.get_or_create(username="demo_user", defaults={"email": "demo@example.com"})
        UserFaceSubscription.objects.filter(user=user, face=face).delete()
        return Response({"status": "unsubscribed"})


class UserFaceSubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserFaceSubscriptionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return UserFaceSubscription.objects.filter(user=self.request.user).select_related("face")
        return UserFaceSubscription.objects.none()

