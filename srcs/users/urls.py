from django.urls import path
from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MyViewSet

app_name = 'users'

router = DefaultRouter()
router.register(r'myview', MyViewSet, basename='myview')

urlpatterns = [
	path('activate/<uidb64>/<token>/', views.activate, name='activate'),
    path('register/', views.register, name='register'),
    path('activate/<uidb64>/<token>/', views.activate, name='activate'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('update/', views.update_profile, name='update_profile'),
	path('change_password/', views.change_password, name='change_password'),
    path('add_friend/<int:user_id>/', views.invite_friend, name='add_friend'),
    path('accept_friend/<int:friendship_id>/', views.accept_friend, name='accept_friend'),
    path('friends/', views.friends_list, name='friends_list'),
	path('remove_friend/<int:user_id>/', views.remove_friend, name='remove_friend'),
	path('api/', include(router.urls)),
]
