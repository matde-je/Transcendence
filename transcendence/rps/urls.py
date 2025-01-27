# transcendence/rps/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('register_match/', views.register_match, name='register_match'),
    path('get_waiting_list/', views.get_waiting_list, name='get_waiting_list'),
    path('add-to-waiting-list/', views.add_to_waiting_list, name='add_to_waiting_list'),
    path('remove_from_waiting_list/', views.remove_from_waiting_list, name='remove_from_waiting_list'),
    path('find_match/', views.find_match, name='find_match'),
    path('get_rps_results/', views.get_rps_results, name='get_rps_results'),
    path('is_user_in_waiting_list/', views.is_user_in_waiting_list, name='is_user_in_waiting_list'),
]