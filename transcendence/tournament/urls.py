# tournament/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_tournament, name='create_tournament'),
    path('list/', views.list_open_tournaments, name='list_open_tournaments'),
    path('results/', views.tournament_results, name='tournament_results'),
]
