from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from django.db.models import ProtectedError
from .utils import dynamic_serializer


class DynamicViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    model = None
    exclude = []
    entity_name = ""

    def get_queryset(self):
        if self.model is None:
            raise NotImplementedError("You must set `.model` on this ViewSet.")
        return self.model.objects.all()

    def get_serializer_class(self):
        serializer_class = dynamic_serializer(self.model, exclude=self.exclude)
        return serializer_class

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
        
            entity_name = self.entity_name or self.model.__name__
            return Response(
                {
                    **serializer.data,
                    "message": f"{entity_name} {serializer.data['name']} успешно добавлен."
                }, 
                status=status.HTTP_201_CREATED
            )
        except serializers.ValidationError as e:
            
            if 'name' in getattr(e, 'detail', {}) and any('already exists' in str(error) for error in e.detail.get('name', [])):
                entity_name = self.entity_name or self.model.__name__
                return Response(
                    {'detail': f"{entity_name} с таким названием уже существует."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance_name = instance.name
            entity_name = self.entity_name or self.model.__name__
            
            self.perform_destroy(instance)

            return Response(
                {"message": f"{entity_name} {instance_name} удален."}, 
                status=status.HTTP_200_OK
            )
        except ProtectedError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_409_CONFLICT
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        serializer.save()
