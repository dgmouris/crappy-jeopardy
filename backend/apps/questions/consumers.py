import json
from pprint import pprint
from asgiref.sync import async_to_sync
import datetime
from channels.generic.websocket import WebsocketConsumer
from .models import AnonymousChannelUser, Message, Question


class QuestionConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = self.room_name
        self.user = None
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        self.scope['session']['user'].delete()
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        message = text_data_json['message']
        user = text_data_json['user']
        action = text_data_json['action']
        # Send message to room group
        message_to_chat = {
            'type': message_type,
            'user': user,
            'message': message,
            'action': action,
            'time': datetime.datetime.now().timestamp()
        }

        Message.objects.create(
            room=self.room_name,
            data=message_to_chat
        )

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            message_to_chat
        )

    # websocket message handler
    def answer_question(self, event):
        message = event['message']
        question_id = event['message']['question']
        answer = event['message']['answer']
        user = event['user']

        question = Question.objects.get(id=question_id)
        event['message']['is_correct'] = question.answer.lower()==answer.lower()
        event['message']['value'] = question.value
        self.send(text_data=json.dumps({
            'user': user,
            'message': message,
            'action': "answer_question",
            'time': datetime.datetime.now().timestamp()
        }))

    # websocket message handler
    def user_join(self, event):
        pprint(event)
        message = event['message']
        user = event['user']
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'user': user,
            'message': {
                'users': self.get_users()
            },
            'action': "user_join",
            'time': datetime.datetime.now().timestamp()

        }))

    # websocket message handler
    def new_question(self, event):
        self.send(text_data=json.dumps({
            'user': "",
            'message': {},
            'action': "new_question",
            'time': datetime.datetime.now().timestamp()
        }))


    def get_users(self):
        anon_users_list = []
        anon_users = AnonymousChannelUser.objects.filter(
            room=self.room_group_name).distinct()
        for anon_user in anon_users:
            anon_users_list.append(anon_user.name)
        return anon_users_list

    def remove_user(self, user):
        return AnonymousChannelUser.objects.filter(
            room=self.room_group_name,
            name=user).delete()
