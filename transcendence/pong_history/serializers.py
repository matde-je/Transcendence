from rest_framework import serializers
from .models import MatchPongHistory

class MatchPongHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchPongHistory
        fields = ['opponent', 'result', 'score', 'date_played']  

