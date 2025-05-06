import pytest
from django.conf import settings
from django.test import RequestFactory
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from userprofile.authenticate import CustomAuthentication, enforce_csrf


class TestEnforceCSRF:
    def test_enforce_csrf_success(self, mocker):
        """successful CSRF check"""
        factory = RequestFactory()
        request = factory.post("/somefancyurl")

        mocker.patch(
            "django.middleware.csrf.CsrfViewMiddleware.process_view", return_value=None
        )
        assert enforce_csrf(request) is None

    def test_enforce_csrf_fail(self, mocker):
        """failed CSRF check"""
        factory = RequestFactory()
        request = factory.post("/")

        mocker.patch(
            "django.middleware.csrf.CsrfViewMiddleware.process_view",
            return_value="CSRF Failed",
        )
        with pytest.raises(PermissionDenied):
            enforce_csrf(request)


class TestCustomAuthentication:

    def test_authenticate_with_csrf_check_post(self, test_user, mocker):
        """csrf in POST request"""
        refresh = RefreshToken.for_user(test_user)
        access_token = str(refresh.access_token)

        auth = CustomAuthentication()
        factory = RequestFactory()
        request = factory.post("/")
        request.COOKIES = {settings.SIMPLE_JWT.get("AUTH_COOKIE"): access_token}

        mocker.patch.object(
            auth, "get_validated_token", return_value={"user_id": test_user.id}
        )
        mocker.patch.object(auth, "get_user", return_value=test_user)

        mock_enforce_csrf = mocker.patch("userprofile.authenticate.enforce_csrf")

        result = auth.authenticate(request)

        mock_enforce_csrf.assert_called_once_with(request)

        assert result is not None
        assert len(result) == 2
        assert result[0] == test_user

    def test_authenticate_with_csrf_check_get(self, test_user, mocker):
        """no csrf in GET request"""

        refresh = RefreshToken.for_user(test_user)
        access_token = str(refresh.access_token)

        auth = CustomAuthentication()
        factory = RequestFactory()
        request = factory.get("/")

        request.COOKIES = {settings.SIMPLE_JWT.get("AUTH_COOKIE"): access_token}

        mocker.patch.object(
            auth, "get_validated_token", return_value={"user_id": test_user.id}
        )
        mocker.patch.object(auth, "get_user", return_value=test_user)

        mock_enforce_csrf = mocker.patch("userprofile.authenticate.enforce_csrf")

        result = auth.authenticate(request)

        mock_enforce_csrf.assert_not_called()

        assert result is not None
        assert len(result) == 2
        assert result[0] == test_user

    def test_authenticate_csrf_check_failure(self, test_user, mocker):
        """failed CSRF check"""
        refresh = RefreshToken.for_user(test_user)
        access_token = str(refresh.access_token)

        auth = CustomAuthentication()
        factory = RequestFactory()
        request = factory.post("/")
        request.COOKIES = {settings.SIMPLE_JWT.get("AUTH_COOKIE"): access_token}

        mocker.patch.object(
            auth, "get_validated_token", return_value={"user_id": test_user.id}
        )
        mocker.patch.object(auth, "get_user", return_value=test_user)

        mocker.patch(
            "userprofile.authenticate.enforce_csrf",
            side_effect=PermissionDenied("CSRF check failed"),
        )

        with pytest.raises(PermissionDenied):
            auth.authenticate(request)
