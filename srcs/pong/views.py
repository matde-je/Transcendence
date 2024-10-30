from django.shortcuts import render

# Create your views here.
def spa(request):
    return render(request, 'index.html') 

# def tournament(request):
#     return render(request, 'tournament.html')