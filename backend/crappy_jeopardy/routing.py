from channels.routing import ProtocolTypeRouter, URLRouter, ChannelNameRouter
from channels.auth import AuthMiddlewareStack
from channels.sessions import SessionMiddlewareStack

from apps.questions.consumers import QuestionConsumer
import apps.questions.routing

application = ProtocolTypeRouter({
    # 'websocket': AuthMiddlewareStack(
    'websocket': SessionMiddlewareStack(
        URLRouter(
            apps.questions.routing.websocket_urlpatterns
        )
    )
})
