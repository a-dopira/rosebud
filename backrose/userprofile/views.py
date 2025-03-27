from django.conf import settings
from django.db import transaction

from .serializers import LoginSerializer, UserSerializer, RegisterSerializer
from rest_framework.response import Response
from rest_framework import views, status
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import AllowAny, IsAuthenticated


class LoginView(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        response = Response({"message": "Login successful"})
        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=str(access_token),
            httponly=True,
            secure=True,
            samesite="None",
            max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
        )
        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite="None",
            max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
        )
        return response


class LogoutView(views.APIView):
    def post(self, request):
        response = Response({"message": "Logout successful"})

        response.delete_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            domain=settings.SIMPLE_JWT.get("AUTH_COOKIE_DOMAIN", None),
            path=settings.SIMPLE_JWT.get("AUTH_COOKIE_PATH", "/"),
            samesite=settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", None),
        )
        response.delete_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
            domain=settings.SIMPLE_JWT.get("AUTH_COOKIE_DOMAIN", None),
            path=settings.SIMPLE_JWT.get("AUTH_COOKIE_PATH", "/"),
            samesite=settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", None),
        )

        return response


class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                profile_data = serializer.validated_data.pop("profile", {})
                if profile_data:
                    for attr, value in profile_data.items():
                        setattr(user.profile, attr, value)
                    user.profile.save()
                serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class RegisterView(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully. Please log in."},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"])
        if not refresh_token:
            return Response({"error": "Refresh token not found"}, status=401)

        try:

            serializer = self.get_serializer(data={"refresh": refresh_token})
            serializer.is_valid(raise_exception=True)
            access_token = serializer.validated_data["access"]

            response = Response({"message": "Token refreshed successfully"})

            response.set_cookie(
                key=settings.SIMPLE_JWT["AUTH_COOKIE"],
                value=access_token,
                httponly=True,
                secure=True,
                samesite="None",
                max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
            )

            if (
                settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS", False)
                and "refresh" in serializer.validated_data
            ):
                response.set_cookie(
                    key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
                    value=serializer.validated_data["refresh"],
                    httponly=True,
                    secure=True,
                    samesite="None",
                    max_age=settings.SIMPLE_JWT[
                        "REFRESH_TOKEN_LIFETIME"
                    ].total_seconds(),
                )

            return response
        except TokenError as e:
            return Response({"error": str(e)}, status=401)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
