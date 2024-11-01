from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models

class UserProfile(AbstractUser):
    email = models.EmailField(unique=True, blank=False, null=False)
    nickname = models.CharField(max_length=50, unique=True)
    avatar = models.ImageField(upload_to='', default='default_avatar.png')
    online_status = models.BooleanField(default=False)
    friends = models.ManyToManyField('self', through='Friendship', symmetrical=False)
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
    from_user = models.ForeignKey(UserProfile, related_name='from_user', on_delete=models.CASCADE)
    to_user = models.ForeignKey(UserProfile, related_name='to_user', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class MatchHistory(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    opponent = models.ForeignKey(UserProfile, related_name='opponent', on_delete=models.CASCADE)
    match_date = models.DateTimeField(auto_now_add=True)
    result = models.CharField(max_length=10)  # ex: 'win' or 'loss'