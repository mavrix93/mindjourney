from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

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

    @action(detail=True, methods=["post"], url_path="subscribe")
    def subscribe(self, request, pk=None):
        face = self.get_object()
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        sub, _ = UserFaceSubscription.objects.get_or_create(user=request.user, face=face)
        return Response({"status": "subscribed", "subscription_id": sub.id})

    @action(detail=True, methods=["post"], url_path="unsubscribe")
    def unsubscribe(self, request, pk=None):
        face = self.get_object()
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        UserFaceSubscription.objects.filter(user=request.user, face=face).delete()
        return Response({"status": "unsubscribed"})


class UserFaceSubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserFaceSubscriptionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return UserFaceSubscription.objects.filter(user=self.request.user).select_related("face")
        return UserFaceSubscription.objects.none()

