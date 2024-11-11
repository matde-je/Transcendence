# users/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

# Importações que dependem da configuração do Django devem ser feitas após o setup
class OnlineStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Importar UserProfile aqui, após as configurações do Django terem carregado
        from .models import UserProfile
        
        # Lógica de conexão
        await self.accept()

        if self.scope["user"].is_authenticated:
            user_profile = await self.get_user_profile()
            user_profile.last_seen = timezone.now()
            await self.save_user_profile(user_profile)

    async def disconnect(self, close_code):
        # Update user's 'offline' status when disconnecting
        if self.scope["user"].is_authenticated:
            user_profile = await self.get_user_profile()
            user_profile.last_seen = timezone.now()
            await self.save_user_profile(user_profile)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        # Receive messages (if necessary)
        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def get_user_profile(self):
        return await UserProfile.objects.get(user=self.scope["user"])

    async def save_user_profile(self, user_profile):
        await user_profile.save()
