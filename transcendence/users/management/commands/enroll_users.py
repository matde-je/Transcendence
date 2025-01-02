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
    openTournaments = Tournament.objects.filter(is_started=False, is_finished=False)
    users = CustomUser.objects.all()

    for tournament in openTournaments:
        for user in users:
            # Check if the user is already enrolled in the tournament
            if not TournamentUser.objects.filter(tournament=tournament, user_id=user.id).exists():
                TournamentUser.objects.create(
                    tournament=tournament,
                    user_id=user.id,
                    is_accepted=True
                )
                print(f'User {user.username} enrolled in tournament {tournament.name}.')