import pytest
from decimal import Decimal
from datetime import date
from common.utils import dynamic_serializer
from django.db.models import Count
from roses.serializers import (
    GroupSerializer,
    PesticideSerializer,
    FungicideSerializer,
    FeedingSerializer,
    FoliageSerializer,
    SizeSerializer,
)
from roses.models import Rose, Group, Feeding, Foliage, Pest, Fungus


class TestDynamicSerializer:
    def test_dynamic_serializer_creation(self):
        serializer_class = dynamic_serializer(Feeding)

        assert serializer_class.Meta.model == Feeding
        assert serializer_class.Meta.many == False
        assert serializer_class.Meta.read_only == False
        assert serializer_class.Meta.exclude == []

        serializer_class = dynamic_serializer(
            Feeding, exclude=["id", "rose"], _many=True, _read_only=True
        )

        assert serializer_class.Meta.model == Feeding
        assert serializer_class.Meta.many == True
        assert serializer_class.Meta.read_only == True
        assert serializer_class.Meta.exclude == ["id", "rose"]

    @pytest.mark.django_db
    def test_dynamic_serializer_with_data(self, rose, feeding):

        FeedingSerializer = dynamic_serializer(Feeding)
        serializer = FeedingSerializer(feeding)

        data = serializer.data
        assert "rose" in data
        assert "basal" in data
        assert data["basal"] == "fancy basal fertilizer"

        FeedingSerializer = dynamic_serializer(Feeding, exclude=["basal"])
        serializer = FeedingSerializer(feeding)
        data = serializer.data

        assert "rose" in data
        assert "basal" not in data

        feedings = Feeding.objects.filter(rose=rose)
        FeedingSerializer = dynamic_serializer(Feeding, _many=True)
        serializer = FeedingSerializer(feedings, many=True)

        data = serializer.data
        assert isinstance(data, list)
        assert len(data) == feedings.count()

    @pytest.mark.django_db
    def test_dynamic_serializer_create(self, rose):

        feeding_data = {
            "rose": rose.id,
            "basal": "fancy basal fertilizer",
            "basal_time": "2023-08-10",
            "leaf": "fancy leaf fertilizer",
            "leaf_time": "2023-08-15",
        }

        FeedingSerializer = dynamic_serializer(Feeding)
        serializer = FeedingSerializer(data=feeding_data)

        assert serializer.is_valid()

        feeding = serializer.save()

        assert feeding.rose == rose
        assert feeding.basal == "fancy basal fertilizer"
        assert feeding.leaf == "fancy leaf fertilizer"

        assert Feeding.objects.filter(id=feeding.id).exists()

    @pytest.mark.parametrize("model_class", [Feeding, Foliage, Pest, Fungus])
    def test_dynamic_serializer_with_different_models(self, model_class):
        serializer_class = dynamic_serializer(model_class)

        assert serializer_class.Meta.model == model_class

        model_fields = [field.name for field in model_class._meta.fields]
        serializer_instance = serializer_class()
        serializer_fields = serializer_instance.get_fields()

        for field_name in model_fields:
            if field_name not in serializer_class.Meta.exclude:
                assert field_name in serializer_fields


@pytest.mark.django_db
class TestGroupSerializer:

    def test_serializer_check_expected_fields(self, group):
        serializer = GroupSerializer(instance=group)
        data = serializer.data

        assert list(data.keys()) == ["id", "name", "rose_count"]
        assert data["rose_count"] == 0

    def test_rose_count_calculation(self, group, breeder):
        Rose.objects.create(
            title="fancy rose 1",
            title_eng="fancy rose 1 in eng",
            group=group,
            breeder=breeder,
        )
        Rose.objects.create(
            title="fancy rose 2",
            title_eng="fancy rose 2 in eng",
            group=group,
            breeder=breeder,
        )

        group = Group.objects.annotate(rose_count=Count("roses")).get(id=group.id)
        serializer = GroupSerializer(instance=group)

        assert serializer.data["rose_count"] == 2


