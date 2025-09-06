"""
URL configuration for mindjourney project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/entries/", include("entries.urls")),
    path("api/insights/", include("insights.urls")),
    path("api/categories/", include("categories.urls")),
    # Pact provider state handler (test-only)
    path("_pact/provider_states", csrf_exempt(lambda request: _provider_states(request))),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


def _provider_states(request):
    if request.method != "POST":
        return JsonResponse({"error": "method not allowed"}, status=405)
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        payload = {}

    state = payload.get("state") or payload.get("state_name")
    if not state:
        return JsonResponse({"result": "no state provided"}, status=200)

    from django.contrib.auth.models import User
    from entries.models import Entry

    if state == "there are entries":
        user, _ = User.objects.get_or_create(username="pact_user")
        Entry.objects.get_or_create(user=user, title="Sample", content="c")
        return JsonResponse({"result": "ok"}, status=200)

    if state == "entry with id 2 exists":
        user, _ = User.objects.get_or_create(username="pact_user")
        Entry.objects.update_or_create(
            id=2,
            defaults={"user": user, "title": "Second", "content": "x", "is_public": True},
        )
        return JsonResponse({"result": "ok"}, status=200)

    return JsonResponse({"result": f"state '{state}' not handled"}, status=200)
