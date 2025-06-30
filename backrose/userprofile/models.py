from django.db import models, transaction
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    @classmethod
    @transaction.atomic
    def create_with_profile(cls, email, username, password, app_header=None, image=None):
        user = cls.objects.create_user(
            email=email,
            username=username,
            password=password
        )
        
        Profile.objects.create(
            user=user,
            app_header=app_header or "Изменить название",
            image=image
        )
        
        return user

    def __str__(self):
        return self.username


class Profile(models.Model):
    user = models.OneToOneField(User, related_name="profile", on_delete=models.CASCADE)
    app_header = models.CharField(
        max_length=1000, default="Изменить название", blank=True
    )
    image = models.ImageField(upload_to="images/userphoto/", blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.user.username}"
