from rest_framework_simplejwt import authentication as jwt_authentication
from django.conf import settings
from rest_framework import authentication, exceptions as rest_framework_exceptions

from rest_framework.authentication import BaseAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.exceptions import AuthenticationFailed

from userprofile.models import User

# def enforce_csrf(request):
#     check = authentication.CSRFCheck(request)
#     reason = check.process_view(request, None, (), {})

#     if reason:
#         raise rest_framework_exceptions.PermissionDenied(
#             'CSRF Failed: %s' % reason
#         )
    
# class CustomAuthentication(jwt_authentication.JWTAuthentication):
#     def authenticate(self, request):
#         raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
#         print("Raw Token: ", raw_token)
#         if raw_token is None:
#             return None
        
#         try:
#             validated_token = self.get_validated_token(raw_token)
#             print("Token payload: ", validated_token.payload)
#         except Exception as e:
#             print("Mthfck:", e)
#             raise e
        
#         return (self.get_user(validated_token), validated_token)
    

class CustomAuthentication(jwt_authentication.JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access')
        print("Access Token: ", access_token)
        if access_token is None:
            return None

        try:
            token = AccessToken(access_token)
            user = User.objects.get(id=token['user_id'])
            return (user, None)
        except Exception as e:
            raise AuthenticationFailed("Invalid access token")