"""
Root URL configuration.
All API routes are prefixed with /api/.
"""

from django.contrib import admin
from django.urls import path, include
from .views import api_index, root_landing

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", root_landing, name="root-landing"),
    path("api/", api_index, name="api-index"),
    path("api/", include("users.urls")),
    path("api/", include("tasks.urls")),
]
