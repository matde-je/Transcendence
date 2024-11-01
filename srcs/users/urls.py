from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.register, name='register'),
    path('activate/<uidb64>/<token>/', views.activate, name='activate'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('update/', views.update_profile, name='update_profile'),
	path('change_password/', views.change_password, name='change_password'),
    path('add_friend/<int:user_id>/', views.invite_friend, name='add_friend'),
    path('accept_friend/<int:friendship_id>/', views.accept_friend, name='accept_friend'),
    path('friends/', views.friends_list, name='friends_list'),
]