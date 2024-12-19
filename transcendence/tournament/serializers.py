# transcendence/tournament/serializers.py

from rest_framework import serializers
from .models import Tournament

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'created_on', 'creator_id', 'winner_id', 'is_started', 'is_finished']
        read_only_fields = ['id', 'created_on', 'creator_id', 'winner_id', 'is_started', 'is_finished']