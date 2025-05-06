from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings


class TestAuthentication:

    def test_valid_authentication(self, authenticated_client):
        url = reverse("user")

        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_expired_access_token(self, expired_access_client):
        url = reverse("user")

        response = expired_access_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_expired_refresh_token(self, expired_refresh_client):
        url = reverse("token_refresh")

        response = expired_refresh_client.post(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_almost_expired_access_token(self, almost_expired_access_client):
        url = reverse("user")

        response = almost_expired_access_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_malformed_token(self, malformed_token_client):
        url = reverse("user")

        response = malformed_token_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_tampered_token(self, tampered_token_client):
        url = reverse("user")

        response = tampered_token_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_token_refresh(self, authenticated_client):
        refresh_url = reverse("token_refresh")

        original_access_token = authenticated_client.cookies.get(
            settings.SIMPLE_JWT["AUTH_COOKIE"]
        ).value

        response = authenticated_client.post(refresh_url)

        assert response.status_code == status.HTTP_200_OK

        new_access_token = response.cookies.get(
            settings.SIMPLE_JWT["AUTH_COOKIE"]
        ).value
        assert new_access_token is not None
        assert new_access_token != original_access_token

        profile_url = reverse("user")
        profile_response = authenticated_client.get(profile_url)

        assert profile_response.status_code == status.HTTP_200_OK

    def test_token_refresh_without_refresh_token(self, api_client, test_user):

        refresh_url = reverse("token_refresh")

        refresh = RefreshToken.for_user(test_user)
        api_client.cookies[settings.SIMPLE_JWT["AUTH_COOKIE"]] = str(
            refresh.access_token
        )

        response = api_client.post(refresh_url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
