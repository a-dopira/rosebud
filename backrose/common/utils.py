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
