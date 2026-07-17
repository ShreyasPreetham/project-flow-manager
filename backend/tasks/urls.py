from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    TaskListCreateView,
    TaskDetailView,
    AssignedTasksView,
    GuestProjectDetailView,
    GuestTaskListView,
    GuestTaskUpdateView,
)

urlpatterns = [
    # Owner project endpoints
    path("projects/",            ProjectListCreateView.as_view(), name="project-list-create"),
    path("projects/<int:pk>/",   ProjectDetailView.as_view(),     name="project-detail"),

    # Owner task endpoints
    path("projects/<int:project_id>/tasks/",          TaskListCreateView.as_view(), name="task-list-create"),
    path("projects/<int:project_id>/tasks/<int:pk>/", TaskDetailView.as_view(),     name="task-detail"),

    # Assigned tasks list (current user's email)
    path("assigned-tasks/", AssignedTasksView.as_view(), name="assigned-tasks"),

    # Guest (assigned user) read-only project board
    path("guest/projects/<int:pk>/",                        GuestProjectDetailView.as_view(), name="guest-project"),
    path("guest/projects/<int:pk>/tasks/",                  GuestTaskListView.as_view(),      name="guest-task-list"),
    path("guest/projects/<int:pk>/tasks/<int:task_id>/",    GuestTaskUpdateView.as_view(),    name="guest-task-update"),
]
