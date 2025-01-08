# transcendence/tournament/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TournamentViewSet, 
    TournamentUserViewSet, 
	TournamentMatchViewSet, 
    create_tournament, 
    list_open_tournaments, 
    tournament_results,
    join_tournament, 
    leave_tournament, 
    tournament_participants,
	start_tournament,
	manage_matches,
	update_match,
	start_matchmaking,
	select_winners_and_matchmake,
	finish_tournament
)

router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet, basename='tournament')
router.register(r'tournament-users', TournamentUserViewSet, basename='tournamentuser')
router.register(r'matches', TournamentMatchViewSet, basename='match')

urlpatterns = [
    path('', include(router.urls)),
    path('create/', create_tournament, name='create_tournament'),
    path('list/', list_open_tournaments, name='list_open_tournaments'),
    path('results/', tournament_results, name='tournament_results'),
    path('<int:tournament_id>/join/', join_tournament, name='join_tournament'),
    path('<int:tournament_id>/leave/', leave_tournament, name='leave_tournament'),
    path('<int:tournament_id>/participants/', tournament_participants, name='tournament_participants'),
	path('<int:tournament_id>/start/', start_tournament, name='start_tournament'),
    path('<int:tournament_id>/matches/', manage_matches, name='manage_matches'),
    path('<int:tournament_id>/matches/<int:match_id>/', update_match, name='update_match'),
	path('<int:tournament_id>/matchmaking/start/', start_matchmaking, name='start_matchmaking'),
	path('<int:tournament_id>/select_winners/', select_winners_and_matchmake, name='select_winners_and_matchmake'),
	path('<int:tournament_id>/finish/', finish_tournament, name='finish_tournament'),
]
