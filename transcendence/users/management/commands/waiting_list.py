from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rps.models import WaitingList

class Command(BaseCommand):
    help = 'Adds all users to the waiting list'

    def handle(self, *args, **kwargs):
        User = get_user_model()  # Get the custom user model
        users = User.objects.all()
        for user in users:
            if not WaitingList.objects.filter(user=user).exists():
                WaitingList.objects.create(user=user)
                self.stdout.write(self.style.SUCCESS(f'User {user.username} added to the waiting list'))
            else:
                self.stdout.write(self.style.WARNING(f'User {user.username} is already on the waiting list'))
        self.stdout.write(self.style.SUCCESS('All users have been processed'))