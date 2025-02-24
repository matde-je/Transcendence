from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
import logging
logger = logging.getLogger(__name__)
from django.db.models import Q
from django.apps import apps

#NUNO
class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "game_group"
        # Establish WebSocket connection
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Disconnect the WebSocket when the game ends or user leaves
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Handle receiving messages from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type")

        if message_type == "sendInvite":
            recipient_id = text_data_json.get("recipient_id")
            message = text_data_json.get("message")
            # Store the invite logic (this could be saving to the database)
            # Simulating sending the invite here
            await self.send_invite(recipient_id, message)

        elif message_type == "playerReady":
            # Handle game start when both players are ready
            await self.start_game()

    # Send invite logic (simulating sending an invite)
    async def send_invite(self, recipient_id, message):
        # Simulating the invite being sent to the recipient
        # You can store the invite in the database here for tracking
        await self.send(text_data=json.dumps({
            "type": "gameInvite",
            "message": message,
            "recipient_id": recipient_id,
        }))

    async def start_game(self):
        # Notify both players that the game is starting
        await self.send(text_data=json.dumps({
            "type": "playerReady",
        }))
#NUNO\

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
        data = json.loads(text_data)
        message = data.get('message')
        recipient_id = data.get('recipient_id')
        print(f"Received message: {message} for recipient: {recipient_id}")

        if message and recipient_id:
            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {
                    'type': 'send_alert',
                    'message': message
                }
            )
            print(f"Sent message to group user_{recipient_id}")

    async def send_alert(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))
        print(f"Alert sent to user: {message}")
