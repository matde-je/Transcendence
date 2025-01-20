# transcendence/pong_history/models.py

from django.db import models
from django.conf import settings

class MatchPongHistory(models.Model):
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pong_player_matches')
    opponent = models.CharField(max_length=100, null=True, blank=True)
    result = models.CharField(max_length=10)
    date_played = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player} vs {self.opponent} on {self.date_played}"
