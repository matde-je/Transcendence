# transcendence/tournament/serializers.py

from rest_framework import serializers
from .models import Tournament, TournamentUser, TournamentMatch
from users.models import CustomUser

class TournamentSerializer(serializers.ModelSerializer):
    creator_username = serializers.SerializerMethodField()
    winner_username = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = '__all__'
        
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
        fields = '__all__'
        
    def get_username(self, obj):
        try:
            user = CustomUser.objects.get(id=obj.user_id)
            return user.username
        except CustomUser.DoesNotExist:
            return 'Unknown'
        
class TournamentMatchSerializer(serializers.ModelSerializer):
    player1_username = serializers.SerializerMethodField()
    player2_username = serializers.SerializerMethodField()
    winner_username = serializers.SerializerMethodField()
    
    class Meta:
        model = TournamentMatch
        fields = ['id', 'tournament', 'player1', 'player2', 'round', 'winner', 'started_at', 'completed', 'player1_username', 'player2_username', 'winner_username']
        
    def get_player1_username(self, obj):
        try:
            user = CustomUser.objects.get(id=obj.player1)
            return user.username
        except CustomUser.DoesNotExist:
            return 'Unknown Player'

    def get_player2_username(self, obj):
        try:
            user = CustomUser.objects.get(id=obj.player2)
            return user.username
        except CustomUser.DoesNotExist:
            return 'Unknown Player'

    def get_winner_username(self, obj):
        if obj.winner is not None:
            try:
                user = CustomUser.objects.get(id=obj.winner)
                return user.username
            except CustomUser.DoesNotExist:
                return 'Unknown Winner'
        return None