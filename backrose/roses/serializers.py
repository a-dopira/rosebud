from rest_framework import serializers
from common.utils import all_fields_serializer
from .mixins import OrderedRepresentationMixin
from .models import Group, Breeder, Pest, Pesticide, Fungus, Fungicide, Size, Feeding, RosePhoto, Video, Foliage, Rose


class PesticideSerializer(serializers.ModelSerializer):

    pest = all_fields_serializer(Pest)
    pest_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Pesticide
        fields = '__all__'


class FungicideSerializer(serializers.ModelSerializer):

    FungusSerializer = all_fields_serializer(Fungus)

    fungicide = FungusSerializer(read_only=True)
    fungicide_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Fungicide
        fields = '__all__'


class FeedingSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Feeding
        fields = '__all__'


class FoliageSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Foliage
        fields = '__all__'


class SizeSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Size
        fields = ['id', 'rose', 'height', 'width', 'date_added']
        read_only_fields = ['id']


class RoseSerializer(OrderedRepresentationMixin, serializers.ModelSerializer):

    new_order = ['id', 'title', 'title_eng', 'group', 'group_name', 'breeder', 'breeder_name', 'photo', 'description', 
                 'landing_date', 'observation', 'susceptibility', 'const_width', 'const_height', 'feedings', 'foliages', 
                 'sizes', 'pesticides', 'fungicides', 'rosephotos', 'videos']

    breeder = serializers.PrimaryKeyRelatedField(queryset=Breeder.objects.all())
    group = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all())
    breeder_name = serializers.CharField(source='breeder.name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    pesticides = PesticideSerializer(many=True, read_only=True)
    fungicides =FungicideSerializer(many=True, read_only=True)

    feedings = all_fields_serializer(Feeding)
    foliages = all_fields_serializer(Foliage)
    rosephotos = all_fields_serializer(RosePhoto)
    sizes = all_fields_serializer(Size)
    videos = all_fields_serializer(Video)
    
    class Meta:
        model = Rose
        exclude = ('slug',)
        

class RoseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rose
        fields = ['id', 'title', 'photo', 'group']

    
class GroupSerializer(serializers.ModelSerializer):
    rose_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'rose_count']