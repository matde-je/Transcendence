# transcendence/tournament/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TournamentViewSet, 
    TournamentUserViewSet, 
    create_tournament, 
    list_open_tournaments, 
    tournament_results,
    join_tournament, 
    leave_tournament, 
    tournament_participants,
	start_tournament,
	manage_matches,
	start_matchmaking
)

router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet, basename='tournament')
router.register(r'tournament-users', TournamentUserViewSet, basename='tournamentuser')

urlpatterns = [
    path('', include(router.urls)),
    path('create/', create_tournament, name='create_tournament'),
    path('list/', list_open_tournaments, name='list_open_tournaments'),
    path('results/', tournament_results, name='tournament_results'),
    path('tournaments/<int:tournament_id>/join/', join_tournament, name='join_tournament'),
    path('tournaments/<int:tournament_id>/leave/', leave_tournament, name='leave_tournament'),
    path('tournaments/<int:tournament_id>/participants/', tournament_participants, name='tournament_participants'),
	path('tournaments/<int:tournament_id>/start/', start_tournament, name='start_tournament'),
    path('tournaments/<int:tournament_id>/matches/', manage_matches, name='manage_matches'),
	path('tournaments/<int:tournament_id>/matchmaking/start/', start_matchmaking, name='start_matchmaking'),

]
