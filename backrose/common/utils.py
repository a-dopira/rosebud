import os
from django.apps import apps
from rest_framework import serializers


def dynamic_serializer(
    model_class, exclude=None, _many=False, _read_only=False, **kwargs
):
    exclude_list = exclude or []

    class DynamicModelSerializer(serializers.ModelSerializer):
        class Meta:
            model = model_class
            many = _many
            read_only = _read_only
            exclude = exclude_list

    return DynamicModelSerializer


def get_filename(instance, filename):
    Rose = apps.get_model("roses", "Rose")

    title_eng = (
        instance.title_eng if isinstance(instance, Rose) else instance.rose.title_eng
    )
    filename = f"{title_eng}_{filename}"

    if isinstance(instance, Rose):
        return os.path.join("images", title_eng, "thumbnails", filename)

    return os.path.join("images", title_eng, filename)
