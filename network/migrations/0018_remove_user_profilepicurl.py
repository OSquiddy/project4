# Generated by Django 3.0.8 on 2020-09-12 16:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0017_auto_20200912_2022'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='profilePicURL',
        ),
    ]
