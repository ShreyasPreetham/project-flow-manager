from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    TaskListCreateView,
    TaskDetailView,
)

urlpatterns = [
    # Project endpoints
    path("projects/", ProjectListCreateView.as_view(), name="project-list-create"),
    path("projects/<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),

    # Task endpoints (nested under project)
    path("projects/<int:project_id>/tasks/", TaskListCreateView.as_view(), name="task-list-create"),
    path("projects/<int:project_id>/tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
]
