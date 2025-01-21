# transcendence/rps/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('register_match/', views.register_match, name='register_match'),
        path('waiting-list/', views.get_waiting_list, name='get_waiting_list'),
]