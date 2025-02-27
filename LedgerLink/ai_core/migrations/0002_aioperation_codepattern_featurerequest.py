# Generated by Django 5.1.4 on 2025-01-08 01:25

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ai_core', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AIOperation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('operation_type', models.CharField(choices=[('analysis', 'Project Analysis'), ('generation', 'Code Generation'), ('modification', 'Code Modification'), ('feature', 'Feature Implementation')], max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending', max_length=20)),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('details', models.JSONField(default=dict)),
                ('error_message', models.TextField(blank=True)),
            ],
            options={
                'db_table': 'ai_operations',
                'ordering': ['-started_at'],
            },
        ),
        migrations.CreateModel(
            name='CodePattern',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pattern_type', models.CharField(max_length=50)),
                ('pattern_data', models.JSONField()),
                ('frequency', models.IntegerField(default=1)),
                ('confidence_score', models.FloatField(default=1.0)),
                ('last_used', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'ai_code_patterns',
                'indexes': [models.Index(fields=['pattern_type', 'frequency'], name='ai_code_pat_pattern_3b2622_idx')],
            },
        ),
        migrations.CreateModel(
            name='FeatureRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('status', models.CharField(choices=[('pending', 'Pending Analysis'), ('analyzed', 'Analyzed'), ('implementing', 'Implementing'), ('testing', 'Testing'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending', max_length=20)),
                ('analysis_result', models.JSONField(blank=True, null=True)),
                ('implementation_details', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('requested_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'ai_feature_requests',
            },
        ),
    ]
