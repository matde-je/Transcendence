# urls.py
from django.urls import path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

BASE_DIR = settings.BASE_DIR

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
] + static('/static/', document_root=settings.STATIC_ROOT)

# settings.py
import os

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'frontend', 'static')

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'frontend')],
        # ...
    },
]