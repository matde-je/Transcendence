# Generated by Django 5.1.5 on 2025-01-17 16:51

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MatchHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('opponent', models.CharField(blank=True, max_length=100, null=True)),
                ('result', models.CharField(max_length=10)),
                ('date_played', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
