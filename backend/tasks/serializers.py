from rest_framework import serializers
from .models import Project, Task


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Project CRUD.
    Includes computed statistics (task counts per stage) for the dashboard.
    """

    user = serializers.StringRelatedField(read_only=True)
    task_count = serializers.SerializerMethodField()
    todo_count = serializers.SerializerMethodField()
    in_progress_count = serializers.SerializerMethodField()
    done_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            "id", "name", "description", "project_type", "user",
            "task_count", "todo_count", "in_progress_count", "done_count",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")

    def get_task_count(self, obj):
        return obj.tasks.count()

    def get_todo_count(self, obj):
        return obj.tasks.filter(stage="To Do").count()

    def get_in_progress_count(self, obj):
        return obj.tasks.filter(stage="In Progress").count()

    def get_done_count(self, obj):
        return obj.tasks.filter(stage="Done").count()

    def validate_project_type(self, value):
        valid = [c[0] for c in Project.ProjectType.choices]
        if value not in valid:
            raise serializers.ValidationError(
                f"Invalid type. Must be one of: {', '.join(valid)}"
            )
        return value


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for Task CRUD.
    `user` and `project` id are read-only — set in the view layer.
    """

    user = serializers.StringRelatedField(read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Task
        fields = (
            "id", "title", "description", "assignee", "stage", "priority",
            "due_date", "project", "project_name", "user",
            "created_at", "updated_at",
        )
        # `project` is set from the nested route in the view:
        # /api/projects/<project_id>/tasks/
        read_only_fields = ("id", "user", "project", "project_name", "created_at", "updated_at")

    def validate_stage(self, value):
        valid = [c[0] for c in Task.Stage.choices]
        if value not in valid:
            raise serializers.ValidationError(
                f"Invalid stage. Must be one of: {', '.join(valid)}"
            )
        return value

    def validate_priority(self, value):
        valid = [c[0] for c in Task.Priority.choices]
        if value not in valid:
            raise serializers.ValidationError(
                f"Invalid priority. Must be one of: {', '.join(valid)}"
            )
        return value

    def validate_assignee(self, value):
        cleaned = (value or "").strip()
        if not cleaned:
            raise serializers.ValidationError("Assignee is required.")
        return cleaned

    def validate_due_date(self, value):
        if value is None:
            raise serializers.ValidationError("Due date is required.")
        return value
