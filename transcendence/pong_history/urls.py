# transcendence/pong_history/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('register_pong_history/', views.register_pong_history, name='register_pong_history'),
]