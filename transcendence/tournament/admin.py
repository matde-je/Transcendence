# tournament/admin.py

from django.contrib import admin
from .models import Tournament, TournamentUser
from users.models import CustomUser

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_creator_username', 'get_winner_username', 'is_started', 'is_finished', 'created_on')

    def get_creator_username(self, obj):
        try:
            user = CustomUser.objects.get(id=obj.creator_id)
            return user.username
        except CustomUser.DoesNotExist:
            return 'Unknown'
    get_creator_username.short_description = 'Creator'

    def get_winner_username(self, obj):
        try:
            user = CustomUser.objects.get(id=obj.winner_id)
            return user.username
        except CustomUser.DoesNotExist:
            return 'Unknown'
    get_winner_username.short_description = 'Winner'

@admin.register(TournamentUser)
class TournamentUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'tournament', 'user_id', 'is_accepted', 'is_canceled', 'is_refused', 'position')