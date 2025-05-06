import pytest
from django.conf import settings
from django.test import RequestFactory
from rest_framework_simplejwt.tokens import RefreshToken


from userprofile.serializers import (
    ProfileSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    TokenRefreshSerializer,
    RegisterSerializer,
)


class TestProfileSerializer:
    def test_profile_serializer_fields(self, test_user):
        """test that profile serializer contains expected fields"""
        profile = test_user.profile
        serializer = ProfileSerializer(profile)

        assert set(serializer.data.keys()) == {"app_header", "image"}


class TestUserSerializer:
    def test_user_serializer_fields(self, test_user):
        """user's serializer contains expected fields"""
        serializer = UserSerializer(test_user)

        assert set(serializer.data.keys()) == {"id", "username", "email", "profile"}
        assert set(serializer.data["profile"].keys()) == {"app_header", "image"}

    def test_profile_data_included(self, test_user):
        """profile data is included in user's serializer output"""
        profile = test_user.profile
        expected_value = profile.app_header

        serializer = UserSerializer(test_user)

        assert serializer.data["profile"]["app_header"] == expected_value


class TestCustomTokenObtainPairSerializer:
    def test_validate_includes_user_data(self, test_user, mocker):
        serializer = CustomTokenObtainPairSerializer()
        serializer.user = test_user

        mocker.patch(
            "rest_framework_simplejwt.serializers.TokenObtainPairSerializer.validate",
            return_value={"refresh": "refresh-token", "access": "access-token"},
        )

        mock_token = mocker.MagicMock()
        mock_token.access_token = mocker.MagicMock()
        mocker.patch.object(serializer, "get_token", return_value=mock_token)

        data = serializer.validate({})

        assert "user" in data
        assert data["user"]["username"] == test_user.username


class TestTokenRefreshSerializer:

    def test_validate_with_refresh_token_in_cookies(self, test_user):
        """token in cookies"""
        request = RequestFactory().post("/")
        refresh_token = RefreshToken.for_user(test_user)

        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")
        request.COOKIES[cookie_name] = str(refresh_token)

        serializer = TokenRefreshSerializer(data={}, context={"request": request})

        assert serializer.is_valid()
        validated_data = serializer.validated_data
        assert "access" in validated_data
        assert isinstance(validated_data["access"], str)

    def test_validate_without_refresh_token(self):
        """test validate method without refresh token"""
        request = RequestFactory().post("/")

        serializer = TokenRefreshSerializer(data={}, context={"request": request})

        assert not serializer.is_valid()
        assert "non_field_errors" in serializer.errors

    def test_validate_without_request_context(self):
        """empty request context"""
        serializer = TokenRefreshSerializer(data={})

        assert not serializer.is_valid()
        assert "non_field_errors" in serializer.errors
        assert "Отсутствует контекст запроса" in serializer.errors["non_field_errors"]

    def test_validate_with_invalid_token(self):

        request = RequestFactory().post("/")
        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")
        request.COOKIES[cookie_name] = "invalid_token"

        serializer = TokenRefreshSerializer(data={}, context={"request": request})

        assert not serializer.is_valid()
        assert "non_field_errors" in serializer.errors
        error_msg = serializer.errors["non_field_errors"][0]
        assert "Недействительный или истекший refresh токен" in error_msg

    def test_validate_with_expired_token(self, expired_refresh_client):

        expired_token = expired_refresh_client.cookies.get(
            settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")
        )

        request = RequestFactory().post("/")
        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")
        request.COOKIES[cookie_name] = str(expired_token)

        serializer = TokenRefreshSerializer(data={}, context={"request": request})

        assert not serializer.is_valid()
        assert "non_field_errors" in serializer.errors
        error_msg = serializer.errors["non_field_errors"][0]
        assert "Недействительный или истекший refresh токен" in error_msg

    def test_validate_with_malformed_token(self):

        request = RequestFactory().post("/")
        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")
        request.COOKIES[cookie_name] = "malformed_token"

        serializer = TokenRefreshSerializer(data={}, context={"request": request})

        assert not serializer.is_valid()
        assert "non_field_errors" in serializer.errors
        error_msg = serializer.errors["non_field_errors"][0]
        assert "Недействительный или истекший refresh токен" in error_msg

    def test_validate_with_different_cookie_name(self, test_user, settings):
        """in case a cookie name has been changed in settings, it should still work"""

        original_cookie_refresh = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")
        settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"] = "custom_refresh_cookie"

        refresh_token = RefreshToken.for_user(test_user)

        try:
            request = RequestFactory().post("/")
            request.COOKIES["custom_refresh_cookie"] = str(refresh_token)

            serializer = TokenRefreshSerializer(data={}, context={"request": request})

            assert serializer.is_valid()
            validated_data = serializer.validated_data
            assert "access" in validated_data
        finally:
            settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"] = original_cookie_refresh


@pytest.mark.django_db
class TestRegisterSerializer:
    def test_validate_passwords_match(self, register_data):
        """test validate method when passwords match"""
        serializer = RegisterSerializer(data=register_data)

        assert serializer.is_valid()

    def test_validate_passwords_dont_match(self, register_data):
        """test validate method when passwords don't match"""

        register_data["password2"] = "incorrect_password"

        serializer = RegisterSerializer(data=register_data)

        assert not serializer.is_valid()
        assert "password" in serializer.errors

    def test_create_user_and_profile(self, register_data):
        """Test create method creates user and profile"""
        serializer = RegisterSerializer(data=register_data)

        assert serializer.is_valid()
        user = serializer.save()

        assert user.username == register_data["username"]
        assert user.email == register_data["email"]
        assert user.check_password(register_data["password"])
        assert hasattr(user, "profile")
        assert user.profile is not None
