# users/admin.py
from django.contrib import admin
from .models import CustomUser, Friendship

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_active', 'date_joined')

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'accepted', 'created_at', 'accepted_at')
    search_fields = ('from_user__username', 'to_user__username')
    list_filter = ('accepted', 'created_at', 'accepted_at')
