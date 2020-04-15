import json
from asgiref.sync import async_to_sync
import datetime
from channels.generic.websocket import WebsocketConsumer
from .models import AnonymousChannelUser, Message, Question, RoomUserAnswers


class QuestionConsumer(WebsocketConsumer):
    ANSWER_QUESTION_TYPE = "answer_question"
    USER_JOIN_TYPE = "user_join"
    NEW_QUESTION_TYPE = "new_question"

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = self.room_name

        self.user = None
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_name,
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
        action = text_data_json['type']
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

        if message_type == QuestionConsumer.ANSWER_QUESTION_TYPE:
            self.create_room_answer(text_data_json)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            message_to_chat
        )

    # websocket message handler
    def answer_question(self, event):
        message = event['message']
        question_id = message['question']
        answer = message['answer']
        user = event['user']


        question = Question.objects.get(id=question_id)
        userAnswer = RoomUserAnswers.objects.filter(
            room_name=self.room_name,
            user_name=user,
            question=question
        ).first()

        message['is_correct'] = userAnswer.is_correct
        message['value'] = userAnswer.question.value
        message['first_to_answer'] = userAnswer.first_to_answer_user_name
        message['next_question'] = userAnswer.next_question.id
        message['actual_answer'] = question.answer

        self.send(text_data=json.dumps({
            'user': user,
            'message': message,
            'action': QuestionConsumer.ANSWER_QUESTION_TYPE,
            'time': datetime.datetime.now().timestamp()
        }))

    # websocket message handler
    def user_join(self, event):
        message = event['message']
        user = event['user']
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'user': user,
            'message': {
                'users': self.get_users(),
                'current_question': self.get_current_question_id()
            },
            'action': QuestionConsumer.USER_JOIN_TYPE,
            'time': datetime.datetime.now().timestamp()
        }))

    # websocket message handler
    def new_question(self, event):
        new_question_id = event["message"]["new_question"]
        self.send(text_data=json.dumps({
            'user': "",
            'message': {
                'question': new_question_id
            },
            'action': QuestionConsumer.NEW_QUESTION_TYPE,
            'time': datetime.datetime.now().timestamp()
        }))

    def get_random_question(self):
        new_question = Question.objects.order_by("?").first()
        return new_question

    def create_room_answer(self, event):
        message = event['message']
        question_id = message['question']
        answer = message['answer']
        user = event['user']

        question = Question.objects.get(id=question_id)
        is_user_correct = question.answer.lower()==answer.lower()
        first_answer = RoomUserAnswers.objects.filter(
                user_name__isnull=False
            ).filter(
                room_name=self.room_name,
                question=question).first()
        user_answer_obj, created = RoomUserAnswers.objects.get_or_create(
            room_name=self.room_name,
            question=question,
            user_name=user,
            is_correct=is_user_correct
        )

        if first_answer is None:
            random_new_question = self.get_random_question()
            first_to_answer = user
        else:
            first_to_answer = first_answer.user_name
            random_new_question = first_answer.next_question

        user_answer_obj.next_question = random_new_question
        user_answer_obj.first_to_answer_user_name=first_to_answer
        user_answer_obj.save()

        return user_answer_obj

    def get_current_question_id(self):
        first_answer = RoomUserAnswers.objects.filter(
            room_name=self.room_name).last()
        if first_answer is None:
            random_question = self.get_random_question()
            first_answer = RoomUserAnswers.objects.create(
                room_name=self.room_name,
                question=random_question)
        return first_answer.question.id

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
