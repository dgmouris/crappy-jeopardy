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
