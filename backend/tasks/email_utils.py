"""
Professional task assignment email notifications for ProjectFlow.
Styled after Jira / Linear / Asana — clean, minimal, and actionable.
"""

import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

PRIORITY_META = {
    "Low":      {"color": "#0ea5e9", "bg": "#f0f9ff", "icon": "↓"},
    "Medium":   {"color": "#f59e0b", "bg": "#fffbeb", "icon": "→"},
    "High":     {"color": "#f97316", "bg": "#fff7ed", "icon": "↑"},
    "Critical": {"color": "#ef4444", "bg": "#fef2f2", "icon": "⚑"},
}

STAGE_META = {
    "To Do":       {"color": "#64748b", "bg": "#f8fafc", "icon": "○"},
    "In Progress": {"color": "#f59e0b", "bg": "#fffbeb", "icon": "◑"},
    "Done":        {"color": "#22c55e", "bg": "#f0fdf4", "icon": "●"},
}


def _send_in_thread(subject, plain, html, recipient):
    """Send email synchronously — reliable and simple."""
    try:
        send_mail(
            subject=subject,
            message=plain,
            from_email=f"ProjectFlow <{settings.DEFAULT_FROM_EMAIL}>",
            recipient_list=[recipient],
            html_message=html,
            fail_silently=False,
        )
        logger.info("[EMAIL] ✅ Sent to %s", recipient)
    except Exception as exc:
        logger.error("[EMAIL] ❌ Failed for %s: %s", recipient, exc)


def _is_email(v):
    v = (v or "").strip()
    return "@" in v and "." in v.split("@")[-1]


def send_task_assigned_email(task, assigned_by_username):
    recipient = (task.assignee or "").strip()
    if not _is_email(recipient):
        return

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    task_url     = f"{frontend_url}/projects/{task.project.id}"
    due_str      = task.due_date.strftime("%b %d, %Y") if task.due_date else "No due date"
    priority     = task.priority or "Medium"
    pm           = PRIORITY_META.get(priority, PRIORITY_META["Medium"])
    sm           = STAGE_META.get(task.stage, STAGE_META["To Do"])

    subject = f"[ProjectFlow] {assigned_by_username} assigned a task to you"

    plain = f"""\
You have been assigned a new task on ProjectFlow.

Task:      {task.title}
Project:   {task.project.name}
Assigned:  {assigned_by_username}
Stage:     {task.stage}
Priority:  {priority}
Due Date:  {due_str}
{chr(10) + 'Description: ' + task.description + chr(10) if task.description else ''}
Open this task in ProjectFlow:
{task_url}

——
ProjectFlow · Task Management
You're receiving this because a task was assigned to you.
"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Task Assigned</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;
  font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0"
  style="background:#f4f6f8;padding:48px 16px;">
<tr><td align="center">

  <!-- Outer card -->
  <table role="presentation" width="600" cellspacing="0" cellpadding="0"
    style="max-width:600px;background:#ffffff;border-radius:12px;
           border:1px solid #e1e4e8;overflow:hidden;">

    <!-- ══ TOP BAR ══ -->
    <tr>
      <td style="background:#0052cc;padding:0;height:4px;"></td>
    </tr>

    <!-- ══ LOGO HEADER ══ -->
    <tr>
      <td style="padding:28px 36px 20px;border-bottom:1px solid #eaecef;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <span style="font-size:20px;font-weight:700;color:#0052cc;
                           letter-spacing:-0.5px;">ProjectFlow</span>
            </td>
            <td align="right">
              <span style="font-size:12px;color:#6b7280;font-weight:500;">
                Task Notification
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ══ BODY ══ -->
    <tr>
      <td style="padding:32px 36px;">

        <!-- Greeting -->
        <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;
                  line-height:1.3;">
          A task has been assigned to you
        </p>
        <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.5;">
          <strong style="color:#374151;">{assigned_by_username}</strong>
          assigned you to a task in the
          <strong style="color:#374151;">{task.project.name}</strong> project.
          Please review the details below.
        </p>

        <!-- ── Task block ── -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
          style="border:1px solid #e1e4e8;border-radius:8px;overflow:hidden;
                 margin-bottom:28px;">

          <!-- Task header row -->
          <tr>
            <td style="background:#f6f8fa;padding:16px 20px;
                       border-bottom:1px solid #e1e4e8;">
              <p style="margin:0 0 2px;font-size:11px;font-weight:600;
                         color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">
                {task.project.name}
              </p>
              <p style="margin:0;font-size:17px;font-weight:700;color:#111827;
                         line-height:1.4;">
                {task.title}
              </p>
            </td>
          </tr>

          {"<!-- Description --><tr><td style='padding:16px 20px;border-bottom:1px solid #e1e4e8;'><p style='margin:0;font-size:14px;color:#374151;line-height:1.7;'>" + task.description + "</p></td></tr>" if task.description else ""}

          <!-- Meta grid -->
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>

                  <!-- Stage -->
                  <td width="33%" style="padding:14px 20px;border-right:1px solid #e1e4e8;
                                         vertical-align:top;">
                    <p style="margin:0 0 5px;font-size:11px;font-weight:600;
                               color:#6b7280;text-transform:uppercase;
                               letter-spacing:0.8px;">Stage</p>
                    <span style="display:inline-flex;align-items:center;gap:5px;
                                 padding:4px 10px;border-radius:20px;
                                 background:{sm['bg']};color:{sm['color']};
                                 font-size:13px;font-weight:600;">
                      {sm['icon']} {task.stage}
                    </span>
                  </td>

                  <!-- Priority -->
                  <td width="33%" style="padding:14px 20px;border-right:1px solid #e1e4e8;
                                         vertical-align:top;">
                    <p style="margin:0 0 5px;font-size:11px;font-weight:600;
                               color:#6b7280;text-transform:uppercase;
                               letter-spacing:0.8px;">Priority</p>
                    <span style="display:inline-flex;align-items:center;gap:5px;
                                 padding:4px 10px;border-radius:20px;
                                 background:{pm['bg']};color:{pm['color']};
                                 font-size:13px;font-weight:600;">
                      {pm['icon']} {priority}
                    </span>
                  </td>

                  <!-- Due Date -->
                  <td width="34%" style="padding:14px 20px;vertical-align:top;">
                    <p style="margin:0 0 5px;font-size:11px;font-weight:600;
                               color:#6b7280;text-transform:uppercase;
                               letter-spacing:0.8px;">Due Date</p>
                    <p style="margin:0;font-size:13px;font-weight:600;
                               color:#111827;">{due_str}</p>
                  </td>

                </tr>
              </table>
            </td>
          </tr>

          <!-- Assigned by row -->
          <tr>
            <td style="padding:12px 20px;background:#f6f8fa;
                       border-top:1px solid #e1e4e8;">
              <p style="margin:0;font-size:13px;color:#6b7280;">
                Assigned by
                <strong style="color:#374151;">{assigned_by_username}</strong>
              </p>
            </td>
          </tr>

        </table>

        <!-- ── CTA Button ── -->
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <a href="{task_url}"
                 style="display:inline-block;padding:13px 32px;
                        background:#0052cc;color:#ffffff;
                        font-size:15px;font-weight:600;
                        text-decoration:none;border-radius:6px;
                        letter-spacing:0.1px;">
                Open Task in ProjectFlow
              </a>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Or paste this URL into your browser:<br>
                <a href="{task_url}"
                   style="color:#0052cc;word-break:break-all;
                          text-decoration:none;">{task_url}</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- ══ FOOTER ══ -->
    <tr>
      <td style="padding:20px 36px;border-top:1px solid #eaecef;
                 background:#f6f8fa;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                You're receiving this because a task was assigned to you on
                <strong>ProjectFlow</strong>.<br>
                Project: <strong>{task.project.name}</strong> ·
                Assigned by: <strong>{assigned_by_username}</strong>
              </p>
            </td>
            <td align="right" style="vertical-align:middle;">
              <span style="font-size:14px;font-weight:700;color:#d1d5db;">
                ProjectFlow
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ══ BOTTOM BAR ══ -->
    <tr>
      <td style="background:#0052cc;padding:0;height:3px;"></td>
    </tr>

  </table>

</td></tr>
</table>

</body>
</html>"""

    _send_in_thread(subject, plain, html, recipient)


