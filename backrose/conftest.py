import pytest
from django.conf import settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

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