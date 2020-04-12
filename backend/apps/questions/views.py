from django.shortcuts import render

from rest_framework import viewsets
from .serializers import AnonymousChannelUserSerializer, QuestionSerializer
from .models import AnonymousChannelUser, Question


class AnonymousChannelUserViewset(viewsets.ModelViewSet):
    queryset = AnonymousChannelUser.objects.all()
    serializer_class = AnonymousChannelUserSerializer


    def set_room(self):
        url_path_params = self.request.parser_context['kwargs']
        if 'room' in url_path_params:
            self.room = url_path_params['room']

    def get_queryset(self):
        self.set_room()
        if self.room:
            return AnonymousChannelUser.objects.filter(room=self.room)
        return AnonymousChannelUser.objects.all()

    def perform_create(self, serializer):
        serializer.save(active=True)

class QuestionViewset(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
