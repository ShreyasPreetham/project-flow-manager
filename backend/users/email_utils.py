import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_email_verification_link(email: str, verify_url: str) -> None:
    """
    Send the email-verification link to the given address.

    Uses whatever EMAIL_BACKEND Django is configured with — Resend via
    django-anymail in production, console backend in local dev.

    Raises on failure so the calling view can catch it and return a safe
    HTTP error without leaking credentials or crashing a Gunicorn worker.
    """
    subject = "Verify your ProjectFlow email"
    plain_message = f"""\
Hi,

Click the link below to verify your email address and continue to registration:
{verify_url}
"""
    html_message = f"""<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;">
    <h1 style="margin:0 0 12px;font-size:24px;">Verify your email</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
      Click the button below to verify <strong>{email}</strong> and continue to registration.
    </p>
    <a href="{verify_url}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;">
      Verify Email
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#64748b;word-break:break-all;">{verify_url}</p>
  </div>
</body>
</html>"""

    # Log safe diagnostics only — never log credentials or API keys.
    logger.info(
        "Attempting verification email send | backend=%s",
        settings.EMAIL_BACKEND,
    )

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info("Verification email dispatched | to=%s", email)
    except Exception as exc:
        # Log exception type and sanitised message — never credentials.
        logger.error(
            "Failed to send verification email | to=%s exc_type=%s msg=%s",
            email,
            type(exc).__name__,
            str(exc),
        )
        raise
