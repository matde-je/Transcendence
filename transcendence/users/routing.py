from django.urls import re_path
from .consumers import OnlineStatusConsumer

websocket_urlpatterns = [
    re_path(r'ws/online_status/$', OnlineStatusConsumer.as_asgi()),
]
