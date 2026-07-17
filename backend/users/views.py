from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core import signing
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .email_utils import send_email_verification_link
from .serializers import RegisterSerializer, UserSerializer


EMAIL_VERIFICATION_SALT = "projectflow.email-verification"


def _normalize_email(value):
    return (value or "").strip().lower()


def _validate_signup_email(email):
    if email.count("@") != 1:
        return "Enter a valid email address."
    local, domain = email.split("@", 1)
    if domain != "gmail.com":
        return "Email must end with @gmail.com."
    if not local:
        return "Enter a valid email address."
    return None


class EmailVerificationRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = _normalize_email(request.data.get("email"))
        error = _validate_signup_email(email)
        if error:
            return Response({"email": [error]}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {"email": ["A user with this email already exists."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = signing.dumps({"email": email}, salt=EMAIL_VERIFICATION_SALT)
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        send_email_verification_link(email, verify_url)
        return Response({"detail": "Verification email sent."}, status=status.HTTP_200_OK)


class EmailVerificationConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = (request.data.get("token") or "").strip()
        if not token:
            return Response({"detail": "Token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = signing.loads(
                token,
                salt=EMAIL_VERIFICATION_SALT,
                max_age=getattr(settings, "EMAIL_VERIFICATION_TOKEN_MAX_AGE", 60 * 60 * 24),
            )
        except signing.BadSignature:
            return Response({"detail": "Invalid or expired verification link."}, status=status.HTTP_400_BAD_REQUEST)

        email = _normalize_email(payload.get("email"))
        error = _validate_signup_email(email)
        if error:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {"detail": "A user with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"email": email, "verification_token": token}, status=status.HTTP_200_OK)


class RegisterView(APIView):
    """
    POST /api/register/
    Creates a new user and returns JWT tokens immediately so the user
    is logged in right after registration.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        token = (request.data.get("email_verification_token") or "").strip()
        email = _normalize_email(request.data.get("email"))
        if not token:
            return Response(
                {"email_verification_token": ["Email verification is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payload = signing.loads(
                token,
                salt=EMAIL_VERIFICATION_SALT,
                max_age=getattr(settings, "EMAIL_VERIFICATION_TOKEN_MAX_AGE", 60 * 60 * 24),
            )
        except signing.BadSignature:
            return Response(
                {"email_verification_token": ["Invalid or expired verification token."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verified_email = _normalize_email(payload.get("email"))
        if email != verified_email:
            return Response(
                {"email": ["Email does not match the verified address."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/login/
    Logs in using email + password and returns JWT tokens + user profile.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        password = request.data.get("password") or ""

        if not email or not password:
            return Response(
                {"detail": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        auth_user = authenticate(username=user.username, password=password)
        if auth_user is None:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(auth_user)
        return Response(
            {
                "user": UserSerializer(auth_user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    """
    GET /api/me/
    Returns the currently authenticated user's profile.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
