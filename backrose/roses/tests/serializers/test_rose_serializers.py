import pytest
from roses.models import Rose
from roses.serializers import RoseSerializer, RoseListSerializer, RoseCreateSerializer

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestRoseSerializer:

    def test_nested_relations(self, rose_with_relations):
        serializer = RoseSerializer(instance=rose_with_relations)
        data = serializer.data

        assert "breeder" in data and isinstance(data["breeder"], dict)
        assert "group" in data and isinstance(data["group"], dict)

        nested_lists = [
            "feedings",
            "foliages",
            "photos",
            "sizes",
            "videos",
            "pesticides",
            "fungicides",
        ]
        for field in nested_lists:
            assert field in data and isinstance(data[field], list)

    def test_default_photo_behavior(self, breeder, group):
        rose_without_photo = Rose.objects.create(
            title="rose without photo",
            title_eng="rose without photo in english",
            breeder=breeder,
            group=group,
        )

        serializer = RoseListSerializer(instance=rose_without_photo)
        assert serializer.data["photo"] == "/media/images/cap_rose.png"


@pytest.mark.django_db
class TestRoseCreateSerializer:

    def test_create_rose(self, breeder, group, fancy_image):

        data = {
            "title": "fancy rose",
            "title_eng": "fancy rose in english",
            "group": group.id,
            "breeder": breeder.id,
            "photo": fancy_image,
            "description": "fancy rose description",
            "const_width": "12.5",
            "const_height": "18.2",
        }

        serializer = RoseCreateSerializer(data=data)
        assert serializer.is_valid(), f"Validation errors: {serializer.errors}"

        rose = serializer.save()
        assert rose.title == "fancy rose"
        assert rose.breeder == breeder
        assert rose.group == group
        assert rose.slug == "fancy-rose"


@pytest.mark.django_db
class TestRoseListSerializer:

    def test_minimal_fields_only(self, rose):
        serializer = RoseListSerializer(instance=rose)
        data = serializer.data

        assert set(data.keys()) == {"id", "title", "photo", "group"}

        detailed_fields = ["feedings", "foliages", "pesticides", "description"]
        for field in detailed_fields:
            assert field not in data


@pytest.mark.django_db
@pytest.mark.parametrize(
    "serializer_class,action,expected_fields",
    [
        (RoseListSerializer, "list", {"id", "title", "photo", "group"}),
        (
            RoseCreateSerializer,
            "create",
            {"id", "title", "title_eng", "group", "breeder", "photo"},
        ),
    ],
)
def test_serializer_field_selection(rose, serializer_class, action, expected_fields):

    serializer = serializer_class(instance=rose)
    data_fields = set(serializer.data.keys())

    assert expected_fields.issubset(data_fields)
