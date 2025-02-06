from django.core.management.base import BaseCommand
from users.models import CustomUser, Friendship
from django.utils import timezone

class Command(BaseCommand):
    help = 'Create and accept friend requests between all users.'

    def handle(self, *args, **kwargs):
        users = CustomUser.objects.all()
        for from_user in users:
            for to_user in users:
                if from_user != to_user:
                    friendship, created = Friendship.objects.get_or_create(from_user=from_user, to_user=to_user)
                    if created:
                        self.stdout.write(self.style.SUCCESS(f'Friend request sent from {from_user} to {to_user}'))
                    if not friendship.accepted:
                        friendship.accepted = True
                        friendship.accepted_at = timezone.now()
                        friendship.save()
                        self.stdout.write(self.style.SUCCESS(f'Friend request accepted between {from_user} and {to_user}'))