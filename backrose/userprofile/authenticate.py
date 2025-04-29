from rest_framework_simplejwt import authentication as jwt_auth
from rest_framework import authentication, exceptions as rest_exceptions


def enforce_csrf(request):
    check = authentication.CSRFCheck(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        print(f"CSRF Failed: {reason}")
        raise rest_exceptions.PermissionDenied(f"CSRF Failed: {reason}")


class CustomAuthentication(jwt_auth.JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get("access")

        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)

            if request.method not in ["GET", "HEAD", "OPTIONS", "TRACE"]:
                try:
                    enforce_csrf(request)
                except Exception as e:
                    raise rest_exceptions.PermissionDenied(
                        f"CSRF проверка не пройдена: {e}"
                    )

            return user, validated_token
        except Exception as e:
            raise rest_exceptions.AuthenticationFailed("Invalid access token")
