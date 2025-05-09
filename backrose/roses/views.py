from common import DynamicViewSet, dynamic_serializer
from django.db import IntegrityError
from django.db.models import Count, ProtectedError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
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
    queryset = (
        Rose.objects.all()
        .order_by("id")
        .prefetch_related(
            "feedings",
            "foliages",
            "rosephotos",
            "sizes",
            "videos",
            "pesticides",
            "fungicides",
        )
    )
    pagination_class = RosePagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = RoseFilter

    def get_serializer_class(self):
        if self.action == "list":
            return RoseListSerializer
        return RoseSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"id": instance.id, "title": instance.title}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["delete"])
    def photo(self, request, pk=None):
        rose = self.get_object()
        if rose.photo and rose.photo.name != "images/cap_rose.png":
            rose.photo.delete()
            rose.photo = "images/cap_rose.png"
            rose.save()
            return Response({"message": "Фото успешно удалено"})
        return Response(
            {"message": "Фото не удалось удалить"}, status=status.HTTP_400_BAD_REQUEST
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.annotate(rose_count=Count("roses"))
    serializer_class = GroupSerializer
    filter_fields = ["name"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            updated_groups = Group.objects.annotate(rose_count=Count("roses"))
            groups_serializer = self.get_serializer(updated_groups, many=True)

            return Response(
                {
                    "message": f"Группа {serializer.data['name']} успешно добавлена.",
                    "items": groups_serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        except IntegrityError:
            return Response(
                {"detail": "Группа с таким названием уже существует."},
                status=status.HTTP_409_CONFLICT,
            )
        except Exception as e:
            return Response(
                {"detail": "Не удалось создать группу. Попробуйте позже."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            name = instance.name
            self.perform_destroy(instance)

            updated_groups = Group.objects.annotate(rose_count=Count("roses"))
            groups_serializer = self.get_serializer(updated_groups, many=True)

            return Response(
                {"message": f"Группа {name} удалена.", "items": groups_serializer.data},
                status=status.HTTP_200_OK,
            )
        except ProtectedError:
            return Response(
                {"detail": "Невозможно удалить группу поскольку к ней привязаны розы."},
                status=status.HTTP_409_CONFLICT,
            )


class SizeViewSet(viewsets.ModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"id": instance.id, "name": "размеры"}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class FeedingViewSet(viewsets.ModelViewSet):
    queryset = Feeding.objects.all()
    serializer_class = FeedingSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"id": instance.id, "name": instance.basal}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class FoliageViewSet(viewsets.ModelViewSet):
    queryset = Foliage.objects.all()
    serializer_class = FoliageSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"id": instance.id, "name": instance.foliage}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class PesticideViewSet(viewsets.ModelViewSet):
    queryset = Pesticide.objects.all()
    serializer_class = PesticideSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"id": instance.id, "name": instance.name}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class FungicideViewSet(viewsets.ModelViewSet):
    queryset = Fungicide.objects.all()
    serializer_class = FungicideSerializer

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

    def list(self, request):
        try:

            groups = Group.objects.annotate(rose_count=Count("roses"))
            breeders = Breeder.objects.all()
            pests = Pest.objects.all()
            fungi = Fungus.objects.all()

            group_serializer = GroupSerializer(groups, many=True)
            breeder_serializer = dynamic_serializer(Breeder, exclude=["slug"])(
                breeders, many=True
            )
            pest_serializer = dynamic_serializer(Pest)(pests, many=True)
            fungi_serializer = dynamic_serializer(Fungus)(fungi, many=True)

            return Response(
                {
                    "groups": group_serializer.data,
                    "breeders": breeder_serializer.data,
                    "pests": pest_serializer.data,
                    "fungi": fungi_serializer.data,
                }
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