def send_task_updated_email(task, assigned_by_username, old_assignee=None):
    """Re-assignment: notify new assignee + tell old one they were removed."""
    new_assignee = (task.assignee or "").strip()

    if _is_email(new_assignee):
        send_task_assigned_email(task, assigned_by_username)

    if old_assignee and _is_email(old_assignee) and old_assignee != new_assignee:
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        task_url = f"{frontend_url}/projects/{task.project.id}"
        subject  = f"[ProjectFlow] You've been unassigned from: {task.title}"

        plain = f"""\
Hi,

{assigned_by_username} has reassigned the task "{task.title}"
in project "{task.project.name}".

You are no longer the assignee for this task.

View the project: {task_url}

——
ProjectFlow · Task Management
"""
        html = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f6f8;
  font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"
  style="background:#f4f6f8;padding:48px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0"
  style="max-width:600px;background:#fff;border-radius:12px;
         border:1px solid #e1e4e8;overflow:hidden;">
  <tr><td style="background:#6b7280;height:4px;"></td></tr>
  <tr>
    <td style="padding:28px 36px 20px;border-bottom:1px solid #eaecef;">
      <span style="font-size:20px;font-weight:700;color:#0052cc;">ProjectFlow</span>
    </td>
  </tr>
  <tr>
    <td style="padding:32px 36px;">
      <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">
        Task Reassigned
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
        <strong style="color:#374151;">{assigned_by_username}</strong> has reassigned
        the task <strong style="color:#374151;">{task.title}</strong> in project
        <strong style="color:#374151;">{task.project.name}</strong>.
        You are no longer the assignee for this task.
      </p>
      <a href="{task_url}"
         style="display:inline-block;padding:12px 28px;background:#0052cc;
                color:#fff;font-size:14px;font-weight:600;
                text-decoration:none;border-radius:6px;">
        View Project
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 36px;background:#f6f8fa;
               border-top:1px solid #eaecef;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        ProjectFlow · Task Management
      </p>
    </td>
  </tr>
  <tr><td style="background:#0052cc;height:3px;"></td></tr>
</table>
</td></tr>
</table>
</body></html>"""

        _send_in_thread(subject, plain, html, old_assignee)
