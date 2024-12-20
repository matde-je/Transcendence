# transcendence/tournament/serializers.py

from rest_framework import serializers
from .models import Tournament, TournamentUser
from users.models import CustomUser

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'created_on', 'creator_id', 'winner_id', 'is_started', 'is_finished']
        read_only_fields = ['id', 'created_on', 'creator_id', 'winner_id', 'is_started', 'is_finished']
        
class TournamentUserSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = TournamentUser
        fields = ['id', 'tournament', 'user_id', 'username', 'is_accepted', 'is_canceled', 'is_refused', 'position']

    def get_username(self, obj):
        try:
            user = CustomUser.objects.get(id=obj.user_id)
            return user.username
        except CustomUser.DoesNotExist:
            return 'Unknown'