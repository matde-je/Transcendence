# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models, transaction
from django.utils import timezone
from django.contrib import admin

class CustomUser(AbstractUser):
    nickname = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True, blank=False, null=False)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, default='images/default.png')
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    is_online = models.BooleanField(default=False)
    def __str__(self):
        return self.username

class Friendship(models.Model):
    from_user = models.ForeignKey(CustomUser, related_name='friendship_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(CustomUser, related_name='friendship_requests_received', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    accepted = models.BooleanField(default=False)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        status = "Accepted" if self.accepted else "Pending"
        return f"{self.from_user} -> {self.to_user} ({status})"

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if self.pk:
                previous = Friendship.objects.get(pk=self.pk)
                if not previous.accepted and self.accepted:
                    self.accepted_at = timezone.now()
                    self.from_user.friends.add(self.to_user)
                    self.to_user.friends.add(self.from_user)
                    Friendship.objects.get_or_create(
                        from_user=self.to_user,
                        to_user=self.from_user,
                        defaults={
                            'accepted': True,
                            'accepted_at': self.accepted_at,
                        }
                    )
            super(Friendship, self).save(*args, **kwargs)

    def remove_friendship(self):
        with transaction.atomic():
            Friendship.objects.filter(from_user=self.from_user, to_user=self.to_user).delete()
            Friendship.objects.filter(from_user=self.to_user, to_user=self.from_user).delete()

#NUNO
class GameInvite(models.Model):  # Ensure correct capitalization
    sender = models.ForeignKey("CustomUser", on_delete=models.CASCADE, related_name="sent_invites")
    receiver = models.ForeignKey("CustomUser", on_delete=models.CASCADE, related_name="received_invites")
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("accepted", "Accepted"), ("declined", "Declined")])
    created_at = models.DateTimeField(auto_now_add=True)
#NUNO\

