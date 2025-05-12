from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.middleware.csrf import get_token
from .serializers import (
    CustomTokenObtainPairSerializer,
    TokenRefreshSerializer,
    UserSerializer,
    ProfileSerializer,
    RegisterSerializer,
)


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


class CustomTokenRefreshView(APIView):
    permission_classes = [AllowAny]

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


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({"detail": "Успешный выход из системы"})

        access_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE")
        refresh_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")

        response.delete_cookie(access_cookie_name, path="/")
        response.delete_cookie(refresh_cookie_name, path="/")

        return response


class UserView(APIView):

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UpdateProfileView(APIView):

    def patch(self, request):
        user = request.user
        profile = user.profile

        profile_serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()
            user_serializer = UserSerializer(user)
            return Response(user_serializer.data)
        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully. Please log in."},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
