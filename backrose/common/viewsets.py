from rest_framework import viewsets
from django.apps import apps
from django.shortcuts import get_object_or_404


class NestedViewSet(viewsets.ModelViewSet):
    def get_rose(self):
        Rose = apps.get_model("roses", "Rose")
        return get_object_or_404(Rose, pk=self.kwargs["rose_pk"])

    def get_queryset(self):
        rose = self.get_rose()
        return self.queryset.filter(rose=rose)

    def perform_create(self, serializer):
        rose = self.get_rose()
        serializer.save(rose=rose)
