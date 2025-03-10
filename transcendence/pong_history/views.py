# transcendence/pong_history/views.py

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import MatchPongHistory
import json

def register_pong_history(request):
    data = json.loads(request.body)
    result = data.get('result')
    opponent = data.get('opponent')
    score = data.get('score')
    date_played = data.get('date')

    if not result:
        return JsonResponse({'error': 'Invalid data'}, status=400)

    MatchPongHistory.objects.create(player=request.user, opponent=opponent, result=result, score=score)

    return JsonResponse({'status': 'success'})
