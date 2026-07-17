import os, sys
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "taskmanager.settings")
import django; django.setup()

from unittest.mock import MagicMock
from datetime import date
from tasks.email_utils import send_task_assigned_email
from django.conf import settings

# Build a fake task object that matches the real Task model shape
task = MagicMock()
task.id = 1
task.title = "Design the Homepage UI"
task.description = "Create wireframes and high-fidelity mockups for the homepage. Focus on mobile-first responsive design and WCAG accessibility."
task.stage = "To Do"
task.priority = "High"
task.due_date = date(2026, 7, 5)
task.assignee = sys.argv[1] if len(sys.argv) > 1 else settings.EMAIL_HOST_USER
task.project = MagicMock()
task.project.id = 1
task.project.name = "Market Research"

print(f"Sending real assignment email to: {task.assignee}")
send_task_assigned_email(task, assigned_by_username="Shirisha")

import time; time.sleep(3)  # wait for thread
print("Done. Check your inbox.")
