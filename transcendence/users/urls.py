# users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UserList,
    FriendshipViewSet,
    friend_list,
    received_requests,
    sent_requests,
    remove_friend,
    check_authentication,
    login_user,
    logout_user,
    get_user_data,
    update_user_data,
    register_user,
    get_user_by_id,
	user_results,
    create_invite,
    check_user_invites,
    accept_invite,
    reject_invite,
    cancel_invite,
    get_invite_details
)

router = DefaultRouter()
router.register(r'friendships', FriendshipViewSet, basename='friendship')

urlpatterns = [
    path('', include(router.urls)),
    path('users/', UserList.as_view()),
    path('user/', get_user_data),
    path('user/<int:id>/', get_user_by_id, name='get_user_by_id'),
    path('user/update/', update_user_data),
    path('friends/', friend_list),
    path('friend_requests/received/', received_requests),
    path('friend_requests/sent/', sent_requests),
    path('friends/<int:user_id>/remove/', remove_friend),
    path('register/', register_user, name='register'),
    path('check-auth/', check_authentication),
    path('login/', login_user),
    path('logout/', logout_user),
	path('results/', user_results, name='user-results'),
    path('create_invite/', create_invite, name='create_invite'),
    path('user/<int:user_id>/invites/', check_user_invites, name='check_user_invites'), 
    path('invite/<int:invite_id>/accept/', accept_invite, name='accept_invite'),
    path('invite/<int:invite_id>/reject/', reject_invite, name='reject_invite'),
    path('invite/<int:invite_id>/cancel/', cancel_invite, name='cancel_invite'),
    path('invite/<int:invite_id>/details/', get_invite_details, name='get_invite_details'),

]