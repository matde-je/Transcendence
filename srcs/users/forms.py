from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import UserProfile

class RegistrationForm(UserCreationForm):
    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'password1', 'password2', 'nickname', 'avatar']

class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['nickname', 'avatar', 'email']