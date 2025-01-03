from .models import MatchHistory

def register_match(player, opponent, result):
    MatchHistory.objects.create(player=player, opponent=opponent, result=result)