from django.contrib.auth.models import User
from django.db import models


class Project(models.Model):
    """
    A project groups tasks together under a named container.
    Each project belongs to one user and has a type (Software / Business / Personal).
    """

    class ProjectType(models.TextChoices):
        SOFTWARE = "Software", "Software"
        BUSINESS = "Business", "Business"
        PERSONAL = "Personal", "Personal"

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    project_type = models.CharField(
        max_length=20,
        choices=ProjectType.choices,
        default=ProjectType.SOFTWARE,
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.project_type}] {self.name} — {self.user.username}"


class Task(models.Model):
    """
    A task belongs to a project and has a stage, priority, assignee, and optional due date.
    """

    class Stage(models.TextChoices):
        TODO = "To Do", "To Do"
        IN_PROGRESS = "In Progress", "In Progress"
        DONE = "Done", "Done"

    class Priority(models.TextChoices):
        LOW = "Low", "Low"
        MEDIUM = "Medium", "Medium"
        HIGH = "High", "High"
        CRITICAL = "Critical", "Critical"

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    assignee = models.CharField(max_length=120)
    stage = models.CharField(
        max_length=20,
        choices=Stage.choices,
        default=Stage.TODO,
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    due_date = models.DateField(null=True, blank=True)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.stage}] {self.title} — {self.user.username}"
