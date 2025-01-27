from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
import logging
logger = logging.getLogger(__name__)

class OnlineUsersConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from django.contrib.auth.models import User
        user = self.scope["user"] #Django's authentication system 
        logger.info(f"User: {user}")  
        if user.is_authenticated:
            await self.set_online(user)
            await self.channel_layer.group_add("online_friends", self.channel_name)
            await self.accept()
            online_friends = await self.get_online_friends(user)
            await self.send_online_friends(online_friends)
            await self.channel_layer.group_send(
                "online_friends", {
                    "type": "send_online_friends",
                    "online_friends": online_friends
                }
            )
        else:
            logger.info("User is not authenticated.")
            await self.close()

    async def disconnect(self, close_code): #standard parameter provided by Django Channels
        user = self.scope["user"]
        if user.is_authenticated:
            await self.set_offline(user)
            await self.channel_layer.group_discard("online_friends", self.channel_name)
            online_friends = await self.get_online_friends(user)
            await self.send_online_friends(online_friends)
            await self.channel_layer.group_send(
                "online_friends", {
                    "type": "send_online_friends",
                    "online_friends": online_friends
                }
            )

    async def send_online_friends(self, online_friends):
        logger.info(f"Sending online friends: {online_friends}")
        await self.send(text_data=json.dumps({
            "online_friends": online_friends
    }))

    @sync_to_async #run synchronous functions inside asynchronous code (web socket)
    def set_online(self, user):
        user.is_online = True #custom field
        logger.info(f"User {user.username} is now online")
        user.save()
    
    @sync_to_async
    def set_offline(self, user):
        user.is_online = False #custom field
        logger.info(f"User {user.username} is now offline")
        user.save()

    @sync_to_async
    def get_online_friends(self, user):
        online_friends = user.friends.filter(is_online=True)  # Fetch online friends
        return [friend.username for friend in online_friends] 
