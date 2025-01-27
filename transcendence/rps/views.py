# rps/views.py

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from rps.models import MatchHistory, WaitingList
import json, random
from django.contrib.auth.models import User



@login_required
@require_POST
def register_match(request):
    data = json.loads(request.body)
    result = data.get('result')
    opponent = data.get('opponent')

    if not result or not opponent:
        return JsonResponse({'error': 'Invalid data'}, status=400)

    MatchHistory.objects.create(player=request.user, opponent=opponent, result=result)

    return JsonResponse({'status': 'success'})

@login_required
@require_POST
def get_waiting_list(request):
    users = WaitingList.objects.select_related('user').all()
    user_list = [{'username': user.user.username} for user in users]
    is_in_list = WaitingList.objects.filter(user=request.user).exists()
    waiting_list_count = users.count()
    return JsonResponse({'users': user_list, 'is_in_waiting_list': is_in_list, 'waiting_list_count': waiting_list_count})

@login_required
@require_POST
def add_to_waiting_list(request):
    user = request.user
    if not WaitingList.objects.filter(user=user).exists():
        WaitingList.objects.create(user=user)
    return JsonResponse({'status': 'added'})


@login_required
@require_POST
def remove_from_waiting_list(request):
    user = request.user
    if WaitingList.objects.filter(user=user).exists():
        WaitingList.objects.filter(user=user).delete()
        return JsonResponse({'status': 'removed'})
    else:
        return JsonResponse({'error': 'User not in waiting list'}, status=400)

@login_required
@require_POST
def find_match(request):
    user = request.user
    user_matches = MatchHistory.objects.filter(player=user)
    user_wins = user_matches.filter(result='win').count()
    user_total = user_matches.count()
    user_win_percentage = (user_wins / user_total) * 100 if user_total > 0 else 0

    closest_opponent = None
    smallest_difference = float('inf')

    for waiting_user in WaitingList.objects.exclude(user=user):
        opponent_matches = MatchHistory.objects.filter(player=waiting_user.user)
        opponent_wins = opponent_matches.filter(result='win').count()
        opponent_total = opponent_matches.count()
        opponent_win_percentage = (opponent_wins / opponent_total) * 100 if opponent_total > 0 else 0

        difference = abs(user_win_percentage - opponent_win_percentage)
        if difference < smallest_difference:
            smallest_difference = difference
            closest_opponent = waiting_user.user

    if closest_opponent:
        request.session['opponent'] = closest_opponent.username
        return JsonResponse({'opponent': closest_opponent.username})
    else:
        return JsonResponse({'error': 'No suitable match found'}, status=404)

@login_required
def get_rps_results(request):
    user = request.user
    user_matches = MatchHistory.objects.filter(player=user)
    user_wins = user_matches.filter(result='win').count()
    user_losses = user_matches.filter(result='lose').count()
    user_total = user_matches.count()
    user_win_percentage = int((user_wins / user_total) * 100) if user_total > 0 else 0

    return JsonResponse({
        'total_games': user_total,
        'wins': user_wins,
        'losses': user_losses,
        'win_percentage': user_win_percentage
    })
    

@login_required
def is_user_in_waiting_list(request):
    user = request.user
    is_in_list = WaitingList.objects.filter(user=user).exists()
    waiting_list_count = WaitingList.objects.count()
    return JsonResponse({'is_in_waiting_list': is_in_list, 'waiting_list_count': waiting_list_count})
