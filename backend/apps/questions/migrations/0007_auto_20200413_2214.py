# Generated by Django 3.0.5 on 2020-04-13 22:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questions', '0006_roomuseranswers_room_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='roomuseranswers',
            name='room_name',
            field=models.CharField(max_length=255),
        ),
    ]
