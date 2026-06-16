from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser):
    """
    Custom user model. Inheriting from AbstractUser gives us all standard
    Django fields (username, email, password, etc.) while allowing us to
    extend freely later (e.g. phone number, profile picture).

    Always define AUTH_USER_MODEL = 'users.User' in settings BEFORE
    the first migration — changing it later is a painful migration nightmare.
    """

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["email"]),
        ]

    def __str__(self) -> str:
        return f"{self.username} <{self.email}>"