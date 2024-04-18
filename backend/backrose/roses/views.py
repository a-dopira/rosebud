from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend, CharFilter, FilterSet
from rest_framework import viewsets, status
from django.db import IntegrityError

from .pagination import StandardResultsSetPagination
from .models import Group, Breeder, Rose, Pest, Pesticide, Fungus, Fungicide, Size, Feeding, RosePhoto, Video, Foliage
from .serializers import GroupSerializer, RoseSerializer, RoseListSerializer, BreederSerializer, PestSerializer, PesticideSerializer, FungicideSerializer, FungusSerializer, SizeSerializer, FeedingSerializer, RosePhotoSerializer, VideoSerializer, FoliageSerializer

class RoseFilter(FilterSet):
    title = CharFilter(lookup_expr='iregex')
    title_eng = CharFilter(lookup_expr='iregex')

    class Meta:
        model = Rose
        fields = ['title', 'title_eng', 'group']

class BreederViewSet(viewsets.ModelViewSet):
    queryset = Breeder.objects.all()
    serializer_class = BreederSerializer
    permission_classes = [IsAuthenticated]


class RoseViewSet(viewsets.ModelViewSet):
    queryset = Rose.objects.all()
    serializer_class = RoseSerializer
    paginator_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['title', 'title_eng', 'group']
    filterset_class = RoseFilter

    def get_serializer_class(self):
        if self.action == 'list':
            return RoseListSerializer
        return RoseSerializer
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {'id': instance.id, 'title': instance.title}
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
            return Response({"detail": "Роза с таким title или title_eng уже существует."}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['delete'], url_path='delete_photo')
    def delete_photo(self, request, pk=None):
        rose = self.get_object()
        rose.photo.delete()  # Удаление фотографии
        rose.photo = 'images/cap_rose.png'  # Установка заглушки
        rose.save()
        return Response({'detail': 'Фото удалено', 'photo': rose.photo.url}, status=status.HTTP_200_OK)
        

class PestViewSet(viewsets.ModelViewSet):
    queryset = Pest.objects.all()
    serializer_class = PestSerializer
    permission_classes = [IsAuthenticated]


class PesticideViewSet(viewsets.ModelViewSet):
    queryset = Pesticide.objects.all()
    serializer_class = PesticideSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {'id': instance.id, 'name': instance.name}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    filter_fields = ['name']

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def names(self, request):
        group_names = Group.objects.values_list('id', 'name')
        return Response(group_names)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def roses(self, request, pk=None):
        group = self.get_object()
        roses = group.roses.values_list('id', 'title', 'photo', 'group')
        return Response(roses)


class FungusViewSet(viewsets.ModelViewSet):
    queryset = Fungus.objects.all()
    serializer_class = FungusSerializer
    permission_classes = [IsAuthenticated]


class FungicideViewSet(viewsets.ModelViewSet):
    queryset = Fungicide.objects.all()
    serializer_class = FungicideSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {'id': instance.id, 'name': instance.name}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class SizeViewSet(viewsets.ModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {'id': instance.id, 'name': 'размеры'}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class FeedingViewSet(viewsets.ModelViewSet):
    queryset = Feeding.objects.all()
    serializer_class = FeedingSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {'id': instance.id, 'name': instance.basal}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)


class RosePhotoViewSet(viewsets.ModelViewSet):
    queryset = RosePhoto.objects.all()
    serializer_class = RosePhotoSerializer
    permission_classes = [IsAuthenticated]


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]


class FoliageViewSet(viewsets.ModelViewSet):
    queryset = Foliage.objects.all()
    serializer_class = FoliageSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {'id': instance.id, 'name': instance.foliage}
        self.perform_destroy(instance)
        return Response(data, status=status.HTTP_200_OK)