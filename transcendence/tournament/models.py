# tournament/models.py

from django.db import models
from django.utils import timezone
from users.models import CustomUser

class Tournament(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, default="Pong42 Tournament")
    created_on = models.DateTimeField(default=timezone.now)
    # Stores only the user ID
    creator_id = models.IntegerField(null=True)
    # Stores only the winner's user ID
    winner_id = models.IntegerField(null=True, blank=True)
    is_started = models.BooleanField(default=False)
    is_finished = models.BooleanField(default=False)
    finished_on = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.name} (created by {CustomUser.objects.get(id=self.creator_id).username})'

class TournamentUser(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='tournamentUsers')
    user_id = models.IntegerField()
    is_accepted = models.BooleanField(default=False)
    is_canceled = models.BooleanField(default=False)
    is_refused = models.BooleanField(default=False)

    def __str__(self):
        if self.tournament:
            return f'Tournament User ID {self.user_id} in Tournament #{self.tournament.id}'
        else:
            return f'Tournament User ID {self.user_id} without a Tournament'
        
class TournamentMatch(models.Model):
    class Meta:
        verbose_name = 'Tournament Match'
        verbose_name_plural = 'Tournament Matches'
        
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    player1 = models.IntegerField()
    player2 = models.IntegerField()
    round = models.IntegerField(default=0)
    winner = models.IntegerField(null=True, blank=True)
    started_at = models.DateTimeField()
    completed = models.BooleanField(default=False)
    completed_on = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.player1} vs {self.player2} - Winner: {self.winner}'