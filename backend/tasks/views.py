from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer


# ─── Project Views ────────────────────────────────────────────────────────────

class ProjectListCreateView(APIView):
    """
    GET  /api/projects/   — list all projects for the authenticated user
    POST /api/projects/   — create a new project
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(user=request.user)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetailView(APIView):
    """
    GET    /api/projects/<id>/  — retrieve a single project with stats
    PUT    /api/projects/<id>/  — update a project
    DELETE /api/projects/<id>/  — delete a project (cascades to tasks)
    """

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
    """
    GET  /api/projects/<project_id>/tasks/   — list tasks for a project
    POST /api/projects/<project_id>/tasks/   — create a task in a project
    """

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
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request, project_id):
        project = self.get_project(project_id, request.user)
        if project is None:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, project=project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    """
    PUT    /api/projects/<project_id>/tasks/<id>/  — update a task
    DELETE /api/projects/<project_id>/tasks/<id>/  — delete a task
    """

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
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, project_id, pk):
        task = self.get_object(pk, project_id, request.user)
        if task is None:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
