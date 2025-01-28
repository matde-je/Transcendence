import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rps.models import MatchHistory

class Command(BaseCommand):
    help = 'Randomly assigns win percentages to users'

    def handle(self, *args, **kwargs):
        User = get_user_model()  # Get the custom user model
        users = User.objects.all()
        for user in users:
            # Generate a random win percentage between 0 and 100
            win_percentage = random.randint(0, 100)
            
            # Calculate the number of wins and losses based on the percentage
            total_matches = random.randint(1, 100)  # Random total number of matches
            wins = int((win_percentage / 100) * total_matches)
            losses = total_matches - wins
            
            # Create match history records
            for _ in range(wins):
                MatchHistory.objects.create(player=user, result='win')
            for _ in range(losses):
                MatchHistory.objects.create(player=user, result='lose')
            
            self.stdout.write(self.style.SUCCESS(f'User {user.username} received {win_percentage}% wins'))
        self.stdout.write(self.style.SUCCESS('Win percentages assigned to all users'))