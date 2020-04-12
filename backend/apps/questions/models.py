from django.db import models
from django.contrib.postgres.fields import JSONField


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
        return F"{self.name}, answer: {self.answer}"

class Message(models.Model):
    room = models.CharField(max_length=255)
    data = JSONField()
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return F"room: {self.room}, created: {self.created}"
