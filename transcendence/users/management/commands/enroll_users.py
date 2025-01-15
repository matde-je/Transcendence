# users/management/commands/enroll_users.py

import os
import django
from django.core.management.base import BaseCommand
from users.models import CustomUser
from tournament.models import Tournament, TournamentUser

class Command(BaseCommand):
    help = 'Enroll all users in all open tournaments.'

    def handle(self, *args, **kwargs):
        setup_django()
        enroll_users_in_open_tournaments()

def setup_django():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')
    django.setup()

def enroll_users_in_open_tournaments():
    # Retrieve all active users excluding the 'root' user
    activeUsers = CustomUser.objects.filter(is_active=True).exclude(username='root')
    
    # Enroll each user in open tournaments
    for user in activeUsers:
        openTournaments = Tournament.objects.filter(is_started=False, is_finished=False)
        for tournament in openTournaments:
            if not TournamentUser.objects.filter(tournament=tournament, user_id=user.id).exists():
                TournamentUser.objects.create(
                    tournament=tournament,
                    user_id=user.id,
                    is_accepted=True
                )
                print(f'User {user.username} enrolled in tournament {tournament.name}.')