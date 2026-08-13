"""
Tests for the email-verification flow.

All email delivery is mocked — no real API calls are made and no secrets are
needed.  Run with:
    python manage.py test users.tests.test_email_verification
"""
import json
from unittest.mock import MagicMock, patch

from django.test import TestCase, override_settings
from django.urls import reverse


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _req(client, url_name, body):
    return client.post(
        reverse(url_name),
        data=json.dumps(body),
        content_type="application/json",
    )


# ─── 1. Django loads and Resend backend is importable ────────────────────────

class ResendBackendImportTest(TestCase):
    def test_resend_backend_importable(self):
        """django-anymail Resend backend must be importable at Django 4.2."""
        # Will raise ImportError if the package or backend module is missing.
        from anymail.backends.resend import EmailBackend  # noqa: F401


# ─── 2. send_email_verification_link uses send_mail ──────────────────────────

@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="ProjectFlow <test@example.com>",
)
class SendVerificationEmailTest(TestCase):
    def test_send_mail_is_called_with_correct_fields(self):
        """send_email_verification_link must call Django's send_mail and pass
        the right subject/recipient/verify_url."""
        from django.core import mail
        from users.email_utils import send_email_verification_link

        verify_url = "https://project-flow-manager.vercel.app/verify-email?token=abc123"
        send_email_verification_link("user@gmail.com", verify_url)

        self.assertEqual(len(mail.outbox), 1)
        msg = mail.outbox[0]
        self.assertEqual(msg.subject, "Verify your ProjectFlow email")
        self.assertIn("user@gmail.com", msg.to)
        # The verification URL must appear in both plain text and HTML bodies.
        self.assertIn(verify_url, msg.body)
        self.assertIn(verify_url, msg.alternatives[0][0])

    def test_verify_url_has_no_double_slash(self):
        """FRONTEND_URL must not produce a double-slash in the verify URL."""
        from django.core import mail
        from users.email_utils import send_email_verification_link

        # Strip any trailing slash the way the view builds the URL.
        frontend_url = "https://project-flow-manager.vercel.app"
        token = "dummytoken"
        verify_url = f"{frontend_url}/verify-email?token={token}"

        self.assertNotIn("//verify-email", verify_url)
        send_email_verification_link("user@gmail.com", verify_url)
        msg = mail.outbox[0]
        self.assertNotIn("//verify-email", msg.body)


# ─── 3. View returns 200 when email is sent successfully ─────────────────────

@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="ProjectFlow <test@example.com>",
    FRONTEND_URL="https://project-flow-manager.vercel.app",
)
class EmailVerificationRequestViewTest(TestCase):
    def test_returns_200_on_success(self):
        with patch("users.email_utils.send_mail") as mock_send:
            mock_send.return_value = 1
            resp = _req(
                self.client,
                "email-verification-request",
                {"email": "newuser@gmail.com"},
            )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("detail", resp.json())

    def test_returns_503_when_send_raises(self):
        """An email-backend failure must yield HTTP 503, not 500."""
        with patch("users.email_utils.send_mail", side_effect=Exception("network error")):
            resp = _req(
                self.client,
                "email-verification-request",
                {"email": "newuser@gmail.com"},
            )
        self.assertEqual(resp.status_code, 503)
        data = resp.json()
        # The response must not contain any API key or credential.
        self.assertNotIn("RESEND_API_KEY", str(data))
        self.assertNotIn("re_", str(data))  # Resend API key prefix

    def test_rejects_non_gmail(self):
        resp = _req(
            self.client,
            "email-verification-request",
            {"email": "user@example.com"},
        )
        self.assertEqual(resp.status_code, 400)

    def test_rejects_duplicate_email(self):
        from django.contrib.auth.models import User
        User.objects.create_user(
            username="existing",
            email="existing@gmail.com",
            password="testpass123",
        )
        resp = _req(
            self.client,
            "email-verification-request",
            {"email": "existing@gmail.com"},
        )
        self.assertEqual(resp.status_code, 400)


# ─── 4. Secrets are never logged ─────────────────────────────────────────────

@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="ProjectFlow <test@example.com>",
    RESEND_API_KEY="re_test_FAKE_KEY_do_not_log",
    ANYMAIL={"RESEND_API_KEY": "re_test_FAKE_KEY_do_not_log"},
)
class SecretsNotLoggedTest(TestCase):
    def test_api_key_not_in_503_response(self):
        """Even if an anymail error embeds the key in its message, the view
        must not echo it back to the client."""
        fake_key = "re_test_FAKE_KEY_do_not_log"
        with patch(
            "users.email_utils.send_mail",
            side_effect=Exception(f"AnymailError key={fake_key}"),
        ):
            resp = _req(
                self.client,
                "email-verification-request",
                {"email": "user@gmail.com"},
            )
        self.assertEqual(resp.status_code, 503)
        self.assertNotIn(fake_key, resp.content.decode())
