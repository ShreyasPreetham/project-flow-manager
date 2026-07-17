from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer
from .email_utils import send_task_assigned_email, send_task_updated_email


# ─── Project Views ────────────────────────────────────────────────────────────

class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(user=request.user)
        return Response(ProjectSerializer(projects, many=True).data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Project.objects.get(pk=pk, user=user)
        except Project.DoesNotExist:
            return None

    def get(self, request, pk):
        project = self.get_object(pk, request.user)
        if project is None:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProjectSerializer(project).data)

    def put(self, request, pk):
        project = self.get_object(pk, request.user)
        if project is None:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = self.get_object(pk, request.user)
        if project is None:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Task Views ───────────────────────────────────────────────────────────────

class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_project(self, project_id, user):
        try:
            return Project.objects.get(pk=project_id, user=user)
        except Project.DoesNotExist:
            return None

    def get(self, request, project_id):
        project = self.get_project(project_id, request.user)
        if project is None:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        tasks = Task.objects.filter(project=project, user=request.user)
        return Response(TaskSerializer(tasks, many=True).data)

    def post(self, request, project_id):
        project = self.get_project(project_id, request.user)
        if project is None:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            task = serializer.save(user=request.user, project=project)
            send_task_assigned_email(task, assigned_by_username=request.user.username)
            return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, project_id, user):
        try:
            return Task.objects.get(pk=pk, project_id=project_id, user=user)
        except Task.DoesNotExist:
            return None

    def put(self, request, project_id, pk):
        task = self.get_object(pk, project_id, request.user)
        if task is None:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
        old_assignee = task.assignee
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            updated_task = serializer.save()
            if updated_task.assignee != old_assignee:
                send_task_updated_email(
                    updated_task,
                    assigned_by_username=request.user.username,
                    old_assignee=old_assignee,
                )
            return Response(TaskSerializer(updated_task).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, project_id, pk):
        task = self.get_object(pk, project_id, request.user)
        if task is None:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Assigned Tasks View ──────────────────────────────────────────────────────

class AssignedTasksView(APIView):
    """
    GET /api/assigned-tasks/
    Returns all tasks assigned to the logged-in user (matched by email).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_email = (request.user.email or "").strip().lower()
        if not user_email:
            return Response({"detail": "Your account has no email."}, status=400)
        tasks = (
            Task.objects
            .filter(assignee__iexact=user_email)
            .select_related("project")
            .order_by("project__name", "-created_at")
        )
        return Response(TaskSerializer(tasks, many=True).data)


# ─── Guest Project Board (for assigned users) ─────────────────────────────────

class GuestProjectDetailView(APIView):
    """
    GET /api/guest/projects/<id>/
    Returns project info for an assigned user (non-owner).
    Only works if the logged-in user has at least one task assigned in this project.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user_email = (request.user.email or "").strip().lower()
        # Verify the user is actually assigned to at least one task in this project
        has_access = Task.objects.filter(
            project_id=pk,
            assignee__iexact=user_email
        ).exists()
        if not has_access:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProjectSerializer(project).data)


class GuestTaskListView(APIView):
    """
    GET /api/guest/projects/<id>/tasks/
    Returns ALL tasks in the project visible to the assigned user.
    The assigned user can see all tasks so they understand the full board context.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user_email = (request.user.email or "").strip().lower()
        has_access = Task.objects.filter(
            project_id=pk,
            assignee__iexact=user_email
        ).exists()
        if not has_access:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        tasks = (
            Task.objects
            .filter(project_id=pk)
            .select_related("project")
            .order_by("-created_at")
        )
        return Response(TaskSerializer(tasks, many=True).data)


class GuestTaskUpdateView(APIView):
    """
    PUT /api/guest/projects/<project_id>/tasks/<task_id>/
    Assigned user can update the stage of their own assigned task.
    """
    permission_classes = [IsAuthenticated]

    def put(self, request, pk, task_id):
        user_email = (request.user.email or "").strip().lower()
        try:
            task = Task.objects.get(pk=task_id, project_id=pk, assignee__iexact=user_email)
        except Task.DoesNotExist:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        # Assigned user can only update stage — not reassign or delete
        allowed_fields = {"stage"}
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        serializer = TaskSerializer(task, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
