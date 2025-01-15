# users/management/commands/create_users.py

from django.core.management.base import BaseCommand
from users.models import CustomUser

class Command(BaseCommand):
    help = 'It automatically creates 32 users in the database.'

    def handle(self, *args, **kwargs):
        for i in range(1, 33):
            username = f'user{i}'
            email = f'user{i}@42.com'
            password = '123'
            nickname = f'Nickname{i}'

            if not CustomUser.objects.filter(username=username).exists():
                CustomUser.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    nickname=nickname
                )
                self.stdout.write(self.style.SUCCESS(f'User created: {username}'))
            else:
                self.stdout.write(self.style.WARNING(f'User already exists: {username}'))
