from django.urls import path
from . import views

urlpatterns = [
    path('', views.spa, name='spa'),
    path('tournament/', views.spa, name='spa')
    # Add other URL patterns for your app here
]
