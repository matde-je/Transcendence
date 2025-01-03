# transcendence/tournament/serializers.py

from rest_framework import serializers
from .models import Tournament, TournamentUser
from users.models import CustomUser

class TournamentSerializer(serializers.ModelSerializer):
    creator_username = serializers.SerializerMethodField()
    winner_username = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = ['id', 'name', 'created_on', 'creator_id', 'creator_username', 'winner_id', 'winner_username', 'is_started', 'is_finished']
        read_only_fields = ['id', 'created_on', 'creator_id', 'winner_id', 'is_started', 'is_finished']

    def get_creator_username(self, obj):
        try:
            user = CustomUser.objects.get(id=obj.creator_id)
            return user.username
        except CustomUser.DoesNotExist:
            return 'Unknown Creator'
    
    def get_winner_username(self, obj):
        try:
            user = CustomUser.objects.get(id=obj.winner_id)
            return user.username
        except CustomUser.DoesNotExist:
            return 'Unknown Winner'
        
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