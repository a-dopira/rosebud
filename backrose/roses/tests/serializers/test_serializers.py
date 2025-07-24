import pytest
from decimal import Decimal
from django.db.models import Count
from roses.serializers import (
    GroupSerializer,
    BreederSerializer,
    PesticideSerializer,
    FungicideSerializer,
    PestSerializer,
    FungusSerializer,
    SizeSerializer,
)
from roses.models import Rose, Group


@pytest.mark.django_db
class TestGroupSerializer:
    """testing rose count calculation"""

    def test_rose_count_calculation(self, group, breeder):

        Rose.objects.create(
            title="rose1", title_eng="rose1", group=group, breeder=breeder
        )
        Rose.objects.create(
            title="rose2", title_eng="rose2", group=group, breeder=breeder
        )

        group = Group.objects.annotate(rose_count=Count("roses")).get(id=group.id)
        serializer = GroupSerializer(instance=group)

        assert serializer.data["rose_count"] == 2


@pytest.mark.django_db
class TestPesticideSerializer:
    """many-to-many through pest_ids"""

    def test_create_with_pests(self, pest):
        data = {
            "name": "new pesticide",
            "pest_ids": [pest.id],
        }

        serializer = PesticideSerializer(data=data)
        assert serializer.is_valid(), f"Errors: {serializer.errors}"

        instance = serializer.save()
        assert pest in instance.pests.all()

    def test_nested_pest_data(self, pesticide):
        serializer = PesticideSerializer(instance=pesticide)
        data = serializer.data

        assert "pests" in data
        assert len(data["pests"]) == 1
        assert data["pests"][0]["name"] == "fancy pest"


@pytest.mark.django_db
class TestFungicideSerializer:
    """many-to-many through fungi_ids"""

    def test_create_with_fungi(self, fungus):
        data = {
            "name": "new fungicide",
            "fungi_ids": [fungus.id],
        }

        serializer = FungicideSerializer(data=data)
        assert serializer.is_valid(), f"Errors: {serializer.errors}"

        instance = serializer.save()
        assert fungus in instance.fungi.all()


@pytest.mark.django_db
class TestSizeSerializer:

    def test_read_only_id_field(self, size):
        data = {
            "id": "should_be_ignored",
            "height": "50.0",
            "width": "40.0",
            "date_added": "2023-10-01",
        }

        serializer = SizeSerializer(instance=size, data=data)
        assert serializer.is_valid()

        updated_instance = serializer.save()
        assert updated_instance.id == size.id  # id doesn't change
        assert updated_instance.height == Decimal("50.0")


@pytest.mark.django_db
@pytest.mark.parametrize(
    "serializer_class,fixture_name,expected_fields",
    [
        (BreederSerializer, "breeder", {"id", "name"}),
        (PestSerializer, "pest", {"id", "name"}),
        (FungusSerializer, "fungus", {"id", "name"}),
    ],
)
def test_simple_serializers(request, serializer_class, fixture_name, expected_fields):
    instance = request.getfixturevalue(fixture_name)
    serializer = serializer_class(instance=instance)

    assert set(serializer.data.keys()) == expected_fields
