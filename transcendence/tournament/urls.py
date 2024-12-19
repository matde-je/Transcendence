# tournament/urls.py

from django.urls import path
from .views import TournamentCreate, TournamentMatches, TournamentFinish

urlpatterns = [
    path('create/', TournamentCreate.as_view(), name='tournament_create'),
    path('<int:tournamentId>/matches/', TournamentMatches.as_view(), name='tournament_matches'),
    path('<int:tournamentId>/finish/', TournamentFinish.as_view(), name='tournament_finish'),
]
