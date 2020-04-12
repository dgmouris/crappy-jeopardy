from rest_framework import serializers
from .models import AnonymousChannelUser, Question
from django.core.exceptions import MultipleObjectsReturned

class AnonymousChannelUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnonymousChannelUser
        fields = ['room','name','active']

    def validate(self, data):
        is_valid = False
        try:
            room_users = AnonymousChannelUser.objects.get(room=data['room'], name=data['name'])
        except AnonymousChannelUser.DoesNotExist:
            is_valid = True
        except AnonymousChannelUser.MultipleObjectsReturned:
            if_valid = False
        if not is_valid:
            raise serializers.ValidationError("This username is taken, just go to the room")
        return data

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id','value' ,'name' ,'answer']
