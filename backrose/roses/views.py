from common import NestedViewSet
from django.db.models import Count
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
    BreederSerializer,
    RoseSerializer,
    PestSerializer,
    PesticideSerializer,
    RosePesticideSerializer,
    FungusSerializer,
    FungicideSerializer,
    RoseFungicideSerializer,
    SizeSerializer,
    FeedingSerializer,
    RosePhotoSerializer,
    VideoSerializer,
    FoliageSerializer,
    RoseListSerializer,
    RoseCreateSerializer,
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

    # to do:
    # need to add ProtectedError in case of trying to delete group with roses both for backend and frontend


class BreederViewSet(viewsets.ModelViewSet):
    queryset = Breeder.objects.all()
    serializer_class = BreederSerializer


class PestViewSet(viewsets.ModelViewSet):
    queryset = Pest.objects.all()
    serializer_class = PestSerializer


class FungusViewSet(viewsets.ModelViewSet):
    queryset = Fungus.objects.all()
    serializer_class = FungusSerializer


class PesticideViewSet(viewsets.ModelViewSet):
    queryset = Pesticide.objects.prefetch_related("pests")
    serializer_class = PesticideSerializer

    @action(detail=True, methods=["post"], url_path="pests")
    def add_pests(self, request, pk=None):

        pesticide = self.get_object()
        pest_ids = request.data.get("data", [])

        if not isinstance(pest_ids, list):
            return Response(
                {"errors": [{"detail": "data должно быть массивом ID"}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pests = Pest.objects.filter(id__in=pest_ids)
        if len(pests) != len(pest_ids):
            return Response(
                {"errors": [{"detail": "Некоторые вредители не найдены"}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pesticide.pests.add(*pests)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["delete"], url_path="pests")
    def remove_pests(self, request, pk=None):

        pesticide = self.get_object()
        pest_ids = request.data.get("data", [])

        pests = Pest.objects.filter(id__in=pest_ids)
        pesticide.pests.remove(*pests)
        return Response(status=status.HTTP_204_NO_CONTENT)


class FungicideViewSet(viewsets.ModelViewSet):
    queryset = Fungicide.objects.prefetch_related("fungi")
    serializer_class = FungicideSerializer

    @action(detail=True, methods=["post"], url_path="fungi")
    def add_fungi(self, request, pk=None):

        fungicide = self.get_object()
        fungus_ids = request.data.get("data", [])

        if not isinstance(fungus_ids, list):
            return Response(
                {"errors": [{"detail": "data должно быть массивом ID"}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        fungi = Fungus.objects.filter(id__in=fungus_ids)
        if len(fungi) != len(fungus_ids):
            return Response(
                {"errors": [{"detail": "Некоторые грибки не найдены"}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        fungicide.fungi.add(*fungi)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["delete"], url_path="fungi")
    def remove_fungi(self, request, pk=None):

        fungicide = self.get_object()
        fungus_ids = request.data.get("data", [])

        fungi = Fungus.objects.filter(id__in=fungus_ids)
        fungicide.fungi.remove(*fungi)
        return Response(status=status.HTTP_204_NO_CONTENT)


class SizeViewSet(NestedViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer


class FeedingViewSet(NestedViewSet):
    queryset = Feeding.objects.all()
    serializer_class = FeedingSerializer


class FoliageViewSet(NestedViewSet):
    queryset = Foliage.objects.all()
    serializer_class = FoliageSerializer


class RosePesticideViewSet(NestedViewSet):
    queryset = RosePesticide.objects.all()
    serializer_class = RosePesticideSerializer


class RoseFungicideViewSet(NestedViewSet):
    queryset = RoseFungicide.objects.all()
    serializer_class = RoseFungicideSerializer


class RosePhotoViewSet(NestedViewSet):
    queryset = RosePhoto.objects.all()
    serializer_class = RosePhotoSerializer


class VideoViewSet(NestedViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer


class AdjustmentsViewSet(viewsets.ViewSet):
    """Bulk endpoint"""

    def list(self, request):
        return Response(
            {
                "groups": GroupSerializer(
                    Group.objects.annotate(rose_count=Count("roses")), many=True
                ).data,
                "breeders": BreederSerializer(Breeder.objects.all(), many=True).data,
                "pests": PestSerializer(Pest.objects.all(), many=True).data,
                "fungi": FungusSerializer(Fungus.objects.all(), many=True).data,
                "pesticides": PesticideSerializer(
                    Pesticide.objects.prefetch_related("pests"), many=True
                ).data,
                "fungicides": FungicideSerializer(
                    Fungicide.objects.prefetch_related("fungi"), many=True
                ).data,
            }
        )
