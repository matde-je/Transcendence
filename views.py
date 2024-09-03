from django.shortcuts import render

def home(request):
    return render(request, 'index.html') 

def tournament(request):
    return render(request, 'tournament.html')

# def registration(request):
#     return render(request, 'registration.html')