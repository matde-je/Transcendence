# transcendence/pong_history/services.py

from .models import MatchPongHistory

def register_pong_history(player, opponent, result):
    MatchPongHistory.objects.create(player=player, opponent=opponent, result=result)
