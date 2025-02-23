from rest_framework import serializers


def all_fields_serializer(model, exclude=None, many=True, read_only=True, **kwargs):
    """
    Dynamically create a ModelSerializer for a given model,
    excluding fields
    """
    exclude = exclude or []

    serializer_class = type(
        f"{model.__name__}Serializer",
        (serializers.ModelSerializer,),
        {
            "Meta": type(
                "Meta",
                (),
                {
                    "model": model,
                    "exclude": exclude,
                    "many": many,
                    "read_only": read_only,
                },
            )
        },
    )
    return serializer_class
