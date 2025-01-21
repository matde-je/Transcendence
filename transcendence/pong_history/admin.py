# transcendence/pong_history/admin.py

from django.contrib import admin
from .models import MatchPongHistory

@admin.register(MatchPongHistory)
class MatchHistoryAdmin(admin.ModelAdmin):
    list_display = ('player', 'opponent', 'result', 'score', 'date_played')
    search_fields = ('player__username', 'opponent', 'result')
    list_filter = ('result', 'date_played')