from drf_spectacular.extensions import OpenApiAuthenticationExtension
from django.conf import settings


class CustomAuthenticationExtension(OpenApiAuthenticationExtension):
    target_class = "userprofile.authenticate.CustomAuthentication"
    name = "CookieAuth"

    def get_security_definition(self, auto_schema):
        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE", "access")
        return {
            "type": "apiKey",
            "in": "cookie",
            "name": cookie_name,
            "description": f'jwt cookie "{cookie_name}" for authentication',
        }
