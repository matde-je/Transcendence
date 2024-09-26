from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, 'index.html') 

# def tournament(request):
#     return render(request, 'tournament.html')