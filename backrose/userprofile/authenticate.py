from rest_framework_simplejwt import authentication as jwt_authentication
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.exceptions import AuthenticationFailed

from userprofile.models import User


class CustomAuthentication(jwt_authentication.JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get("access")
        print("Access Token: ", access_token)
        if access_token is None:
            return None

        try:
            token = AccessToken(access_token)
            user = User.objects.get(id=token["user_id"])
            return (user, None)
        except Exception as e:
            raise AuthenticationFailed("Invalid access token")
