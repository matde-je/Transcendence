from django.conf import settings
from django.db import models

class MatchHistory(models.Model):
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='player_matches')
    opponent = models.CharField(max_length=100, null=True, blank=True)
    result = models.CharField(max_length=10)  # Ex: 'win', 'lose', 'draw'
    date_played = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player} vs {self.opponent} on {self.date_played}"

    @staticmethod
    def calculate_win_percentage(player):
        matches = MatchHistory.objects.filter(player=player)
        total_matches = matches.count()
        if total_matches == 0:
            return "0%"

        wins = matches.filter(result='win').count()
        win_percentage = (wins / total_matches) * 100
        return f"{round(win_percentage)}%"

    @staticmethod
    def get_total_matches(player):
        return MatchHistory.objects.filter(player=player).count()

    @staticmethod
    def get_total_wins(player):
        return MatchHistory.objects.filter(player=player, result='win').count()

class WaitingList(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='waiting_list')
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} added on {self.date_added}"