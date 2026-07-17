from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    EmailVerificationConfirmView,
    EmailVerificationRequestView,
    RegisterView,
    MeView,
    LoginView,
)

urlpatterns = [
    # Auth endpoints
    path("email-verification/request/", EmailVerificationRequestView.as_view(), name="email-verification-request"),
    path("email-verification/confirm/", EmailVerificationConfirmView.as_view(), name="email-verification-confirm"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),                    # login with email + password
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
]
