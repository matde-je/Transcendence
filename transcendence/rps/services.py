from .models import MatchHistory

def register_match(player, opponent, result):
    MatchHistory.objects.create(player=player, opponent=opponent, result=result)

def get_waiting_list(player):
    return MatchHistory.objects.filter(player=player).values('opponent', 'result')