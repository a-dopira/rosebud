from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.middleware.csrf import get_token
from drf_spectacular.utils import extend_schema_view
from .schemes import (
    LOGIN_SCHEMA,
    REFRESH_SCHEMA,
    LOGOUT_SCHEMA,
    REGISTER_SCHEMA,
    USER_GET_SCHEMA,
    USER_PATCH_SCHEMA,
)
from .serializers import (
    CustomTokenObtainPairSerializer,
    TokenRefreshSerializer,
    UserSerializer,
    RegisterSerializer,
)

User = get_user_model()


@LOGIN_SCHEMA
class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {"detail": "Неверные учетные данные"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        data = serializer.validated_data

        response = Response(
            {"user": data["user"], "detail": "Успешная авторизация"},
            status=status.HTTP_200_OK,
        )

        refresh_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")
        access_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE")

        response.set_cookie(
            refresh_cookie_name,
            str(data.get("refresh")),
            max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
            secure=settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE"),
            httponly=settings.SIMPLE_JWT.get("AUTH_COOKIE_HTTP_ONLY"),
            samesite=settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE"),
            path=settings.SIMPLE_JWT.get("AUTH_COOKIE_PATH", "/"),
        )

        response.set_cookie(
            access_cookie_name,
            str(data.get("access")),
            max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
            secure=settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE"),
            httponly=settings.SIMPLE_JWT.get("AUTH_COOKIE_HTTP_ONLY"),
            samesite=settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE"),
            path=settings.SIMPLE_JWT.get("AUTH_COOKIE_PATH"),
        )

        response.set_cookie(
            "csrftoken",
            request.COOKIES.get("csrftoken", get_token(request)),
            secure=settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE"),
            samesite=settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE"),
            path="/",
        )

        return response


@REFRESH_SCHEMA
class CustomTokenRefreshView(APIView):
    permission_classes = [AllowAny]
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        serializer = TokenRefreshSerializer(
            data=request.data, context={"request": request}
        )

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        data = serializer.validated_data

        response = Response(
            {"detail": "Token refreshed successfully"}, status=status.HTTP_200_OK
        )

        response.set_cookie(
            settings.SIMPLE_JWT.get("AUTH_COOKIE"),
            str(data["access"]),
            max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
            secure=settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE"),
            httponly=settings.SIMPLE_JWT.get("AUTH_COOKIE_HTTP_ONLY"),
            samesite=settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE"),
            path=settings.SIMPLE_JWT.get("AUTH_COOKIE_PATH", "/"),
        )

        return response


@LOGOUT_SCHEMA
class LogoutView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = None

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get(
                settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")
            )

            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except TokenError as e:
                    raise Exception(f"Invalid refresh token: {e}")
                except Exception as e:
                    raise Exception(f"Error revoking token: {e}")

            response = Response(
                {
                    "detail": "Успешный выход из системы",
                }
            )

            access_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE")
            refresh_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")

            response.delete_cookie(access_cookie_name, path="/")
            response.delete_cookie(refresh_cookie_name, path="/")
            response.delete_cookie("csrftoken", path="/")

            return response

        except Exception as e:
            response = Response(
                {"detail": "Выход выполнен с ошибками", "error": str(e)}
            )

            response.delete_cookie(settings.SIMPLE_JWT.get("AUTH_COOKIE"), path="/")
            response.delete_cookie(
                settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH"), path="/"
            )
            response.delete_cookie("csrftoken", path="/")

            return response


@extend_schema_view(get=USER_GET_SCHEMA, patch=USER_PATCH_SCHEMA)
class UserView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    http_method_names = ["get", "patch"]

    def get_object(self):
        return User.objects.select_related("profile").get(pk=self.request.user.pk)


@REGISTER_SCHEMA
class RegisterView(CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
