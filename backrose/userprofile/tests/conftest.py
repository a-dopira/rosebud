import pytest
from django.conf import settings
from django.utils.timezone import timedelta, now
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.utils import datetime_to_epoch


@pytest.fixture
def register_data(user_data):
    """
    fixture with register data
    user_data is from main conftest
    """

    return {
        "username": user_data["username"],
        "email": user_data["email"],
        "password": user_data["password"],
        "password2": user_data["password"],
    }


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
