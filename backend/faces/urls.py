from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FaceViewSet, UserFaceSubscriptionViewSet

router = DefaultRouter()
router.register(r"", FaceViewSet, basename="face")
router.register(r"subscriptions", UserFaceSubscriptionViewSet, basename="face-subscription")

urlpatterns = [
    path("", include(router.urls)),
]

