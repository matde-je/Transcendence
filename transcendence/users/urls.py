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
    register_user
)

router = DefaultRouter()
router.register(r'friendships', FriendshipViewSet, basename='friendship')

urlpatterns = [
    path('api/users/', UserList.as_view()),
    path('api/user/', get_user_data),
    path('api/user/update/', update_user_data),
    path('api/friends/', friend_list),
    path('api/friend_requests/received/', received_requests),
    path('api/friend_requests/sent/', sent_requests),
    path('api/friends/<int:user_id>/remove/', remove_friend),
    path('api/', include(router.urls)),
    path('register/', register_user, name='register'),
    path('check-auth/', check_authentication),
    path('login/', login_user),
    path('logout/', logout_user),
]