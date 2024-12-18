from django.shortcuts import render

# Create your views here.
def spa(request):
    return render(request, 'index.html') 
