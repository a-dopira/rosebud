import pytest
from roses.models import Rose, Breeder
from roses.serializers import RoseSerializer, RoseListSerializer, RoseCreateSerializer

pytestmark = pytest.mark.django_db


class TestRoseSerializer:

    def test_expected_fields(self, rose_with_relations):
        serializer = RoseSerializer(instance=rose_with_relations)
        data = serializer.data

        expected_fields = set(RoseSerializer.Meta.fields)

        for field in expected_fields:
            assert field in data

    def test_related_fields_data(self, rose_with_relations):
        serializer = RoseSerializer(instance=rose_with_relations)
        data = serializer.data

        assert data["title"] == "fancy rose"
        assert data["title_eng"] == "fancy rose in english"
        assert data["breeder"]["name"] == "fancy breeder"
        assert data["group"]["name"] == "fancy group"

        assert len(data["feedings"]) == 1
        assert data["feedings"][0]["basal"] == "fancy basal fertilizer"
        assert data["feedings"][0]["leaf"] == "fancy leaf fertilizer"

        assert len(data["foliages"]) == 1
        assert data["foliages"][0]["foliage"] == "some tasty beer"

        assert len(data["photos"]) == 1
        assert data["photos"][0]["descr"] == "fancy photo description"
        assert data["photos"][0]["year"] == 2023

        assert len(data["sizes"]) == 1
        assert data["sizes"][0]["width"] == "25.50"
        assert data["sizes"][0]["height"] == "30.20"

        assert len(data["videos"]) == 1
        assert data["videos"][0]["video"] == "https://example.com/test-video"
        assert data["videos"][0]["descr"] == "fancy video description"

        if len(data["rosepesticides"]) > 0:
            assert (
                data["rosepesticides"][0]["pesticide"]["name"]
                == "fancy pesticide treatment"
            )
            assert len(data["rosepesticides"][0]["pesticide"]["pests"]) == 1
            assert (
                data["rosepesticides"][0]["pesticide"]["pests"][0]["name"]
                == "fancy pest"
            )

        if len(data["rosefungicides"]) > 0:
            assert (
                data["rosefungicides"][0]["fungicide"]["name"]
                == "fancy fungicide treatment"
            )
            assert len(data["rosefungicides"][0]["fungicide"]["fungi"]) == 1
            assert (
                data["rosefungicides"][0]["fungicide"]["fungi"][0]["name"]
                == "fancy fungus"
            )

    def test_create_rose(self, breeder, group, fancy_image):
        data = {
            "title": "New fancy rose",
            "title_eng": "New fancy rose in english",
            "group": group.id,
            "breeder": breeder.id,
            "photo": fancy_image,
            "description": "New Description",
            "landing_date": "2023-05-20",
            "observation": "New Observation",
            "susceptibility": "Medium",
            "const_width": "12.5",
            "const_height": "18.2",
        }

        serializer = RoseCreateSerializer(data=data)
        assert serializer.is_valid(), f"Ошибки валидации: {serializer.errors}"

        rose = serializer.save()
        assert rose.title == "New fancy rose"
        assert rose.title_eng == "New fancy rose in english"
        assert rose.breeder == breeder
        assert rose.group == group
        assert rose.description == "New Description"

    def test_update_rose(self, rose):
        data = {
            "title": "Updated Rose",
            "title_eng": "Updated Rose English",
            "group": rose.group.id,
            "breeder": rose.breeder.id,
            "description": "Updated Description",
        }

        serializer = RoseCreateSerializer(instance=rose, data=data, partial=True)
        assert serializer.is_valid(), f"Ошибки валидации: {serializer.errors}"

        updated_rose = serializer.save()
        assert updated_rose.title == "Updated Rose"
        assert updated_rose.title_eng == "Updated Rose English"
        assert updated_rose.description == "Updated Description"
        assert updated_rose.slug == "updated-rose"

    def test_default_photo_value(self, breeder, group):
        rose_without_photo = Rose.objects.create(
            title="rose without photo",
            title_eng="rose without photo in english",
            breeder=breeder,
            group=group,
        )

        serializer = RoseListSerializer(instance=rose_without_photo)
        data = serializer.data

        assert data["photo"] == "/media/images/cap_rose.png"


class TestRoseListSerializer:

    def test_serializer_list_of_roses(self, rose, group):
        breeder2 = Breeder.objects.create(name="second breeder")

        rose2 = Rose.objects.create(
            title="second rose",
            title_eng="second rose in english",
            photo="images/cap_rose.png",
            group=group,
            breeder=breeder2,
        )

        roses = Rose.objects.all()
        serializer = RoseListSerializer(roses, many=True)
        data = serializer.data

        assert len(data) == 2
        for item in data:
            assert set(item.keys()) == {"id", "title", "photo", "group"}
            assert isinstance(item["photo"], str)

    def test_list_serializer_contains_expected_fields(self, rose):
        serializer = RoseListSerializer(instance=rose)
        data = serializer.data

        expected_fields = ["id", "title", "photo", "group"]

        for field in expected_fields:
            assert field in data

        excluded_fields = ["title_eng", "breeder", "description", "landing_date"]

        for field in excluded_fields:
            assert field not in data


@pytest.mark.django_db
class TestRoseCreateSerializer:

    def test_create_serializer_fields(self):
        serializer = RoseCreateSerializer()
        expected_fields = {
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
        }
        assert set(serializer.fields.keys()) == expected_fields

    def test_create_rose(self, breeder, group, fancy_image):
        data = {
            "title": "test rose",
            "title_eng": "test rose eng",
            "group": group.id,
            "breeder": breeder.id,
            "photo": fancy_image,
            "description": "test description",
        }
        serializer = RoseCreateSerializer(data=data)
        assert serializer.is_valid(), f"Errors: {serializer.errors}"

        instance = serializer.save()
        assert instance.title == "test rose"
