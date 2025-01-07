# tournament/admin.py

from django.contrib import admin
from .models import Tournament, TournamentUser, TournamentMatch
from users.models import CustomUser

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'get_creator_username', 'get_winner_username', 'is_started', 'is_finished', 'created_on', 'finished_on')

    def get_creator_username(self, obj):
        try:
            user = CustomUser.objects.get(id=obj.creator_id)
            return user.username
        except CustomUser.DoesNotExist:
            return 'Unknown Creator'
    get_creator_username.short_description = 'Creator'

    def get_winner_username(self, obj):
        try:
            user = CustomUser.objects.get(id=obj.winner_id)
            return user.username
        except CustomUser.DoesNotExist:
            return 'Unknown Winner'
    get_winner_username.short_description = 'Winner'

@admin.register(TournamentUser)
class TournamentUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'tournament', 'get_username', 'is_accepted', 'is_canceled', 'is_refused', 'position')

    def get_username(self, obj):
        try:
            user = CustomUser.objects.get(id=obj.user_id)
            return user.username
        except CustomUser.DoesNotExist:
            return 'Unknown User'
    get_username.short_description = 'User Name'
    
@admin.register(TournamentMatch)
class TournamentMatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'tournament', 'get_player1_name', 'get_player2_name', 'round', 'winner', 'started_at', 'completed')
    list_filter = ('tournament', 'completed')
    search_fields = ('tournament__name', 'get_player1_name', 'get_player2_name', 'round', 'winner')
    
    def get_player1_name(self, obj):
        try:
            player1 = CustomUser.objects.get(id=obj.player1)
            return player1.username
        except CustomUser.DoesNotExist:
            return 'Unknown Player1'
    get_player1_name.short_description = 'Player 1 Name'
    
    def get_player2_name(self, obj):
        try:
            player2 = CustomUser.objects.get(id=obj.player2)
            return player2.username
        except CustomUser.DoesNotExist:
            return 'Unknown Player2'
    get_player2_name.short_description = 'Player 2 Name'