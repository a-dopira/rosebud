from common import DynamicViewSet, dynamic_serializer
from django.db import IntegrityError
from django.db.models import Count, ProtectedError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
        'feedings',
        'foliages',
        'rosephotos',
        'sizes',
        'videos',
        'pesticides',
        'fungicides'
    )
    permission_classes = [IsAuthenticated]
    serializer_class = RoseSerializer
    pagination_class = RosePagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = RoseFilter

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        group = request.query_params.get("group")
        search = request.query_params.get("search")

        message = ""
        if group:
            message += f"Результаты по группе: {group}"
        if search:
            if message:
                message += ", "
            message += f"Результаты по запросу: {search}"

        if not queryset.exists():
            message = "По результату поиска"
            if group:
                message += f" по группе: {group}"
            if search:
                message += f" по запросу: {search}"
            message += " ничего не найдено, попробуйте что-то другое."
            return Response(
                {"message": message, "results": []}, status=status.HTTP_200_OK
            )
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response_data = self.get_paginated_response(serializer.data).data
        else:
            serializer = self.get_serializer(queryset, many=True)
            response_data = serializer.data
        return Response(
                {"message": message, "results": response_data}, status=status.HTTP_200_OK
            )

    def get_serializer_class(self):
        if self.action == "list":
            return RoseListSerializer
        return RoseSerializer

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
            return Response(status=status.HTTP_201_CREATED, headers=headers)
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
            return Response({"message": f"Группа {serializer.data['name']} успешно добавлена."}, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response(
                {"detail": "Группа с таким названием уже существует."},
                status=status.HTTP_409_CONFLICT,
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            data = {"id": instance.id, "name": instance.name}
            self.perform_destroy(instance)
            return Response({"message": f"Группа {instance.name} удалена."}, status=status.HTTP_200_OK)
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


class RosePhotoViewSet(DynamicViewSet):
    model = RosePhoto


class VideoViewSet(DynamicViewSet):
    model = Video


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