@pytest.mark.django_db
class TestPesticideSerializer:

    def test_serializer_check_expected_fields(self, pesticide):
        serializer = PesticideSerializer(instance=pesticide)
        data = serializer.data

        expected_fields = {"id", "name", "pests"}
        assert set(data.keys()) == expected_fields

    def test_serializer_pest_data(self, pesticide):
        serializer = PesticideSerializer(instance=pesticide)
        data = serializer.data

        assert "pests" in data
        assert isinstance(data["pests"], list)
        assert len(data["pests"]) == 1
        assert data["pests"][0]["name"] == "fancy pest"

    def test_create_pesticide(self, rose, pest):

        data = {
            "name": "new pesticide treatment",
            "pest_ids": [pest.id],
        }

        serializer = PesticideSerializer(data=data)
        assert serializer.is_valid(), f"Errors: {serializer.errors}"

        instance = serializer.save()
        assert instance.name == "new pesticide treatment"
        assert pest in instance.pests.all()

    def test_update_pesticide(self, pesticide, pest):
        data = {
            "name": "updated pesticide name",
            "pest_ids": [pest.id],
        }

        serializer = PesticideSerializer(instance=pesticide, data=data)
        assert serializer.is_valid()

        updated_instance = serializer.save()
        assert updated_instance.name == "updated pesticide name"
        assert pest in updated_instance.pests.all()


@pytest.mark.django_db
class TestFungicideSerializer:

    def test_serializer_contains_expected_fields(self, fungicide):
        serializer = FungicideSerializer(instance=fungicide)
        data = serializer.data
        expected_fields = {"id", "name", "fungi"}
        assert set(data.keys()) == expected_fields

    def test_serializer_fungus_data(self, fungicide):
        serializer = FungicideSerializer(instance=fungicide)
        data = serializer.data

        assert "fungi" in data
        assert isinstance(data["fungi"], list)
        assert len(data["fungi"]) == 1
        assert data["fungi"][0]["name"] == "fancy fungus"

    def test_create_fungicide(self, fungus):
        data = {
            "name": "new fungicide treatment",
            "fungi_ids": [fungus.id],
        }

        serializer = FungicideSerializer(data=data)
        assert serializer.is_valid(), f"Errors: {serializer.errors}"

        instance = serializer.save()
        assert instance.name == "new fungicide treatment"
        assert fungus in instance.fungi.all()

    def test_update_fungicide(self, fungicide, fungus):
        data = {
            "name": "updated fungicide name",
            "fungi_ids": [fungus.id],
        }

        serializer = FungicideSerializer(instance=fungicide, data=data)
        assert serializer.is_valid()

        updated_instance = serializer.save()
        assert updated_instance.name == "updated fungicide name"
        assert fungus in updated_instance.fungi.all()


@pytest.mark.django_db
class TestFeedingSerializer:

    def test_serializer_contains_expected_fields(self, feeding):
        serializer = FeedingSerializer(instance=feeding)
        data = serializer.data

        assert set(data.keys()) == set(
            ["id", "rose", "basal", "basal_time", "leaf", "leaf_time"]
        )

    def test_serializer_values(self, feeding):
        serializer = FeedingSerializer(instance=feeding)
        data = serializer.data

        assert data["basal"] == "fancy basal fertilizer"
        assert data["basal_time"] == "2023-06-10"
        assert data["leaf"] == "fancy leaf fertilizer"
        assert data["leaf_time"] == "2023-06-20"

    def test_create_feeding(self, rose):
        data = {
            "rose": rose.id,
            "basal": "new basal fertilizer",
            "basal_time": "2023-08-05",
            "leaf": "new leaf fertilizer",
            "leaf_time": "2023-08-15",
        }

        serializer = FeedingSerializer(data=data)
        assert serializer.is_valid()

        instance = serializer.save()
        assert instance.rose.id == rose.id
        assert instance.basal == "new basal fertilizer"
        assert instance.basal_time == date(2023, 8, 5)
        assert instance.leaf == "new leaf fertilizer"
        assert instance.leaf_time == date(2023, 8, 15)

    def test_update_feeding(self, feeding):
        data = {
            "rose": feeding.rose.id,
            "basal": "updated basal fertilizer",
            "basal_time": "2023-09-05",
            "leaf": "updated leaf fertilizer",
            "leaf_time": "2023-09-15",
        }

        serializer = FeedingSerializer(instance=feeding, data=data)
        assert serializer.is_valid()

        updated_instance = serializer.save()
        assert updated_instance.basal == "updated basal fertilizer"
        assert updated_instance.basal_time == date(2023, 9, 5)
        assert updated_instance.leaf == "updated leaf fertilizer"
        assert updated_instance.leaf_time == date(2023, 9, 15)


