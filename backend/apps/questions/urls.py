from django.urls import re_path, path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'users', views.AnonymousChannelUserViewset)
router.register(r'questions', views.QuestionViewset)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    re_path(r'(?P<room>\w+)/', include(router.urls)),
]