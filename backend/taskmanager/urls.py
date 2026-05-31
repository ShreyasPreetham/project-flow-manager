"""
Root URL configuration.
All API routes are prefixed with /api/.
"""

from django.contrib import admin
from django.urls import path, include
from .views import api_index

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", api_index, name="root-api-index"),
    path("api/", api_index, name="api-index"),
    path("api/", include("users.urls")),
    path("api/", include("tasks.urls")),
]
