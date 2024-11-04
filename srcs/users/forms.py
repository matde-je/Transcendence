from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth.forms import UserCreationForm
from .models import UserProfile
from django.contrib.auth.forms import PasswordChangeForm

class RegistrationForm(UserCreationForm):
    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'first_name', 'last_name', 'password1', 'password2', 'nickname', 'avatar']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if UserProfile.objects.filter(email=email).exists():
            raise ValidationError("Este email já está em uso. Por favor, escolha outro.")
        return email

    def clean_nickname(self):
        nickname = self.cleaned_data.get('nickname')
        if UserProfile.objects.filter(nickname=nickname).exists():
            raise ValidationError("Este apelido já está em uso. Por favor, escolha outro.")
        return nickname

class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['nickname', 'email', 'first_name', 'last_name', 'avatar']

    def __init__(self, *args, **kwargs):
        super(UserUpdateForm, self).__init__(*args, **kwargs)
        self.fields['email'].required = True
        
class CustomPasswordChangeForm(PasswordChangeForm):
    def __init__(self, *args, **kwargs):
        super(CustomPasswordChangeForm, self).__init__(*args, **kwargs)
        for field_name in self.fields:
            self.fields[field_name].widget.attrs.update({'class': 'form-control'})