# transcendence/transcendence/views.py
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from rps.models import MatchHistory
import json

def index(request):
    return render(request, 'index.html')

@login_required
@require_POST
def register_match(request):
    data = json.loads(request.body)
    result = data.get('result')

    if not result:
        return JsonResponse({'error': 'Invalid data'}, status=400)

    MatchHistory.objects.create(player=request.user, opponent='AI', result=result)

    return JsonResponse({'status': 'success'})

@login_required
@require_POST
def register_multiplayer_match(request):
    data = json.loads(request.body)
    result = data.get('result')
    opponent = data.get('opponent')

    if not result or not opponent:
        return JsonResponse({'error': 'Invalid data'}, status=400)

    MatchHistory.objects.create(player=request.user, opponent='HUMAN', result=result)

    return JsonResponse({'status': 'success'})