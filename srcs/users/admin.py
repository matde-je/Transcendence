from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import UserProfile, Friendship, MatchHistory

admin.site.register(UserProfile)
admin.site.register(Friendship)
admin.site.register(MatchHistory)