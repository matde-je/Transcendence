# tournament/views.py

from django.shortcuts import render
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Tournament, TournamentUser, TournamentMatch
from .serializers import TournamentSerializer, TournamentUserSerializer, TournamentMatchSerializer
from users.models import CustomUser
from .services.matchmaking import create_knockout_matches
from rest_framework.decorators import action
from django.utils import timezone
from rest_framework.exceptions import ValidationError

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
def manage_matches(request, tournament_id, match_id=None):
    if request.method == 'GET':
        round_number = request.query_params.get('round', None)
        if round_number is not None:
            try:
                round_number = int(round_number)
            except ValueError:
                return Response({'error': 'Invalid round number.'}, status=status.HTTP_400_BAD_REQUEST)
            matches = TournamentMatch.objects.filter(tournament_id=tournament_id, round=round_number)
        else:
            matches = TournamentMatch.objects.filter(tournament_id=tournament_id)
        serializer = TournamentMatchSerializer(matches, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = TournamentMatchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(tournament_id=tournament_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_match(request, tournament_id, match_id=None):
    if request.method == 'GET':
        try:
            match = TournamentMatch.objects.get(id=match_id, tournament_id=tournament_id)
            serializer = TournamentMatchSerializer(match)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except TournamentMatch.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': 'An unexpected error occurred.', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    elif request.method == 'PATCH':
        if not match_id:
            return Response({'error': 'Match ID is required in the URL.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            match = TournamentMatch.objects.get(id=match_id, tournament_id=tournament_id)
            serializer = TournamentMatchSerializer(match, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except TournamentMatch.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': 'An unexpected error occurred.', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_matchmaking(request, tournament_id):
    result = create_knockout_matches(tournament_id)
    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    return Response({'detail': 'Matchmaking started successfully.'}, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def finish_tournament(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        if tournament.is_finished:
            return Response({'detail': 'This tournament has already concluded.'}, status=status.HTTP_400_BAD_REQUEST)
        
        winner_id = request.data.get('winner_id')
        if not winner_id:
            return Response({'detail': 'Winner ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            winner = CustomUser.objects.get(id=winner_id)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'Winner not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        tournament.winner_id = winner_id
        tournament.is_finished = True
        tournament.finished_on = timezone.now()
        tournament.save(update_fields=['winner_id', 'is_finished', 'finished_on'])
        
        return Response({'detail': 'Tournament completed successfully.'}, status=status.HTTP_200_OK)
        
    except Tournament.DoesNotExist:
        return Response({'detail': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': 'An error occurred while completing the tournament.', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
class TournamentUserViewSet(viewsets.ModelViewSet):
    queryset = TournamentUser.objects.all()
    serializer_class = TournamentUserSerializer
    permission_classes = [IsAuthenticated]

class TournamentMatchViewSet(viewsets.ModelViewSet):
    queryset = TournamentMatch.objects.all()
    serializer_class = TournamentMatchSerializer
    permission_classes = [IsAuthenticated]
