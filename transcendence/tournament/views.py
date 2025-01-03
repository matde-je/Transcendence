# tournament/views.py

from django.shortcuts import render
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Tournament, TournamentUser
from .serializers import TournamentSerializer, TournamentUserSerializer
from users.models import CustomUser

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_tournament(request):
    serializer = TournamentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(creator_id=request.user.id)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_open_tournaments(request):
    tournaments = Tournament.objects.filter(is_started=False, is_finished=False)
    serializer = TournamentSerializer(tournaments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tournament_results(request):
    tournaments = Tournament.objects.filter(is_finished=True)
    serializer = TournamentSerializer(tournaments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_tournament(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        # Checks if the user is already enrolled in the tournament
        if TournamentUser.objects.filter(tournament=tournament, user_id=request.user.id).exists():
            return Response({'detail': 'You are already registered for this tournament.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the value of is_accepted from the request data, default to False
        is_accepted = request.data.get('is_accepted', False)
        
        # Create the TournamentUser object with is_accepted
        TournamentUser.objects.create(
            tournament=tournament,
            user_id=request.user.id,
            is_accepted=is_accepted
        )

        return Response({'detail': 'Successfully added to the tournament!'}, status=status.HTTP_200_OK)
    except Tournament.DoesNotExist:
        return Response({'detail': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': 'Error adding to tournament.', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_tournament(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        TournamentUser.objects.filter(tournament=tournament, user_id=request.user.id).delete()
        return Response({'detail': 'Successfully removed from the tournament!'}, status=status.HTTP_200_OK)
    except Tournament.DoesNotExist:
        return Response({'detail': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': 'Error removing from tournament.', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tournament_participants(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        participants = TournamentUser.objects.filter(tournament=tournament, is_accepted=True)
        serializer = TournamentUserSerializer(participants, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Tournament.DoesNotExist:
        return Response({'detail': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_tournament(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        if tournament.is_started:
            return Response({'detail': 'Tournament already started.'}, status=status.HTTP_400_BAD_REQUEST)

        tournament.is_started = True
        tournament.save(update_fields=['is_started'])
        return Response({'detail': 'Tournament started successfully!'}, status=status.HTTP_200_OK)
    except Tournament.DoesNotExist:
        return Response({'detail': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': 'Error starting tournament.', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_matches(request, tournament_id):
    if request.method == 'GET':
        matches = TournamentMatch.objects.filter(tournament_id=tournament_id)
        serializer = TournamentMatchSerializer(matches, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = TournamentMatchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(tournament_id=tournament_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_matchmaking(request, tournament_id):
    result = create_knockout_matches(tournament_id)
    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    return Response({'detail': 'Matchmaking started successfully.'}, status=status.HTTP_200_OK)

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]

class TournamentUserViewSet(viewsets.ModelViewSet):
    queryset = TournamentUser.objects.all()
    serializer_class = TournamentUserSerializer
    permission_classes = [IsAuthenticated]
