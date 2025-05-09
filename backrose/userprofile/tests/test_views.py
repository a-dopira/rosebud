import pytest
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.urls import reverse
from django.conf import settings
from userprofile.models import User


@pytest.mark.django_db
class TestRegisterView:

    def test_successful_registration(self, api_client, register_data):
        url = reverse("register")
        response = api_client.post(url, data=register_data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_registration_missing_fields(self, api_client):
        url = reverse("register")
        invalid_data = {"username": "mismatch"}
        response = api_client.post(url, data=invalid_data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_password_mismatch(self, api_client, register_data):
        url = reverse("register")
        register_data["password2"] = "incorrect_password"

        response = api_client.post(url, data=register_data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestCustomTokenObtainPairView:

    def test_successful_login(self, api_client, user_data, test_user):
        """test_user here to create a user despite the fact that it's not used"""

        url = reverse("token_obtain_pair")

        response = api_client.post(url, user_data, format="json")

        assert response.status_code == status.HTTP_200_OK

        refresh_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")
        access_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE")

        assert refresh_cookie_name in response.cookies
        assert access_cookie_name in response.cookies

        refresh_cookie = response.cookies[refresh_cookie_name]
        access_cookie = response.cookies[access_cookie_name]

        assert refresh_cookie["max-age"] == int(
            settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()
        )
        assert access_cookie["max-age"] == int(
            settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()
        )

        assert refresh_cookie["httponly"] == bool(
            settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"]
        )

        assert refresh_cookie["path"] == settings.SIMPLE_JWT.get(
            "AUTH_COOKIE_PATH", "/"
        )

    def test_wrong_password(self, api_client, user_data, test_user):

        url = reverse("token_obtain_pair")

        user_data["password"] = "wrong_password"

        response = api_client.post(url, user_data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.parametrize(
        "data",
        [{}, {"email": "test@example.com"}, {"password": "testfancypassword123"}],
    )
    def test_missing_data(self, api_client, data, test_user):

        url = reverse("token_obtain_pair")

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_csrf_token_setting(self, api_client, test_user, user_data):
        url = reverse("token_obtain_pair")

        response = api_client.post(url, user_data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "csrftoken" in response.cookies


class TestCustomTokenRefreshView:

    def test_successful_token_refresh(self, api_client, test_user):

        refresh = RefreshToken.for_user(test_user)
        refresh_token = str(refresh)

        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")
        api_client.cookies[cookie_name] = refresh_token

        api_client.defaults["HTTP_COOKIE"] = f"{cookie_name}={refresh_token}"

        url = reverse("token_refresh")

        response = api_client.post(url, {}, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "detail" in response.data
        assert response.data["detail"] == "Token refreshed successfully"

        access_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE")
        assert access_cookie_name in response.cookies

        access_cookie = response.cookies[access_cookie_name]
        assert access_cookie["max-age"] == int(
            settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()
        )
        assert access_cookie["httponly"] == bool(
            settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"]
        )
        assert access_cookie["path"] == settings.SIMPLE_JWT.get("AUTH_COOKIE_PATH")

    def test_http_methods(self, api_client, test_user):
        """only post should work"""
        url = reverse("token_obtain_pair")

        response = api_client.get(url)
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        response = api_client.put(url, {})
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        response = api_client.delete(url)
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        response = api_client.patch(url, {})
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


class TestLogoutView:

    def test_successful_logout(self, authenticated_client):
        url = reverse("logout")
        response = authenticated_client.post(url)

        assert response.status_code == status.HTTP_200_OK

        access_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE")
        refresh_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")

        assert access_cookie_name in response.cookies
        assert refresh_cookie_name in response.cookies
        assert response.cookies[access_cookie_name].value == ""
        assert response.cookies[refresh_cookie_name].value == ""
        assert response.cookies[access_cookie_name]["max-age"] == 0
        assert response.cookies[refresh_cookie_name]["max-age"] == 0

    def test_logout_without_authentication(self, api_client):
        """successful logout without authentication"""
        url = reverse("logout")
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK


class TestUserView:

    def test_get_user_data(self, authenticated_client, test_user):
        """getting user data"""
        url = reverse("user")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["username"] == test_user.username
        assert response.data["email"] == test_user.email

    def test_unauthenticated_access(self, api_client):
        """no credentials provided"""
        url = reverse("user")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestUpdateProfileView:

    @pytest.mark.django_db
    def test_user_registration_creates_profile(self, api_client, user_data):
        """new user registration creates profile"""
        url = reverse("register")

        registration_data = user_data.copy()
        registration_data["password2"] = user_data["password"]

        response = api_client.post(url, registration_data)
        assert response.status_code == status.HTTP_201_CREATED

        new_user = User.objects.get(email=registration_data["email"])
        assert hasattr(new_user, "profile")
        assert new_user.profile is not None

    def test_invalid_profile_data(self, authenticated_client):
        url = reverse("update_profile")
        invalid_data = {"image": "invalid_data"}
        response = authenticated_client.patch(url, data=invalid_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_profile_update(self, authenticated_client, test_user):
        """profile update test"""
        url = reverse("update_profile")
        update_data = {"app_header": "Новый заголовок приложения"}

        response = authenticated_client.patch(url, update_data, format="json")
        assert response.status_code == status.HTTP_200_OK

        response_data = response.json()
        assert response_data["profile"]["app_header"] == update_data["app_header"]

        test_user.refresh_from_db()
        assert test_user.profile.app_header == update_data["app_header"]

    def test_get_user_profile(self, authenticated_client, test_user):
        """get user profile test"""
        url = reverse("user")

        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK

        response_data = response.json()
        assert response_data["username"] == test_user.username
        assert response_data["email"] == test_user.email
        assert "profile" in response_data


class TestLoginCases:

    def test_double_login(self, api_client, test_user, user_data):
        url = reverse("token_obtain_pair")

        # first login
        response1 = api_client.post(url, data=user_data, format="json")
        assert response1.status_code == status.HTTP_200_OK

        # second login (should return new tokens)
        response2 = api_client.post(url, data=user_data, format="json")
        assert response2.status_code == status.HTTP_200_OK

        # access tokens should be different
        assert response1.cookies["access"].value != response2.cookies["access"].value


class TestSecurity:

    @pytest.mark.django_db
    def test_sql_injection_login(self, api_client):
        """test sql injection through login"""
        url = reverse("token_obtain_pair")

        initial_user_count = User.objects.count()

        injection_attempts = [
            {"username": "' OR '1'='1", "password": "anything"},
            {"username": "test'; DROP TABLE users; --", "password": "test"},
            {"username": "' UNION SELECT * FROM users --", "password": "test"},
            {"username": "admin' --", "password": "anything"},
        ]

        for attempt in injection_attempts:
            response = api_client.post(url, data=attempt, format="json")
            assert response.status_code == status.HTTP_401_UNAUTHORIZED

        assert User.objects.count() == initial_user_count

    def test_password_exposure(self, authenticated_client):
        url = reverse("user")
        response = authenticated_client.get(url)

        assert "password" not in str(response.content).lower()
