from django.core.management.base import BaseCommand, CommandError
import requests
from pprint import pprint
from django.conf import settings
from ...models import Question

class Command(BaseCommand):
    def handle(self, *args, **options):
        print("getting questions...")
        response = requests.get(settings.JSERVICE_CLUES)
        all_question_data = response.json()

        for question_data in all_question_data:
            if ('value' not in question_data or
                    'question' not in question_data or
                    'answer' not in question_data):
                print("invalid question form")

                continue
            print("----------------------")
            if question_data['value'] is None:
                question_data['value'] = 5000

            print(question_data['value'])
            print(question_data['question'])
            print(question_data['answer'])
            # continue if there are no questions.
            if (question_data['question'] == "" or question_data['question'] == None):
                continue

            Question.objects.get_or_create(
                value=question_data['value'],
                name=question_data['question'],
                answer=question_data['answer']
            )

            # if created:
            print(F"successfully added question")
