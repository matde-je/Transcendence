from django.contrib import admin

# Register your models here.
from .models import UserProfile, Friendship, MatchHistory

class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'created_at', 'accepted_at', 'requested_by', 'accepted_by', 'accepted')
    list_filter = ('accepted', 'created_at', 'accepted_at')
    search_fields = ('from_user__username', 'to_user__username', 'requested_by__username', 'accepted_by__username')

admin.site.register(UserProfile)
admin.site.register(Friendship, FriendshipAdmin)
admin.site.register(MatchHistory)
