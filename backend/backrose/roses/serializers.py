from rest_framework import serializers
from .mixins import OrderedRepresentationMixin
from .models import Group, Breeder, Pest, Pesticide, Fungus, Fungicide, Size, Feeding, RosePhoto, Video, Foliage, Rose


class PestSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Pest
        fields = ['id', 'name']


class PesticideSerializer(serializers.ModelSerializer):
    pest = PestSerializer(read_only=True)
    pest_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Pesticide
        fields = ['id', 'pest', 'pest_id', 'rose', 'name', 'date_added']


class FungusSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Fungus
        fields = ['id', 'name']


class FungicideSerializer(serializers.ModelSerializer):
    fungicide = FungusSerializer(read_only=True)
    fungicide_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Fungicide
        fields = ['id', 'fungicide', 'fungicide_id', 'rose', 'name', 'date_added']


class SizeSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Size
        fields = ['id', 'rose', 'height', 'width']
        read_only_fields = ['id', 'rose']


class FeedingSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Feeding
        fields = '__all__'


class RosePhotoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = RosePhoto
        fields = '__all__'


class VideoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Video
        fields = '__all__'


class FoliageSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Foliage
        fields = '__all__'


class BreederSerializer(serializers.ModelSerializer):

    class Meta:
        model = Breeder
        exclude = ('slug',)


class RoseSerializer(OrderedRepresentationMixin, serializers.ModelSerializer):

    new_order = ['id', 'title', 'title_eng', 'group', 'group_name', 'breeder', 'breeder_name', 'photo', 'description', 'landing_date', 
                 'observation', 'susceptibility', 'const_width', 'const_height', 'feedings', 'foliages', 
                 'sizes', 'pesticides', 'fungicides', 'rosephotos', 'videos']

    breeder = serializers.PrimaryKeyRelatedField(queryset=Breeder.objects.all())
    group = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all())
    group_name = serializers.CharField(source='group.name', read_only=True)
    breeder_name = serializers.CharField(source='breeder.name', read_only=True)

    feedings = FeedingSerializer(many=True, read_only=True)
    foliages = FoliageSerializer(many=True, read_only=True)
    sizes = SizeSerializer(many=True, read_only=True)
    pesticides = PesticideSerializer(many=True, read_only=True)
    fungicides =FungicideSerializer(many=True, read_only=True)
    rosephotos = RosePhotoSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Rose
        exclude = ('slug',)
        

class RoseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rose
        fields = ['id', 'title', 'photo', 'group']

    
class GroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = Group
        fields = ['id', 'name']