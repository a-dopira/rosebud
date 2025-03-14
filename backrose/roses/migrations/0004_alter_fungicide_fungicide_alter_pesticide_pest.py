# Generated by Django 5.0.1 on 2024-03-18 16:01

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("roses", "0003_alter_fungicide_fungicide_alter_pesticide_pest"),
    ]

    operations = [
        migrations.AlterField(
            model_name="fungicide",
            name="fungicide",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="fungi",
                to="roses.fungus",
            ),
        ),
        migrations.AlterField(
            model_name="pesticide",
            name="pest",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="pests",
                to="roses.pest",
            ),
        ),
    ]
