from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
import logging
logger = logging.getLogger(__name__)
from django.db.models import Q
from django.apps import apps 

class OnlineUsersConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from django.contrib.auth.models import User
        user = self.scope["user"] #Django's authentication system 
        if user.is_authenticated:
            await self.set_online(user)
            await self.channel_layer.group_add("online_friends", self.channel_name)
            await self.accept()
            await self.channel_layer.group_send(
                "online_friends", {
                    "type": "send_online_friends",
                }
            )
            # await self.notify_friends(user)
        else:
            await self.close()

    async def disconnect(self, close_code): #standard parameter provided by Django Channels
        user = self.scope["user"]
        if user.is_authenticated:
            logger.info(f"Disconnecting user: {user.username}")
            await self.set_offline(user)
            await self.channel_layer.group_discard("online_friends", self.channel_name)
            await self.channel_layer.group_send(
                "online_friends", {
                    "type": "send_online_friends",
                }
            )
            # await self.notify_friends(user)

    async def send_online_friends(self, event):
        user = self.scope["user"]
        if not user.is_authenticated:
            return
        online_friends = await self.get_online_friends(user)
        logger.info(f"Sending online friends list: {online_friends}")
        await self.send(text_data=json.dumps({
            # "online_friends": event["online_friends"]
            "online_friends": online_friends
        }))

    async def receive(self, text_data):
        """Handle messages from the WebSocket."""
        user = self.scope["user"]
        # if not user.is_authenticated:
        #     return
        data = json.loads(text_data)
        # If the user sends a logout event
        if data.get("type") == "logout":
            logger.info(f"User {user.username} is logging out via WebSocket")
            await self.set_offline(user)  # Set user as offline
            await self.channel_layer.group_discard("online_friends", self.channel_name)
            await self.channel_layer.group_send(
                "online_friends", {
                    "type": "send_online_friends",
                }
            )

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
        Friendship = apps.get_model('users', 'Friendship')
        friendships = Friendship.objects.filter(
            Q(from_user=user, accepted=True) | Q(to_user=user, accepted=True)
            )  
        friends = []
        for friendship in friendships:
            if friendship.from_user == user:
                friends.append(friendship.to_user)
            else:
                friends.append(friendship.from_user)
        online_friends = [friend for friend in friends if friend.is_online]
        serialized_friends = [
            {
                "id": friend.id,
                "username": friend.username,
                "is_online": friend.is_online
            }
            for friend in online_friends
        ]
        return serialized_friends

class AlertConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            await self.channel_layer.group_add(
                f"user_{self.user.id}",
                self.channel_name
            )
            await self.accept()
            print(f"User {self.user.id} connected to WebSocket.")
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                f"user_{self.user.id}",
                self.channel_name
            )
            print(f"User {self.user.id} disconnected from WebSocket.")

    async def receive(self, text_data):
        print(f"Raw message received: {text_data}")
        text_data_json = json.loads(text_data)
        recipient_id = text_data_json.get('recipient_id')
        message = text_data_json.get('message')
        sender_id = self.user.id
        invite_status = text_data_json.get('invite_status', None)

        print(f"Parsed message: recipient_id={recipient_id}, message={message}, sender_id={sender_id}, invite_status={invite_status}")

        if recipient_id:
            recipient_group_name = f'user_{recipient_id}'
            await self.channel_layer.group_send(
                recipient_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'recipient_id': recipient_id,
                    'sender_id': sender_id,
                    'invite_status': invite_status,
                }
            )

    async def chat_message(self, event):
        message = event['message']
        recipient_id = event['recipient_id']
        sender_id = event['sender_id']
        invite_status = event.get('invite_status', None)

        print(f"Parsed message-chat: recipient_id={recipient_id}, message={message}, sender_id={sender_id}, invite_status={invite_status}")

        await self.send(text_data=json.dumps({
            'message': message,
            'recipient_id': recipient_id,
            'sender_id': sender_id,
            'invite_status': invite_status,
        }))
