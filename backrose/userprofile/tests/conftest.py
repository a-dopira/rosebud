import pytest
from django.conf import settings
from django.utils.timezone import timedelta, now
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient
from rest_framework_simplejwt.utils import datetime_to_epoch
from userprofile.models import User, Profile


@pytest.fixture
def user_data():
    """fixture with user data"""

    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testfancypassword123",
    }


@pytest.fixture
def register_data(user_data):
    """fixture with register data"""

    return {
        "username": user_data["username"],
        "email": user_data["email"],
        "password": user_data["password"],
        "password2": user_data["password"],
    }


@pytest.fixture
def test_user(user_data, db):
    """fixture with a test user"""

    user = User.objects.create_user(
        username=user_data["username"],
        email=user_data["email"],
        password=user_data["password"],
    )

    Profile.objects.create(user=user)
    return user


@pytest.fixture
def api_client():
    """client api for tests"""

    return APIClient()


# tokens fixtures


@pytest.fixture
def authenticated_client(api_client, test_user):
    """authenticated api client with token in cookies"""

    refresh = RefreshToken.for_user(test_user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    api_client.cookies[settings.SIMPLE_JWT["AUTH_COOKIE"]] = access_token
    api_client.cookies[settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"]] = refresh_token

    cookie_header = f"{settings.SIMPLE_JWT['AUTH_COOKIE']}={access_token}; {settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH']}={refresh_token}"
    api_client.defaults["HTTP_COOKIE"] = cookie_header

    return api_client


@pytest.fixture
def expired_access_client(api_client, test_user):
    """client with expired access token"""

    refresh = RefreshToken.for_user(test_user)
    access_token = refresh.access_token

    access_token.payload["exp"] = datetime_to_epoch(now() - timedelta(minutes=5))
    api_client.cookies[settings.SIMPLE_JWT["AUTH_COOKIE"]] = str(access_token)

    return api_client


@pytest.fixture
def expired_refresh_client(api_client, test_user):
    """client with expired refresh token"""

    refresh = RefreshToken.for_user(test_user)

    refresh.payload["exp"] = datetime_to_epoch(now() - timedelta(minutes=5))

    api_client.cookies[settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"]] = str(refresh)
    return api_client


@pytest.fixture
def almost_expired_access_client(api_client, test_user):
    """client with access token that is going to expire soon (30 sec left)"""

    refresh = RefreshToken.for_user(test_user)
    access_token = refresh.access_token

    access_token.payload["exp"] = datetime_to_epoch(now() + timedelta(hours=1))

    api_client.cookies[settings.SIMPLE_JWT["AUTH_COOKIE"]] = str(access_token)
    return api_client


@pytest.fixture
def malformed_token_client(api_client):
    """client with incorrect token"""

    api_client.cookies[settings.SIMPLE_JWT["AUTH_COOKIE"]] = "malformed_token"
    return api_client


@pytest.fixture
def tampered_token_client(api_client, test_user):
    """client with tampered token"""

    refresh = RefreshToken.for_user(test_user)
    token_parts = str(refresh.access_token).split(".")
    if len(token_parts) == 3:
        tampered_token = f"{token_parts[0]}.{token_parts[1]}.tampered_token"
        api_client.cookies[settings.SIMPLE_JWT["AUTH_COOKIE"]] = tampered_token
    return api_client
