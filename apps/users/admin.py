from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

# Register your models here.

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "phone_number", "is_staff", "created_at")
    search_fields = ("username", "email", "phone_number")
    list_filter = ("is_staff", "is_active")
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Additional Info", {"fields": ("phone_number",)}),
    )