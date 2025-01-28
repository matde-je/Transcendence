from django.urls import path
from .consumers import OnlineUsersConsumer

websocket_urlpatterns = [
    path("ws/online_status/", OnlineUsersConsumer.as_asgi()),
]
