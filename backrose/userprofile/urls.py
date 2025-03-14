from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("user-profile/", views.UserProfileView.as_view(), name="user-profile"),
    path("register/", views.RegisterView.as_view(), name="register"),
    path(
        "token/refresh/", views.CookieTokenRefreshView.as_view(), name="token-refresh"
    ),
]
