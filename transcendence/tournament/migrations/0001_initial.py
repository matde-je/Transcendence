# Generated by Django 5.1.4 on 2025-01-09 15:36

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
                ('finished_on', models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='TournamentMatch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player1', models.IntegerField()),
                ('player2', models.IntegerField()),
                ('round', models.IntegerField(default=0)),
                ('winner', models.IntegerField(blank=True, null=True)),
                ('started_at', models.DateTimeField()),
                ('completed', models.BooleanField(default=False)),
                ('completed_on', models.DateTimeField(blank=True, null=True)),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches', to='tournament.tournament')),
            ],
            options={
                'verbose_name': 'Tournament Match',
                'verbose_name_plural': 'Tournament Matches',
            },
        ),
        migrations.CreateModel(
            name='TournamentUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_id', models.IntegerField()),
                ('is_accepted', models.BooleanField(default=False)),
                ('is_canceled', models.BooleanField(default=False)),
                ('is_refused', models.BooleanField(default=False)),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tournamentUsers', to='tournament.tournament')),
            ],
        ),
    ]
