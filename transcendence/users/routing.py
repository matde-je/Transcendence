from django.urls import path, re_path
from .consumers import OnlineUsersConsumer, AlertConsumer, GameConsumer

websocket_urlpatterns = [
    path("ws/online_status/", OnlineUsersConsumer.as_asgi()),
    path('ws/alerts/', AlertConsumer.as_asgi()),
	re_path(r'ws/game/$', GameConsumer.as_asgi()),
]