@pytest.mark.django_db
class TestFoliageSerializer:

    def test_serializer_contains_expected_fields(self, foliage):
        serializer = FoliageSerializer(instance=foliage)
        data = serializer.data

        assert set(data.keys()) == set(["id", "rose", "foliage", "foliage_time"])

    def test_serializer_values(self, foliage):
        serializer = FoliageSerializer(instance=foliage)
        data = serializer.data

        assert data["foliage"] == "some tasty beer"
        assert data["foliage_time"] == "2023-07-05"

    def test_create_foliage(self, rose):
        data = {
            "rose": rose.id,
            "foliage": "new foliage description",
            "foliage_time": "2023-08-25",
        }

        serializer = FoliageSerializer(data=data)
        assert serializer.is_valid()

        instance = serializer.save()
        assert instance.rose.id == rose.id
        assert instance.foliage == "new foliage description"
        assert instance.foliage_time == date(2023, 8, 25)

    def test_update_foliage(self, foliage):
        data = {
            "rose": foliage.rose.id,
            "foliage": "updated foliage description",
            "foliage_time": "2023-09-25",
        }

        serializer = FoliageSerializer(instance=foliage, data=data)
        assert serializer.is_valid()

        updated_instance = serializer.save()
        assert updated_instance.foliage == "updated foliage description"
        assert updated_instance.foliage_time == date(2023, 9, 25)


@pytest.mark.django_db
class TestSizeSerializer:

    def test_serializer_contains_expected_fields(self, size):
        serializer = SizeSerializer(instance=size)
        data = serializer.data

        assert set(data.keys()) == set(["id", "rose", "height", "width", "date_added"])

    def test_serializer_values(self, size):
        serializer = SizeSerializer(instance=size)
        data = serializer.data

        assert data["height"] == "30.20"
        assert data["width"] == "25.50"
        assert data["date_added"] == "2023-08-20"

    def test_create_size(self, rose):
        data = {
            "rose": rose.id,
            "height": "40.5",
            "width": "35.7",
            "date_added": "2023-08-30",
        }

        serializer = SizeSerializer(data=data)
        assert serializer.is_valid()

        instance = serializer.save()
        assert instance.rose.id == rose.id
        assert instance.height == Decimal("40.5")
        assert instance.width == Decimal("35.7")
        assert instance.date_added == date(2023, 8, 30)

    def test_update_size(self, size):
        data = {
            "rose": size.rose.id,
            "height": "45.8",
            "width": "38.2",
            "date_added": "2023-09-30",
        }

        serializer = SizeSerializer(instance=size, data=data)
        assert serializer.is_valid()

        updated_instance = serializer.save()
        assert updated_instance.height == Decimal("45.8")
        assert updated_instance.width == Decimal("38.2")
        assert updated_instance.date_added == date(2023, 9, 30)

    def test_read_only_id_field(self, size):
        data = {
            "id": "poop",
            "rose": size.rose.id,
            "height": "50.0",
            "width": "40.0",
            "date_added": "2023-10-01",
        }

        serializer = SizeSerializer(instance=size, data=data)
        assert serializer.is_valid()

        updated_instance = serializer.save()
        assert updated_instance.id == size.id
