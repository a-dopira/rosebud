from django.conf import settings

from .serializers import LoginSerializer, UserSerializer, ProfileSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated


class LoginView(APIView):
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
            samesite='None',
        )
        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite='None',
        )
        return response


class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logout successful"})
        response.delete_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
        )
        response.delete_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
            domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
        )
        return response


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh')
        if not refresh_token:
            return Response({"error": "No refresh token found"}, status=401)

        serializer = self.get_serializer(data={"refresh": refresh_token})
        serializer.is_valid(raise_exception=True)
        access_token = serializer.validated_data['access']

        response = Response({"message": "Token refreshed"})
        response.set_cookie(
            key="access",
            value=access_token,
            httponly=True,
            secure=True,
            samesite='None',
        )
        
        return response
    
