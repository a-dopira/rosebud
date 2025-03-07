# Generated by Django 5.0.1 on 2024-03-11 15:50

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("roses", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="breeder",
            name="name",
            field=models.CharField(max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name="breeder",
            name="slug",
            field=models.SlugField(unique=True),
        ),
        migrations.AlterField(
            model_name="group",
            name="name",
            field=models.CharField(max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name="rose",
            name="breeder",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="roses",
                to="roses.breeder",
            ),
        ),
        migrations.AlterField(
            model_name="rose",
            name="const_height",
            field=models.DecimalField(
                blank=True, decimal_places=2, max_digits=6, null=True
            ),
        ),
        migrations.AlterField(
            model_name="rose",
            name="const_width",
            field=models.DecimalField(
                blank=True, decimal_places=2, max_digits=6, null=True
            ),
        ),
        migrations.AlterField(
            model_name="rose",
            name="description",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="rose",
            name="group",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="roses",
                to="roses.group",
            ),
        ),
        migrations.AlterField(
            model_name="rose",
            name="landing_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="rose",
            name="observation",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="rose",
            name="susceptibility",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
