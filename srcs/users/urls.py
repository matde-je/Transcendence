from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.register, name='register'),
	path('dashboard/', views.dashboard, name='dashboard'),
    path('update/', views.update_profile, name='update_profile'),
    path('friends/', views.friends_list, name='friends_list'),
]