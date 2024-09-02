
from django.db import models

class PlayerScore(models.Model):
    player_name = models.CharField(max_length=100)
    score = models.IntegerField()