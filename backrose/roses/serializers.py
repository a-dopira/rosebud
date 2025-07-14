from rest_framework import serializers
from common.utils import dynamic_serializer
from .models import (
    Group,
    Breeder,
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
    Rose,
)


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name"]


class BreederSerializer(serializers.ModelSerializer):
    class Meta:
        model = Breeder
        fields = ["id", "name"]


class PesticideSerializer(serializers.ModelSerializer):
    PestSerializer = dynamic_serializer(Pest)
    pests = PestSerializer(many=True, read_only=True)
    pest_ids = serializers.PrimaryKeyRelatedField(
        source="pests",
        queryset=Pest.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )

    class Meta:
        model = Pesticide
        fields = ["id", "name", "pests", "pest_ids"]

    def create(self, validated_data):
        pests_data = validated_data.pop("pests", [])
        pesticide = Pesticide.objects.create(**validated_data)
        if pests_data:
            pesticide.pests.set(pests_data)
        return pesticide

    def update(self, instance, validated_data):
        pests_data = validated_data.pop("pests", None)
        instance.name = validated_data.get("name", instance.name)

        if pests_data is not None:
            instance.pests.set(pests_data)

        instance.save()
        return instance


class FungicideSerializer(serializers.ModelSerializer):
    FungusSerializer = dynamic_serializer(Fungus)
    fungi = FungusSerializer(many=True, read_only=True)
    fungi_ids = serializers.PrimaryKeyRelatedField(
        source="fungi",
        queryset=Fungus.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )

    class Meta:
        model = Fungicide
        fields = ["id", "name", "fungi", "fungi_ids"]

    def create(self, validated_data):
        fungi_data = validated_data.pop("fungi", [])
        fungicide = Fungicide.objects.create(**validated_data)
        if fungi_data:
            fungicide.fungi.set(fungi_data)
        return fungicide

    def update(self, instance, validated_data):
        fungi_data = validated_data.pop("fungi", None)
        instance.name = validated_data.get("name", instance.name)

        if fungi_data is not None:
            instance.fungi.set(fungi_data)

        instance.save()
        return instance


class RosePesticideSerializer(serializers.ModelSerializer):
    pesticide = PesticideSerializer(read_only=True)
    pesticide_id = serializers.PrimaryKeyRelatedField(
        source="pesticide", queryset=Pesticide.objects.all(), write_only=True
    )

    class Meta:
        model = RosePesticide
        fields = ["id", "pesticide", "pesticide_id", "date_added"]


class RoseFungicideSerializer(serializers.ModelSerializer):
    fungicide = FungicideSerializer(read_only=True)
    fungicide_id = serializers.PrimaryKeyRelatedField(
        source="fungicide", queryset=Fungicide.objects.all(), write_only=True
    )

    class Meta:
        model = RoseFungicide
        fields = ["id", "fungicide", "fungicide_id", "date_added"]


class FeedingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Feeding
        fields = ["id", "basal", "basal_time", "leaf", "leaf_time"]


class FoliageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Foliage
        fields = ["id", "foliage", "foliage_time"]


class SizeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Size
        fields = ["id", "height", "width", "date_added"]
        read_only_fields = ["id"]


class RoseCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Rose
        fields = [
            "id",
            "title",
            "title_eng",
            "group",
            "breeder",
            "photo",
            "description",
            "landing_date",
            "observation",
            "susceptibility",
            "const_width",
            "const_height",
        ]


class RoseSerializer(serializers.ModelSerializer):

    breeder = dynamic_serializer(Breeder, exclude=["slug"])(read_only=True)
    group = dynamic_serializer(Group, exclude=["slug"])(read_only=True)

    pesticides = RosePesticideSerializer(many=True, read_only=True, source='rosepesticides')
    fungicides = RoseFungicideSerializer(many=True, read_only=True, source='rosefungicides') 
    photos = dynamic_serializer(RosePhoto)(many=True, read_only=True, source='rosephotos')
    
    feedings = dynamic_serializer(Feeding)(many=True, read_only=True)
    foliages = dynamic_serializer(Foliage)(many=True, read_only=True)
    sizes = dynamic_serializer(Size)(many=True, read_only=True)
    videos = dynamic_serializer(Video)(many=True, read_only=True)

    class Meta:
        model = Rose
        fields = [
            "id",
            "title",
            "title_eng",
            "group", 
            "breeder",
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
            "photos",
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
