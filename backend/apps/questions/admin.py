from django.contrib import admin

from .models import AnonymousChannelUser, Question, Message, RoomUserAnswers

class AnonymousChannelUserAdmin(admin.ModelAdmin):
    pass

class QuestionAdmin(admin.ModelAdmin):
    pass

class MessageAdmin(admin.ModelAdmin):
    pass

class RoomUserAnswersAdmin(admin.ModelAdmin):
    pass

admin.site.register(AnonymousChannelUser, AnonymousChannelUserAdmin)

admin.site.register(Question, QuestionAdmin)

admin.site.register(Message, MessageAdmin)

admin.site.register(RoomUserAnswers, RoomUserAnswersAdmin)
