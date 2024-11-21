from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import (
	MyViewSet,
    register_user,
    activate_user,
    dashboard,
    update_profile,
    change_password,
    invite_friend,
    accept_friend,
    friends_list,
    remove_friend,
)

app_name = 'users'

router = DefaultRouter()
router.register(r'myview', MyViewSet, basename='myview')

urlpatterns = [
    # Rotas de API usando FBV
    path('register/', register_user, name='register'),
    path('activate/<uidb64>/<token>/', activate_user, name='activate'),
    path('dashboard/', dashboard, name='dashboard'),
    path('update/', update_profile, name='update_profile'),
    path('change_password/', change_password, name='change_password'),
    path('add_friend/<int:user_id>/', invite_friend, name='add_friend'),
    path('accept_friend/<int:friendship_id>/', accept_friend, name='accept_friend'),
    path('friends/', friends_list, name='friends_list'),
    path('remove_friend/<int:user_id>/', remove_friend, name='remove_friend'),    # Rotas do roteador
    path('api/', include(router.urls)),
]
