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

class MessageBuilder:
    @staticmethod
    def build_search_message(request_params, queryset):
        group = request_params.get("group")
        search = request_params.get("search")
        ordering = request_params.get("ordering")

        if not queryset.exists():
            message = "По результату поиска"
            if group:
                message += f" по группе: {group}"
            if search:
                message += f" по запросу: {search}"
            return message + " ничего не найдено, попробуйте что-то другое."

        message_parts = []
        if group:
            message_parts.append(f"Результаты по группе: {group}")
        if search:
            message_parts.append(f"Результаты по запросу: {search}")
        if ordering:
            if ordering == "title":
                message_parts.append("Отсортировано по алфавиту (А-Я)")
            elif ordering == "-title":
                message_parts.append("Отсортировано по алфавиту (Я-А)")

        return ", ".join(message_parts)