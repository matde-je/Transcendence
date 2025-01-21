# users/serializers.py
from rest_framework import serializers
from .models import CustomUser, Friendship

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'nickname', 'first_name', 'last_name', 'avatar', 'is_superuser', 'is_staff', 'is_active', 'last_login', 'date_joined']

class FriendshipSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)
    to_user_id = serializers.PrimaryKeyRelatedField(
        write_only=True, 
        queryset=CustomUser.objects.all(), 
        source='to_user'
    )
    class Meta:
        model = Friendship
        fields = ['id', 'from_user', 'to_user', 'to_user_id', 'created_at', 'accepted_at', 'accepted']
        read_only_fields = ['created_at', 'accepted_at', 'accepted']

class UserResultsSerializer(serializers.Serializer):
    total_matches = serializers.IntegerField()
    total_wins = serializers.IntegerField()
    win_percentage = serializers.FloatField()