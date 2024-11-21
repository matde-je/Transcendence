from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.tokens import default_token_generator


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    # Sobrescrevendo o método para garantir que a senha seja armazenada de forma correta (hash)
    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            username=validated_data['username']
        )
        user.set_password(validated_data['password'])
        user.is_active = False  # Usuário deve ativar via e-mail
        user.save()
        return user


@api_view(['POST'])
def register_user(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Enviar email de ativação
            current_site = get_current_site(request)
            subject = 'Activate your account'
            message = render_to_string('users/activation_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': default_token_generator.make_token(user),
            })
            user.email_user(subject, message)
            
            return Response({'message': 'Registration complete. Please check your email to activate your account.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UserProfileSerializer(instance=request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    friends = UserProfileSerializer(request.user.friends.all(), many=True)
    received_requests = FriendshipSerializer(Friendship.objects.filter(to_user=request.user, accepted=False), many=True)
    sent_requests = FriendshipSerializer(Friendship.objects.filter(from_user=request.user, accepted=False), many=True)
    available_users = UserProfileSerializer(UserProfile.objects.exclude(id=request.user.id).exclude(is_superuser=True).exclude(is_active=False), many=True)

    return Response({
        'friends': friends.data,
        'received_requests': received_requests.data,
        'sent_requests': sent_requests.data,
        'available_users': available_users.data,
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_friend(request, user_id):
    to_user = get_object_or_404(UserProfile, id=user_id)
    from_user = request.user
    if from_user != to_user:
        friendship, created = Friendship.objects.get_or_create(from_user=from_user, to_user=to_user, defaults={'accepted': False})
        if created:
            return Response({'message': 'Friend request sent successfully.'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Friend request already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'message': 'Cannot add yourself as a friend.'}, status=status.HTTP_400_BAD_REQUEST)

from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib import messages

@api_view(['GET'])
def activate_user(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({'message': 'Account activated successfully.'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Activation link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    form = PasswordChangeForm(user=request.user, data=request.data)
    if form.is_valid():
        user = form.save()
        update_session_auth_hash(request, user)  # Atualiza a sessão para evitar logout
        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)
    return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


from django.shortcuts import get_object_or_404, redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Friendship, UserProfile

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_friend(request, friendship_id):
    friendship = get_object_or_404(Friendship, id=friendship_id, to_user=request.user)
    
    # Verifique se o pedido de amizade não foi aceito anteriormente
    if not friendship.accepted:
        friendship.accepted = True
        friendship.save()

        # Adiciona ambos usuários à lista de amigos um do outro
        friendship.from_user.friends.add(friendship.to_user)
        friendship.to_user.friends.add(friendship.from_user)

    return Response({'message': 'Friend request accepted.'}, status=status.HTTP_200_OK)


from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import UserProfile

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friends_list(request):
    user = request.user
    friends = UserProfileSerializer(user.friends.all(), many=True)
    return Response({'friends': friends.data}, status=status.HTTP_200_OK)

from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import UserProfile, Friendship

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_friend(request, user_id):
    # Obtém o usuário a ser removido da lista de amigos
    user_to_remove = get_object_or_404(UserProfile, id=user_id)

    # Verifique se o usuário está tentando remover ele mesmo
    if request.user == user_to_remove:
        return Response({'error': 'You cannot remove yourself from your friends list.'}, status=status.HTTP_400_BAD_REQUEST)

    # Remove a amizade em ambas as direções
    request.user.friends.remove(user_to_remove)
    user_to_remove.friends.remove(request.user)

    # Opcionalmente, remova o registro de Friendship, se existir
    Friendship.objects.filter(from_user=request.user, to_user=user_to_remove).delete()
    Friendship.objects.filter(from_user=user_to_remove, to_user=request.user).delete()

    return Response({'message': 'Friend removed successfully.'}, status=status.HTTP_200_OK)


from rest_framework import viewsets
from .models import UserProfile  # Substitua pelo seu modelo
from .serializers import UserProfileSerializer  # Substitua pelo seu serializer

class MyViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

