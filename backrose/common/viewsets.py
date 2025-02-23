from rest_framework import viewsets, permissions, status, response
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
        serializer_class = all_fields_serializer(self.model, exclude=self.exclude)
        return serializer_class

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return response.Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        serializer.save()
