from django.contrib import admin
from .models import Project, Task


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "project_type", "user", "created_at")
    list_filter = ("project_type", "user")
    search_fields = ("name", "description")


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "stage", "priority", "due_date", "project", "user", "created_at")
    list_filter = ("stage", "priority", "project", "user")
    search_fields = ("title", "description")
