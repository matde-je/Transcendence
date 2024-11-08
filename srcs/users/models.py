from django.db import models, transaction

# Create your models here.
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class UserProfile(AbstractUser):
    email = models.EmailField(unique=True, blank=False, null=False)
    nickname = models.CharField(max_length=50, unique=True)
    avatar = models.ImageField(upload_to='', default='default_avatar.png')
    online_status = models.BooleanField(default=False)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='userprofile_set',
        blank=True,
        help_text=('The groups this user belongs to. A user will get all permissions '
                   'granted to each of their groups.'),
        verbose_name=('groups'),
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='userprofile_set',
        blank=True,
        help_text=('Specific permissions for this user.'),
        verbose_name=('user permissions'),
    )

class Friendship(models.Model):
    from_user = models.ForeignKey(UserProfile, related_name='friendship_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(UserProfile, related_name='friendship_requests_received', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='friend_requests_made', on_delete=models.CASCADE, null=True, blank=True)
    accepted_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='friend_requests_accepted', on_delete=models.SET_NULL, null=True, blank=True)
    accepted = models.BooleanField(default=False)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        status = "Accepted" if self.accepted else "Pending"
        return f"{self.from_user} -> {self.to_user} ({status})"

    def save(self, *args, **kwargs):
        with transaction.atomic():
            # Checks if the instance already exists in the database
            if self.pk:
                # Get the previous state of the instance
                previous = Friendship.objects.get(pk=self.pk)
                # If friendship was not accepted before and now it is accepted
                if not previous.accepted and self.accepted:
                    # Set the date and time of acceptance and who accepted the request
                    self.accepted_at = timezone.now()
                    self.accepted_by = self.to_user
                    # Add users to each other's friend lists
                    Friendship.objects.get_or_create(from_user=self.to_user, to_user=self.from_user, defaults={
                            'accepted': True,
                            'accepted_at': self.accepted_at,
                            'accepted_by': self.to_user,
                            'requested_by': self.requested_by,
                        }
                    )
            else:
                # Define who sent the requestsss
                self.requested_by = self.from_user
            super(Friendship, self).save(*args, **kwargs)
    
    def remove_friendship(self):
        with transaction.atomic():
            # Remove friendship relationship
            Friendship.objects.filter(from_user=self.from_user, to_user=self.to_user).delete()
            Friendship.objects.filter(from_user=self.to_user, to_user=self.from_user).delete()
            # Remove from UserProfile's friend list
            self.from_user.friends.remove(self.to_user)
            self.to_user.friends.remove(self.from_user)


class MatchHistory(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    opponent = models.ForeignKey(UserProfile, related_name='opponent', on_delete=models.CASCADE)
    match_date = models.DateTimeField(auto_now_add=True)
    result = models.CharField(max_length=10)  # ex: 'win' or 'loss'