from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('activate/<uidb64>/<token>/', views.activate, name='activate'),
    path('register/', views.register, name='register'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('update/', views.update_profile, name='update_profile'),
	path('change_password/', views.change_password, name='change_password'),
    path('friends/', views.friends_list, name='friends_list'),
]