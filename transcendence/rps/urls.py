from django.urls import path
from .views import register_match

urlpatterns = [
    path('api/register_match/', register_match, name='register_match'),
    # Outras URLs...
]

