from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework import authentication, exceptions as rest_exceptions


def enforce_csrf(request):
    check = authentication.CSRFCheck(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise rest_exceptions.PermissionDenied(f"CSRF Failed: {reason}")


class CustomAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that gets tokens from cookies and implements
    proper error handling for different JWT exception scenarios.
    """

    def authenticate(self, request):
        raw_token = request.COOKIES.get(
            getattr(settings.SIMPLE_JWT, "AUTH_COOKIE", "access")
        )

        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)

        except TokenError as e:
            if "token_not_valid" in str(e):
                if "Token is invalid or expired" in str(e):
                    raise rest_exceptions.AuthenticationFailed("Token expired")

                raise rest_exceptions.AuthenticationFailed("Invalid token")

            raise rest_exceptions.AuthenticationFailed(str(e))

        except InvalidToken as e:
            raise rest_exceptions.AuthenticationFailed("Malformed token")

        except Exception as e:
            raise rest_exceptions.AuthenticationFailed("Authentication failed")

        try:
            user = self.get_user(validated_token)
        except Exception as e:
            raise rest_exceptions.AuthenticationFailed("User not found or inactive")

        if request.method not in ["GET", "HEAD", "OPTIONS", "TRACE"]:
            try:
                enforce_csrf(request)
            except rest_exceptions.PermissionDenied as e:
                raise rest_exceptions.PermissionDenied(str(e))

        return user, validated_token
