from rest_framework import viewsets, permissions
from .utils import all_fields_serializer

class DynamicViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    model = None
    exclude = []

    def get_queryset(self):
        if self.model is None:
            raise NotImplementedError("You must set `.model` on this ViewSet.")
        return self.model.objects.all()

    def get_serializer_class(self):
        return all_fields_serializer(self.model, exclude=self.exclude)