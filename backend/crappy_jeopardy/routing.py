from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.sessions import SessionMiddlewareStack

import apps.questions.routing

application = ProtocolTypeRouter({
    # 'websocket': AuthMiddlewareStack(
    'websocket': SessionMiddlewareStack(
        URLRouter(
            apps.questions.routing.websocket_urlpatterns
        )
    ),
})
