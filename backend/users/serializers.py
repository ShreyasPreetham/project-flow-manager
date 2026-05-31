from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
import re


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password confirmation."""

    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="A user with this email already exists.")],
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        label="Confirm password",
    )

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "password2")

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        raw_username = (validated_data.get("username") or "").strip()
        email = validated_data["email"]

        # Username must be unique in Django's default User model.
        # If caller doesn't provide one (or it already exists), derive a unique one from email.
        if raw_username:
            base_username = raw_username
        else:
            base_username = email.split("@")[0]

        base_username = re.sub(r"[^a-zA-Z0-9_@.+-]", "", base_username) or "user"
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data["password"],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Read-only serializer for returning basic user info."""

    class Meta:
        model = User
        fields = ("id", "username", "email")
