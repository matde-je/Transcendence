# transcendence/rps/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('register_match/', views.register_match, name='register_match'),
]