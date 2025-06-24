from common import DynamicViewSet, dynamic_serializer
from django.db import IntegrityError
from django.db.models import Count, ProtectedError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import RoseFilter
from .pagination import CustomPagination
from .models import (
    Group,
    Breeder,
    Rose,
    Pest,
    Pesticide,
    RosePesticide,
    Fungus,
    Fungicide,
    RoseFungicide,
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
    RosePesticideSerializer,
    RoseCreateSerializer,
    FungicideSerializer,
    RoseFungicideSerializer,
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
            "rosepesticides",
            "rosefungicides",
        )
        .select_related("breeder", "group")
    )
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = RoseFilter

    def get_serializer_class(self):
        if self.action == "list":
            return RoseListSerializer
        elif self.action in ["create", "update", "partial_update"]:
            return RoseCreateSerializer
        return RoseSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        instance.refresh_from_db()

        response_serializer = RoseSerializer(instance)
        return Response(response_serializer.data)

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


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.annotate(rose_count=Count("roses"))
    serializer_class = GroupSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["name"]

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

    @action(detail=True, methods=["post"])
    def add_pests(self, request, pk=None):
        pesticide = self.get_object()
        pests_ids = request.data.get("pests_ids", [])

        pests = Pest.objects.filter(id__in=pests_ids)
        if not pests.exists():
            return Response(
                {"detail": "Указанные вредители не найдены"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for pest in pests:
            pesticide.pests.add(pest)

        serializer = self.get_serializer(pesticide)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def remove_pests(self, request, pk=None):
        pesticide = self.get_object()
        pests_ids = request.data.get("pests_ids", [])

        pests = Pest.objects.filter(id__in=pests_ids)
        for pest in pests:
            pesticide.pests.remove(pest)

        serializer = self.get_serializer(pesticide)
        return Response(serializer.data)


class FungicideViewSet(viewsets.ModelViewSet):
    queryset = Fungicide.objects.all()
    serializer_class = FungicideSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"id": instance.id, "name": instance.name}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def add_fungi(self, request, pk=None):
        fungicide = self.get_object()
        fungi_ids = request.data.get("fungi_ids", [])

        fungi = Fungus.objects.filter(id__in=fungi_ids)
        if not fungi.exists():
            return Response(
                {"detail": "Указанные грибки не найдены"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for fungus in fungi:
            fungicide.fungi.add(fungus)

        serializer = self.get_serializer(fungicide)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def remove_fungi(self, request, pk=None):
        fungicide = self.get_object()
        fungi_ids = request.data.get("fungi_ids", [])

        fungi = Fungus.objects.filter(id__in=fungi_ids)
        for fungus in fungi:
            fungicide.fungi.remove(fungus)

        serializer = self.get_serializer(fungicide)
        return Response(serializer.data)


class RosePesticideViewSet(viewsets.ModelViewSet):
    queryset = RosePesticide.objects.all()
    serializer_class = RosePesticideSerializer


class RoseFungicideViewSet(viewsets.ModelViewSet):
    queryset = RoseFungicide.objects.all()
    serializer_class = RoseFungicideSerializer


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


class BreederViewSet(DynamicViewSet):
    model = Breeder
    exclude = ["slug"]
    entity_name = "Селекционер"


class AdjustmentViewSet(viewsets.ViewSet):
    """
    Get breeders, pests, fungi, pesticides, fungicides, groups all at once
    """

    def list(self, request):
        try:
            groups = Group.objects.annotate(rose_count=Count("roses"))
            breeders = Breeder.objects.all()
            pests = Pest.objects.all()
            fungi = Fungus.objects.all()
            pesticides = Pesticide.objects.all().prefetch_related("pests")
            fungicides = Fungicide.objects.all().prefetch_related("fungi")

            group_serializer = GroupSerializer(groups, many=True)
            breeder_serializer = dynamic_serializer(Breeder, exclude=["slug"])(
                breeders, many=True
            )
            pest_serializer = dynamic_serializer(Pest)(pests, many=True)
            fungi_serializer = dynamic_serializer(Fungus)(fungi, many=True)
            pesticide_serializer = PesticideSerializer(pesticides, many=True)
            fungicide_serializer = FungicideSerializer(fungicides, many=True)

            return Response(
                {
                    "groups": group_serializer.data,
                    "breeders": breeder_serializer.data,
                    "pests": pest_serializer.data,
                    "fungi": fungi_serializer.data,
                    "pesticides": pesticide_serializer.data,
                    "fungicides": fungicide_serializer.data,
                }
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
