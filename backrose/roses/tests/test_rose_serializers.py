import pytest
from roses.models import Rose
from roses.serializers import RoseSerializer, RoseListSerializer

pytestmark = pytest.mark.django_db


class TestRoseSerializer:

    def test_expected_fields(self, rose_with_relations):
        serializer = RoseSerializer(instance=rose_with_relations)
        data = serializer.data

        expected_fields = set(field for field in RoseSerializer.Meta.fields)

        for field in expected_fields:
            assert field in data

    def test_related_fields_data(self, rose_with_relations):

        serializer = RoseSerializer(instance=rose_with_relations)
        data = serializer.data

        assert data["title"] == "fancy rose"
        assert data["title_eng"] == "fancy rose in english"
        assert data["breeder_name"] == "fancy breeder"
        assert data["group_name"] == "fancy group"

        assert len(data["pesticides"]) == 1
        assert data["pesticides"][0]["name"] == "fancy pesticide treatment"
        assert data["pesticides"][0]["pest"]["name"] == "fancy pest"

        assert len(data["fungicides"]) == 1
        assert data["fungicides"][0]["name"] == "fancy fungicide treatment"
        assert data["fungicides"][0]["fungicide"]["name"] == "fancy fungus"

        assert len(data["feedings"]) == 1
        assert data["feedings"][0]["basal"] == "fancy basal fertilizer"
        assert data["feedings"][0]["leaf"] == "fancy leaf fertilizer"

        assert len(data["foliages"]) == 1
        assert data["foliages"][0]["foliage"] == "some tasty beer"

        assert len(data["rosephotos"]) == 1
        assert data["rosephotos"][0]["descr"] == "fancy photo description"
        assert data["rosephotos"][0]["year"] == 2023

        assert len(data["sizes"]) == 1
        assert data["sizes"][0]["width"] == "25.50"
        assert data["sizes"][0]["height"] == "30.20"

        assert len(data["videos"]) == 1
        assert data["videos"][0]["video"] == "https://example.com/test-video"
        assert data["videos"][0]["descr"] == "fancy video description"

    def test_create_rose(self, breeder, group, fancy_image):
        """Тест создания розы через сериализатор"""

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

        serializer = RoseSerializer(data=data)
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

        serializer = RoseSerializer(instance=rose, data=data, partial=True)
        assert serializer.is_valid(), f"Ошибки валидации: {serializer.errors}"

        updated_rose = serializer.save()
        assert updated_rose.title == "Updated Rose"
        assert updated_rose.title_eng == "Updated Rose English"
        assert updated_rose.description == "Updated Description"
        assert updated_rose.slug == "updated-rose"

    def test_default_photo_value(self):

        rose_without_photo = Rose.objects.create(
            title="rose without photo",
            title_eng="rose without photo in english",
        )

        serializer = RoseListSerializer(instance=rose_without_photo)
        data = serializer.data

        assert data["photo"] == "/media/images/cap_rose.png"


class TestRoseListSerializer:

    def test_serializer_list_of_roses(self, rose, group):

        rose2 = Rose.objects.create(
            title="second rose",
            title_eng="second rose in english",
            photo="images/cap_rose.png",
            group=group,
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
