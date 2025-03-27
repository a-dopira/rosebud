from common import DynamicViewSet, dynamic_serializer
from django.db import IntegrityError
from django.db.models import Count, ProtectedError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter

from .filters import RoseFilter
from .pagination import RosePagination
from .models import (
    Group,
    Breeder,
    Rose,
    Pest,
    Pesticide,
    Fungus,
    Fungicide,
    Size,
    Feeding,
    RosePhoto,
    Video,
    Foliage,
)
from .serializers import (
    GroupSerializer,
    RoseSerializer,
    RoseListSerializer,
    PesticideSerializer,
    FungicideSerializer,
    SizeSerializer,
    FeedingSerializer,
    FoliageSerializer,
)


class RoseViewSet(viewsets.ModelViewSet):
    queryset = Rose.objects.all().order_by("id").prefetch_related(
        'feedings', 'foliages', 'rosephotos', 'sizes', 
        'videos', 'pesticides', 'fungicides'
    )
    permission_classes = [IsAuthenticated]
    pagination_class = RosePagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = RoseFilter
    ordering_fields = ['title', 'id']
    ordering = ['id']

    def get_serializer_class(self):
        if self.action == "list":
            return RoseListSerializer
        return RoseSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        message = self._build_search_message(request, queryset)
        
        if not queryset.exists():
            return Response(
                {"message": message, "results": []}, 
                status=status.HTTP_200_OK
            )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response_data = self.get_paginated_response(serializer.data)
            return Response(
                {"message": message, "results": response_data.data}, 
                status=status.HTTP_200_OK
            )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {"message": message, "results": serializer.data}, 
            status=status.HTTP_200_OK
        )

    def _build_search_message(self, request, queryset):

        group = request.query_params.get("group")
        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")
        
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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"id": instance.id, "title": instance.title}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except IntegrityError:
            return Response(
                {"detail": "Роза с таким title или title_eng уже существует."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.annotate(rose_count=Count("roses"))
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    filter_fields = ["name"]

    def create(self, request, *args, **kwargs):
        name = request.data.get('name')
        if name and Group.objects.filter(name=name).exists():
            return Response(
                {"detail": "Группа с таким названием уже существует."},
                status=status.HTTP_409_CONFLICT,
            )
        
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            updated_groups = Group.objects.annotate(rose_count=Count("roses"))
            groups_serializer = self.get_serializer(updated_groups, many=True)
            
            return Response({
                "message": f"Группа {serializer.data['name']} успешно добавлена.",
                "items": groups_serializer.data 
            }, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response(
                {"detail": "Группа с таким названием уже существует."},
                status=status.HTTP_409_CONFLICT,
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            name = instance.name
            self.perform_destroy(instance)
            
            updated_groups = Group.objects.annotate(rose_count=Count("roses"))
            groups_serializer = self.get_serializer(updated_groups, many=True)
            
            return Response({
                "message": f"Группа {name} удалена.",
                "items": groups_serializer.data
            }, status=status.HTTP_200_OK)
        except ProtectedError:
            return Response(
                {"detail": "Невозможно удалить группу поскольку к ней привязаны розы."},
                status=status.HTTP_409_CONFLICT,
            )


class SizeViewSet(viewsets.ModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"id": instance.id, "name": "размеры"}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class FeedingViewSet(viewsets.ModelViewSet):
    queryset = Feeding.objects.all()
    serializer_class = FeedingSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"id": instance.id, "name": instance.basal}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class FoliageViewSet(viewsets.ModelViewSet):
    queryset = Foliage.objects.all()
    serializer_class = FoliageSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"id": instance.id, "name": instance.foliage}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class PesticideViewSet(viewsets.ModelViewSet):
    queryset = Pesticide.objects.all()
    serializer_class = PesticideSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"id": instance.id, "name": instance.name}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class FungicideViewSet(viewsets.ModelViewSet):
    queryset = Fungicide.objects.all()
    serializer_class = FungicideSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"id": instance.id, "name": instance.name}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class RosePhotoViewSet(DynamicViewSet):
    model = RosePhoto


class VideoViewSet(DynamicViewSet):
    model = Video


class BreederViewSet(DynamicViewSet):
    model = Breeder
    exclude = ["slug"]
    entity_name = "Селекционер"


class FungusViewSet(DynamicViewSet):
    model = Fungus
    entity_name = "Гриб"


class PestViewSet(DynamicViewSet):
    model = Pest
    entity_name = "Вредитель"


class AdjustmentViewSet(viewsets.ViewSet):
    """
    Get breeders, pests, fungi, groups all at once
    """
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        try:

            groups = Group.objects.annotate(rose_count = Count("roses"))
            breeders = Breeder.objects.all()
            pests = Pest.objects.all()
            fungi = Fungus.objects.all()
            
            group_serializer = GroupSerializer(groups, many=True)
            breeder_serializer = dynamic_serializer(Breeder, exclude=["slug"])(breeders, many=True)
            pest_serializer = dynamic_serializer(Pest)(pests, many=True)
            fungi_serializer = dynamic_serializer(Fungus)(fungi, many=True)
            
            return Response({
                'groups': group_serializer.data,
                'breeders': breeder_serializer.data,
                'pests': pest_serializer.data,
                'fungi': fungi_serializer.data
            })
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
