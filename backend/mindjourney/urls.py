"""
URL configuration for mindjourney project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from .auth_views import LogoutView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", obtain_auth_token, name="api_token_auth"),
    path("api/auth/logout/", LogoutView.as_view(), name="api_token_logout"),
    path("api/auth/", include("rest_framework.urls")),
    path("api/entries/", include("entries.urls")),
    path("api/insights/", include("insights.urls")),
    path("api/categories/", include("categories.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
