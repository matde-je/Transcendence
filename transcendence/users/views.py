# users/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .forms import CustomUserCreationForm
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .serializers import UserSerializer, FriendshipSerializer, UserResultsSerializer
from .models import CustomUser, Friendship
from pong_history.models import MatchPongHistory
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.db import transaction
from django.utils import timezone
from .services.tournament_service import create_tournament_for_user
from pong_history.serializers import MatchPongHistorySerializer

class UserList(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class FriendshipViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        to_user = serializer.validated_data['to_user']
        from_user = request.user

        if from_user == to_user:
            return Response({'detail': 'You cannot send a friend request to yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        friendship, created = Friendship.objects.get_or_create(from_user=from_user, to_user=to_user)
        if not created:
            return Response({'detail': 'Friend request already sent.'}, status=status.HTTP_400_BAD_REQUEST)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        try:
            friendship = self.get_object()
            if friendship.to_user != request.user:
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
            
            if friendship.accepted:
                return Response({'detail': 'Friend request already accepted.'}, status=status.HTTP_400_BAD_REQUEST)
            
            friendship.accepted = True
            friendship.accepted_at = timezone.now()
            friendship.save()

            return Response({'detail': 'Friendship accepted.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': 'An error occurred.', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['delete'])
    def remove(self, request, pk=None):
        friendship = self.get_object()
        if request.user not in [friendship.from_user, friendship.to_user]:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        friendship.remove_friendship()
        return Response({'detail': 'Friendship removed.'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    form = CustomUserCreationForm(request.POST, request.FILES)
    if form.is_valid():
        user = form.save()  #hashing
        login(request, user)
        return JsonResponse({'message': 'User registered successfully!'})
    else:
        return JsonResponse({'errors': form.errors}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password) #prevents sql injection and is hashing
    if user is not None:
        login(request, user)
        return JsonResponse({'message': 'Login successful!', 'redirect_url': '/dashboard'})
    else:
        return JsonResponse({'errors': 'Invalid username or password'}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def check_authentication(request):
    if request.user.is_authenticated:
        return JsonResponse({'is_authenticated': True, 'username': request.user.username})
    else:
        return JsonResponse({'is_authenticated': False})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    logout(request)
    return JsonResponse({'message': 'Logout successful!'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_data(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friend_list(request):
    friendships = Friendship.objects.filter(from_user=request.user, accepted=True)
    friends = [f.to_user for f in friendships]
    serializer = UserSerializer(friends, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def received_requests(request):
    requests = Friendship.objects.filter(to_user=request.user, accepted=False)
    serializer = FriendshipSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sent_requests(request):
    requests = Friendship.objects.filter(from_user=request.user, accepted=False)
    serializer = FriendshipSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_friend(request, user_id):
    friend = CustomUser.objects.get(id=user_id)
    Friendship.objects.filter(
        from_user=request.user, to_user=friend, accepted=True
    ).delete()
    Friendship.objects.filter(
        from_user=friend, to_user=request.user, accepted=True
    ).delete()
    return Response({'detail': 'Friendship removed.'}, status=status.HTTP_204_NO_CONTENT)

"""
Create a new tournament for the authenticated user.
This view handles the creation of a new tournament for the user making the request.
It requires the user to be authenticated.
Args:
	request (Request): The HTTP request object containing the user's information.
Returns:
	Response: A Response object containing the result of the tournament creation.
		- If successful, returns a 201 status with a success message and tournament details.
		- If there is an error in the creation process, returns a 400 status with an error message.
		- If an exception occurs, returns a 500 status with an error message and exception details.
"""
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_tournament(request):
    try:
        result = create_tournament_for_user(request.user.id)
        
        if 'error' in result:
            return Response({'detail': result['error']}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': 'Tournament created successfully!', 'tournament': result}, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'detail': 'An error occurred while creating the tournament.', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_by_id(request, id):
    try:
        user = CustomUser.objects.get(id=id)
    except CustomUser.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = UserSerializer(user)
    return Response(serializer.data)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def user_results(request):
#     user = request.user
#     total_matches = MatchPongHistory.objects.filter(player=user).count()
#     total_wins = MatchPongHistory.objects.filter(player=user, result='win').count()
#     win_percentage = round((total_wins / total_matches * 100), 2) if total_matches > 0 else 0.0

#     data = {
#         'total_matches': total_matches,
#         'total_wins': total_wins,
#         'win_percentage': win_percentage,
#     }

#     serializer = UserResultsSerializer(data)
#     return Response(serializer.data)


  # Import match serializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_results(request):
    user = request.user
    total_matches = MatchPongHistory.objects.filter(player=user).count()
    total_wins = MatchPongHistory.objects.filter(player=user, result='win').count()
    win_percentage = round((total_wins / total_matches * 100), 2) if total_matches > 0 else 0.0

    matches = MatchPongHistory.objects.filter(player=user)
    match_serializer = MatchPongHistorySerializer(matches, many=True)

    data = {
        'total_matches': total_matches,
        'total_wins': total_wins,
        'win_percentage': win_percentage,
        'matches': match_serializer.data,  # Add match history to response
    }
    return Response(data)



