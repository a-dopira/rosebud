from userprofile.models import User
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import TokenError


class UserSerializer(serializers.ModelSerializer):

    app_header = serializers.CharField(
        required=False,
        source="profile.app_header",
        help_text="Заголовок приложения из профиля",
    )
    image = serializers.ImageField(
        required=False,
        source="profile.image",
        help_text="Изображение профиля пользователя",
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "app_header", "image"]
        read_only_fields = ["id", "email"]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})

        instance = super().update(instance, validated_data)

        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    username = User.USERNAME_FIELD

    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = self.get_token(self.user)
        access = refresh.access_token

        data["user"] = UserSerializer(self.user).data

        data["refresh"] = str(refresh)
        data["access"] = str(access)

        return data


class TokenRefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=False)

    def validate(self, attrs):
        request = self.context.get("request")
        if request is None:
            raise serializers.ValidationError("Отсутствует контекст запроса")

        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh")

        refresh_token = request.COOKIES.get(cookie_name)

        if refresh_token is None:
            raise serializers.ValidationError(
                f"Refresh токен не найден ни в данных запроса, ни в куках ({cookie_name})"
            )

        try:
            refresh = RefreshToken(refresh_token)
        except TokenError as e:
            raise serializers.ValidationError(
                f"Недействительный или истекший refresh токен: {str(e)}"
            )
        except Exception as e:
            raise serializers.ValidationError(
                f"Ошибка при обработке refresh токена: {str(e)}"
            )

        data = {"access": str(refresh.access_token)}

        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("email", "username", "password", "password2")

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")

        email = validated_data.get("email")
        username = validated_data.get("username")
        password = validated_data.get("password")

        return User.create_with_profile(
            email=email, username=username, password=password
        )
