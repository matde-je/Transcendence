# Generated by Django 5.1.4 on 2024-12-20 16:29

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(default='Pong42 Tournament', max_length=100)),
                ('created_on', models.DateTimeField(default=django.utils.timezone.now)),
                ('creator_id', models.IntegerField(null=True)),
                ('winner_id', models.IntegerField(blank=True, null=True)),
                ('is_started', models.BooleanField(default=False)),
                ('is_finished', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='TournamentUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_id', models.IntegerField()),
                ('is_accepted', models.BooleanField(default=False)),
                ('is_canceled', models.BooleanField(default=False)),
                ('is_refused', models.BooleanField(default=False)),
                ('position', models.IntegerField(default=0)),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tournamentUsers', to='tournament.tournament')),
            ],
        ),
    ]
