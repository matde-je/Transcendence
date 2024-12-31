# tournament/services/matchmaking.py

from ..models import Tournament, TournamentUser, TournamentMatch
from users.models import CustomUser
from django.utils import timezone

def create_knockout_matches(tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        participants = TournamentUser.objects.filter(tournament=tournament, is_accepted=True).order_by('position')
        
        if participants.count() < 2:
            return {'error': 'Insufficient number of participants to start the tournament.'}
        
        # Clear existing matches
        tournament.matches.all().delete()
        
        # Create matches for the first round
        for i in range(0, participants.count(), 2):
            player1 = participants[i].user
            player2 = participants[i+1].user if i+1 < participants.count() else None
            TournamentMatch.objects.create(
                tournament=tournament,
                player1=player1,
                player2=player2,
                started_at=timezone.now()
            )
        
        return {'detail': 'Matchmaking completed successfully.'}
    except Tournament.DoesNotExist:
        return {'error': 'Tournament not found.'}
    except Exception as e:
        return {'error': f'Error when performing matchmaking: {str(e)}'}