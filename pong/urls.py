from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('tournament/', views.tournament, name='tournament')
    # Add other URL patterns for your app here
]
