# Crappy Jeopardy

## Running the React Project
- In the root folder
`npm run start --prefix frontend`
- In the frontend folder
`npm run start`

## Running the django project locally

- Start your redis
    - Make sure redis-server is installed
    `sudo apt install redis-server`
    - run the server
    `sudo service redis-server start`
    - check if the redis-server is running successfully
    `redis-cli ping`
    Note: output should be PONG

- Install postgres and set it up.
    - install required packages.
        `sudo apt install libpq-dev postgresql postgresql-contrib -y`
    - Login to postgres
        `sudo -u postgres psql`
    - Create database
        `CREATE DATABASE "crappy-jeopardy"`
    - Create user
        `CREATE USER crappyjeopardy WITH PASSWORD 'crappyjeopardy';`
    - set some options for the user
        `ALTER ROLE crappyjeopardy SET client_encoding TO 'utf8';`
        `ALTER ROLE crappyjeopardy SET default_transaction_isolation TO 'read committed';`
        `ALTER ROLE crappyjeopardy SET timezone TO 'UTC';`
    - grant the privileges of the user
        `GRANT ALL PRIVILEGES ON DATABASE "crappy-jeopardy" TO crappyjeopardy;`
    - make surethat database is running correctly.
        `sudo service postgresql start`
        `sudo service postgresql status`

- Command to Run the server
    - in the root folder
    (cd backend && pipenv run python manage.py runserver)
    - go into the backend folder
        - run the shell
        `pipenv shell`
        - run the server
        `python manage.py runserver`


## Getting New Questions

- To get real jeopardy questions what I did is use an api that you can use here.
    http://jservice.io/
    Shout out to https://github.com/sottenad/jService for creating this years ago.

- I've created a management command to do this.
    1. Go in to the backend folder
    2. Start the shell
        pipenv shell
    3. Run the command
        python manage.py get_questions


## How the project Works on the Python/Server side.

I'm going to talk shortly about how the project works on the python/server side of things.

### Installing and Integrating django channels into the project.

- The first step to do so is to install the packages required in the project (I've already done this but just exaplain my project)
    pipenv install channels channels_redis

- In the installed apps I included my `apps.questions` which is where I create my consumers (basically you can think of this as websocket views)
```python
INSTALLED_APPS = (
    'apps.questions',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    ...
    'channels',
)
```
- To use Asgi you need first to create a `crappy_jeopardy/routing.py` file.
```python
from channels.routing import ProtocolTypeRouter, URLRouter, ChannelNameRouter
from channels.sessions import SessionMiddlewareStack


application = ProtocolTypeRouter({
    # Routing will go here.
})
```
Note: if you're going to use this in your project, this routing.py should be in the same folder as your settings.py file (if you're not having separate settings.)

- In the `crappy_jeopardy/settings.py` you need to include "ASGI_APPLICATION" which for me looked like the following.
```python
ASGI_APPLICATION = 'crappy_file.routing.application'
```
- Include the Channel layers so that django channels knows to interface with redis. Mine looks like the following and if you're using redis locally this is a pretty good example of what to use.

```python
REDIS_CHANNEL_HOST = ('127.0.0.1', 6379)

# Channels Configuration
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [REDIS_CHANNEL_HOST]
        },
    },
}
```


### Writing the consumer which basically handles all of the messages that are sent from the react project.

    - What I did below is to create a generic session that can connect and disconnect from the channel.

```python
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
class QuestionConsumer(WebsocketConsumer):

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

```
- The next part I did here is that Implemented the `receive` method which will recieve sent messages (that have a type) to the websocket.
    - The really important piece the `sync_to_sync(self.channel_layer.group_send)` method which uses the special `type` key to invoke the methods with the corresponding type names.
        - for example if I receive a type equivalend to ANSWER_QUESTION_TYPE it will send it to the `def answer_question(self, event)` method.


```python
#... more imports here...
import json
import datetime
from asgiref.sync import async_to_sync
from .models import AnonymousChannelUser, Message, Question, RoomUserAnswers


class QuestionConsumer(WebsocketConsumer):
    ANSWER_QUESTION_TYPE = "answer_question"
    USER_JOIN_TYPE = "user_join"
    NEW_QUESTION_TYPE = "new_question"
    #... other code ...

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
            self.create_room_answer(text_data_json) # you can take look in the code for this.

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            message_to_chat
        )

     # websocket message handler
    def answer_question(self, event):
        pass

    # websocket message handler
    def user_join(self, event):
        pass
    # websocket message handler
    def new_question(self, event):
        pass
```

- The websocket will send a message to all of the users using the `self.send` method, this will have an `action` and a `message` that is specific to the type of message.

```python
class QuestionConsumer(WebsocketConsumer):
    USER_JOIN_TYPE = "user_join"
    #... other code ...
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

```

### Fix the routing in our project to point to our consumer

- create a routing.py file in the `apps.questions` package.
```python
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/questions_notifications/(?P<room_name>\w+)/$', consumers.QuestionConsumer),
]

```

- Now that we have our `apps.questions.routing.py` created let's update our `crappy_jeopardy/routing.py` to use our project.

```python
from channels.routing import ProtocolTypeRouter, URLRouter, ChannelNameRouter
from channels.sessions import SessionMiddlewareStack

from apps.questions.consumers import QuestionConsumer
import apps.questions.routing

application = ProtocolTypeRouter({
    'websocket': SessionMiddlewareStack(
        URLRouter(
            apps.questions.routing.websocket_urlpatterns
        )
    )
})
```

### How do the messages work back and forth?

- The frontend (so the react project) send websocket events with the `type` key to the websocket.
- The backend send back the message with the `action` key which will decipher how messages will be parsed on the front end.
- Then the front has handler which based on the `action` handles it differently.
- I'll probably talk on this at the exchange.js at some point.

## Next Steps

- Clean up the messy code.
- Actually deploy it with ssl and add a domain name.
- Get some history for users so that they can understand their.
- Hopefully learn a lesson in not creating talks at the last minute.
