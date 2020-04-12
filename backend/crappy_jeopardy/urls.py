from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('room/', include("apps.questions.urls")),
    path('admin/', admin.site.urls),
]
