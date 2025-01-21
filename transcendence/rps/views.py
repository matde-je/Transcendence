# rps/views.py

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from rps.models import MatchHistory, WaitingList
import json

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
    return JsonResponse({'users': user_list})