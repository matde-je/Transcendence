from django.contrib import admin
from .models import MatchHistory, WaitingList

@admin.register(MatchHistory)
class MatchHistoryAdmin(admin.ModelAdmin):
    list_display = ('player', 'opponent', 'result', 'total_wins', 'total_matches','win_percentage', 'date_played')
    search_fields = ('player__username', 'opponent', 'result')
    list_filter = ('result', 'date_played')

    def win_percentage(self, obj):
        return MatchHistory.calculate_win_percentage(obj.player)

    def total_matches(self, obj):
        return MatchHistory.get_total_matches(obj.player)

    def total_wins(self, obj):
        return MatchHistory.get_total_wins(obj.player)

    total_wins.short_description = 'Total Wins'
    total_matches.short_description = 'Total Matches'
    win_percentage.short_description = 'Win Percentage'

@admin.register(WaitingList)
class WaitingListAdmin(admin.ModelAdmin):
    list_display = ('user', 'date_added')
    search_fields = ('user__username',)
    list_filter = ('date_added',)