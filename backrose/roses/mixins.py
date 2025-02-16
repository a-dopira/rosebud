from rest_framework import viewsets, status
from rest_framework.response import Response

from collections import OrderedDict


class DestroyMixin:
    name_field = "name"

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name_value = getattr(instance, self.name_field, "Unknown")
        data = {"id": instance.id, "name": name_value}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class OrderedRepresentationMixin:
    new_order = []

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return OrderedDict([(key, representation[key]) for key in self.new_order])
