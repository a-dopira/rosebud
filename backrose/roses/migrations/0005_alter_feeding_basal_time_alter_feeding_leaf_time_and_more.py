# Generated by Django 5.0.1 on 2024-03-19 15:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("roses", "0004_alter_fungicide_fungicide_alter_pesticide_pest"),
    ]

    operations = [
        migrations.AlterField(
            model_name="feeding",
            name="basal_time",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="feeding",
            name="leaf_time",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="foliage",
            name="foliage_time",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="fungicide",
            name="date_added",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="pesticide",
            name="date_added",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="rosephoto",
            name="descr",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="rosephoto",
            name="year",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="size",
            name="date_added",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="video",
            name="descr",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
