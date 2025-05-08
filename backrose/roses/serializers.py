from rest_framework import serializers
from common.utils import dynamic_serializer
from .models import (
    Group,
    Breeder,
    Pest,
    Pesticide,
    Fungus,
    Fungicide,
    Size,
    Feeding,
    RosePhoto,
    Video,
    Foliage,
    Rose,
)


class PesticideSerializer(serializers.ModelSerializer):

    PestSerializer = dynamic_serializer(Pest)

    pest = PestSerializer(read_only=True)
    pest_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Pesticide
        fields = "__all__"


class FungicideSerializer(serializers.ModelSerializer):

    FungusSerializer = dynamic_serializer(Fungus)

    fungicide = FungusSerializer(read_only=True)
    fungicide_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Fungicide
        fields = "__all__"


class FeedingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Feeding
        fields = "__all__"


class FoliageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Foliage
        fields = "__all__"


class SizeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Size
        fields = ["id", "rose", "height", "width", "date_added"]
        read_only_fields = ["id"]


class RoseSerializer(serializers.ModelSerializer):
    breeder = serializers.PrimaryKeyRelatedField(queryset=Breeder.objects.all())
    group = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all())
    breeder_name = serializers.CharField(source="breeder.name", read_only=True)
    group_name = serializers.CharField(source="group.name", read_only=True)

    pesticides = PesticideSerializer(many=True, read_only=True)
    fungicides = FungicideSerializer(many=True, read_only=True)
    feedings = dynamic_serializer(Feeding)(many=True, read_only=True)
    foliages = dynamic_serializer(Foliage)(many=True, read_only=True)
    rosephotos = dynamic_serializer(RosePhoto)(many=True, read_only=True)
    sizes = dynamic_serializer(Size)(many=True, read_only=True)
    videos = dynamic_serializer(Video)(many=True, read_only=True)

    class Meta:
        model = Rose
        fields = [
            "id",
            "title",
            "title_eng",
            "group",
            "group_name",
            "breeder",
            "breeder_name",
            "photo",
            "description",
            "landing_date",
            "observation",
            "susceptibility",
            "const_width",
            "const_height",
            "feedings",
            "foliages",
            "sizes",
            "pesticides",
            "fungicides",
            "rosephotos",
            "videos",
        ]


class RoseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rose
        fields = ["id", "title", "photo", "group"]


class GroupSerializer(serializers.ModelSerializer):
    rose_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Group
        fields = ["id", "name", "rose_count"]
