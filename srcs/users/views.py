from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from .forms import RegistrationForm, UserUpdateForm
from .models import UserProfile, Friendship, MatchHistory
from .forms import UserUpdateForm, CustomPasswordChangeForm
from django.contrib.auth import update_session_auth_hash

# Email confirmation
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.tokens import default_token_generator

# User activation
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth import get_user_model

# User Registration view
def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()

            current_site = get_current_site(request)
            subject = 'Activate your account'
            message = render_to_string('users/activation_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': default_token_generator.make_token(user),
            })
            user.email_user(subject, message)

            return render(request, 'users/registration_complete.html')

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
@login_required
def dashboard(request):
    # Amigos e solicitações de amizade
    friends = UserProfile.objects.filter(friendship_requests_received__from_user=request.user, friendship_requests_received__accepted=True)
    received_requests = Friendship.objects.filter(to_user=request.user, accepted=False)
    sent_requests = Friendship.objects.filter(from_user=request.user, accepted=False)
    
    # Filtra os usuários disponíveis para adicionar como amigos, excluindo o usuário atual
    available_users = UserProfile.objects.exclude(id=request.user.id)
    
    return render(request, 'users/dashboard.html', {
        'friends': friends,
        'received_requests': received_requests,
        'sent_requests': sent_requests,
        'available_users': available_users,
    })

# Email confirmation views
def activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = get_user_model().objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, UserProfile.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return render(request, 'users/activation_successful.html')
    else:
        return render(request, 'users/activation_invalid.html')

# Password change view
@login_required
def change_password(request):
    if request.method == 'POST':
        form = CustomPasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            user = form.save()
            # Keeps the user logged in after changing the password
            update_session_auth_hash(request, user)
            return redirect('users:dashboard')
    else:
        form = CustomPasswordChangeForm(user=request.user)
    return render(request, 'users/change_password.html', {'form': form})

# Invite a friend view
@login_required
def invite_friend(request, user_id):
    to_user = get_object_or_404(UserProfile, id=user_id)
    from_user = request.user
    if from_user != to_user:
        # Create a friend request if it doesn't already exist
        friendship, created = Friendship.objects.get_or_create(from_user=from_user, to_user=to_user)
        if not created:
            # Update the request if it already exists (but not accepted)
            friendship.accepted = False
            friendship.save()
    return redirect('users:friends_list')

# Accept friend view
@login_required
def accept_friend(request, friendship_id):
    friendship = get_object_or_404(Friendship, id=friendship_id, to_user=request.user)
    if friendship:
        # Update acceptance status
        friendship.accepted = True
        friendship.save()
    return redirect('users:friends_list')

# Friend list view
@login_required
def friends_list(request):
    # Friends accepted
    friends = UserProfile.objects.filter(friendship_requests_received__from_user=request.user, friendship_requests_received__accepted=True)
    # Pending requests sent and received
    received_requests = Friendship.objects.filter(to_user=request.user, accepted=False)
    sent_requests = Friendship.objects.filter(from_user=request.user, accepted=False)
    return render(request, 'users/friends_list.html', {
        'friends': friends,
        'received_requests': received_requests,
        'sent_requests': sent_requests,
    })
