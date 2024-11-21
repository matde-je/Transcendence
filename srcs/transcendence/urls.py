"""
URL configuration for transcendence project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from users.views import dashboard
from pong import views as pong_views
from django.conf import settings
from django.conf.urls.static import static

from users.views import register_user
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

include('users.urls', namespace='users')

urlpatterns = [
    # Admin URL
    path('admin/', admin.site.urls),

    # Authentication URLs (login, logout, etc.)
    path('users/', include(('django.contrib.auth.urls', 'auth'), namespace='auth')),

    # User Management
    path('users/', include(('users.urls', 'users'), namespace='users')),

	# Dashboard URL
    path('users/dashboard/', dashboard, name='dashboard'),

	path('api/', include('users.urls')),

    # Pong URL
    path('', include('pong.urls')),
] 

# Static URLs
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# if settings.DEBUG:
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

LOGIN_URL = '/users/login/'
LOGIN_REDIRECT_URL = '/users/dashboard/'
LOGOUT_REDIRECT_URL = '/users/login/'