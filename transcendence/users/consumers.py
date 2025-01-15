from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async

class OnlineUsersConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"] #Django's authentication system 
        if user.is_authenticated:
            await self.set_online(user)
            await self.channel_layer.group_add("online_users", self.channel_name)
            await self.accept()
        else
            await self.close()

    async def disconnect(self, close_code): #standard parameter provided by Django Channels
        if self.scope["user"].is_authenticated:
            await self.set_ofline(user)
            await self.channel_layer.group_discard("online_users", self.channel_name)

    async def send_online_users(self, event):
        online_users = event["users"]
        await self.send(text.data=json.dumps({"online_users": online_users}))
    
    @sync_to_async #run synchronous functions inside asynchronous code (web socket)
    def set_online(self, user):
        user.is_online = True #custom field
        user.save()
    
    @sync_to_async
    def set_ofline(self, user):
        user.is_online = False #custom field
        user.save()



