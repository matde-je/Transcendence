from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from .forms import RegistrationForm, UserUpdateForm
from .models import UserProfile, Friendship, MatchHistory

# Registration view
def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard')
    else:
        form = RegistrationForm()
    return render(request, 'users/register.html', {'form': form})

# Profile update view
@login_required
def update_profile(request):
    if request.method == 'POST':
        form = UserUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect('users:dashboard')
    else:
        form = UserUpdateForm(instance=request.user)
    return render(request, 'users/update_profile.html', {'form': form})

# Friends list view
@login_required(login_url='/users/login/')
def friends_list(request):
    friends = request.user.friends.all()
    return render(request, 'users/friends_list.html', {'friends': friends})

# Dashboard view
@login_required(login_url='/users/login/')
def dashboard(request):
    return render(request, 'users/dashboard.html')