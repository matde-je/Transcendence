from rest_framework import serializers
from .models import MatchHistory


#serializer is responsible for transforming a queryset (or a single model instance) into a format that can be returned as a response, JSON
class MatchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchHistory
        fields = ['player', 'opponent', 'result', 'date_played']
