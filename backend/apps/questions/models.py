from django.db import models
from django.contrib.postgres.fields import JSONField
from django.utils.html import strip_tags


class AnonymousChannelUser(models.Model):
    room = models.CharField(max_length=255);
    name = models.CharField(max_length=255);
    active = models.BooleanField(default=True);

    def __str__(self):
        return F"Room: {self.room}, User: {self.name}"


class Question(models.Model):
    value = models.IntegerField()
    name = models.TextField()
    answer = models.TextField()

    def __str__(self):
        return F"{self.id}: {self.name}, answer: {self.answer}"

    def save(self, *args, **kwargs):
        self.answer = strip_tags(self.answer)
        super().save(*args, **kwargs)

class Message(models.Model):
    room = models.CharField(max_length=255)
    data = JSONField()
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return F"room: {self.room}, created: {self.created}"

class RoomUserAnswers(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.SET_NULL,
        blank=True,
        null=True)
    room_name = models.CharField(max_length=255)
    user_name = models.CharField(max_length=255, null=True, blank=True)
    is_correct = models.BooleanField(default=False)
    first_to_answer_user_name = models.CharField(
        max_length=255,
        null=True,
        blank=True)
    next_question = models.ForeignKey(
        Question,
        related_name="next_question",
        on_delete=models.SET_NULL,
        blank=True,
        null=True)

    def __str__(self):
        return F"{self.user_name} answered first to answer={self.first_to_answer_user_name}"
