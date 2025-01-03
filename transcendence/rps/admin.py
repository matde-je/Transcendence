from django.contrib import admin
from .models import MatchHistory

@admin.register(MatchHistory)
class MatchHistoryAdmin(admin.ModelAdmin):
    list_display = ('player', 'opponent', 'result', 'date_played')
    search_fields = ('player__username', 'opponent', 'result')
    list_filter = ('result', 'date_played')
