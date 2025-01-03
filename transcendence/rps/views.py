from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import MatchHistory
import json

@login_required
@require_POST
def register_match(request):
    data = json.loads(request.body)
    result = data.get('result')

    if not result:
        return JsonResponse({'error': 'Invalid data'}, status=400)

    # Como o oponente é o computador, não há necessidade de buscar um usuário real
    MatchHistory.objects.create(player=request.user, opponent=None, result=result)

    return JsonResponse({'status': 'success'})
