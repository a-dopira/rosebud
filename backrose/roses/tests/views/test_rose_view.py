import pytest
import json
from django.urls import reverse
from rest_framework import status
from pytils.translit import slugify
from roses.models import Rose

pytestmark = pytest.mark.django_db


class TestRoseViewSet:

    def test_list_roses(self, authenticated_client, create_multiple_roses):
        url = reverse("rose-list")

        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "count" in response.data
        assert "results" in response.data
        assert response.data["count"] == 10
        assert len(response.data["results"]) == 9

    def test_retrieve_rose(self, authenticated_client, rose_with_relations):
        url = reverse("rose-detail", kwargs={"pk": rose_with_relations.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "fancy rose"
        assert response.data["title_eng"] == "fancy rose in english"

        assert response.data["breeder"]["name"] == "fancy breeder"
        assert response.data["group"]["name"] == "fancy group"

        assert response.data["const_width"] == "10.50"
        assert response.data["const_height"] == "15.20"

        assert len(response.data["rosepesticides"]) >= 0
        assert len(response.data["rosefungicides"]) >= 0
        assert len(response.data["feedings"]) == 1
        assert len(response.data["foliages"]) == 1
        assert len(response.data["rosephotos"]) == 1
        assert len(response.data["sizes"]) == 1
        assert len(response.data["videos"]) == 1

    def test_create_rose_success(
        self, authenticated_client, breeder, group, create_image
    ):
        url = reverse("rose-list")
        image = create_image("new_rose.jpg")

        data = {
            "title": "прикольная роза",
            "title_eng": "new fancy rose in english",
            "description": "a very nice rose",
            "landing_date": "2023-07-15",
            "observation": "growing well",
            "susceptibility": "low",
            "const_width": "12.5",
            "const_height": "18.0",
            "breeder": breeder.id,
            "group": group.id,
            "photo": image,
        }

        response = authenticated_client.post(url, data=data, format="multipart")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "прикольная роза"
        assert response.data["title_eng"] == "new fancy rose in english"

        freshly_created_rose = Rose.objects.get(title="прикольная роза")
        assert freshly_created_rose.slug == slugify("прикольная роза")

    def test_create_rose_existing_title(
        self, authenticated_client, rose_with_relations, breeder, group, create_image
    ):
        url = reverse("rose-list")
        image = create_image("dup_rose.jpg")

        data = {
            "title": "fancy rose",  # already existing title
            "title_eng": "new unique rose in english",
            "description": "a duplicate rose",
            "breeder": breeder.id,
            "group": group.id,
            "photo": image,
        }

        response = authenticated_client.post(url, data=data, format="multipart")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "title" in response.data
        assert "already exists" in str(response.data["title"][0])

    def test_create_rose_existing_title_eng(
        self, authenticated_client, rose_with_relations, breeder, group, create_image
    ):
        url = reverse("rose-list")
        image = create_image("dup_eng_rose.jpg")

        data = {
            "title": "unique rose title",
            "title_eng": "fancy rose in english",  # already existing title_eng
            "description": "a duplicate english title rose",
            "breeder": breeder.id,
            "group": group.id,
            "photo": image,
        }

        response = authenticated_client.post(url, data=data, format="multipart")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "title_eng" in response.data
        assert "already exists" in str(response.data["title_eng"][0])

    def test_update_rose_partial(self, authenticated_client, rose_with_relations):
        url = reverse("rose-detail", kwargs={"pk": rose_with_relations.id})

        data = {
            "title": "updated fancy rose",
            "description": "updated fancy description",
        }

        response = authenticated_client.patch(
            url, data=json.dumps(data), content_type="application/json"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "updated fancy rose"
        assert response.data["description"] == "updated fancy description"
        assert response.data["title_eng"] == "fancy rose in english"

    def test_update_rose_full(
        self, authenticated_client, rose_with_relations, breeder, group
    ):
        url = reverse("rose-detail", kwargs={"pk": rose_with_relations.id})

        data = {
            "title": "fully updated rose",
            "title_eng": "fully updated rose in english",
            "description": "fully updated description",
            "landing_date": "2023-09-20",
            "observation": "fully updated observation",
            "susceptibility": "high",
            "const_width": "20.50",
            "const_height": "25.20",
            "breeder": breeder.id,
            "group": group.id,
        }

        response = authenticated_client.put(
            url, data=json.dumps(data), content_type="application/json"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "fully updated rose"
        assert response.data["title_eng"] == "fully updated rose in english"
        assert response.data["description"] == "fully updated description"
        assert response.data["landing_date"] == "2023-09-20"
        assert response.data["observation"] == "fully updated observation"
        assert response.data["susceptibility"] == "high"
        assert response.data["const_width"] == "20.50"
        assert response.data["const_height"] == "25.20"

    def test_update_rose_with_photo(
        self, authenticated_client, rose_with_relations, create_image
    ):
        url = reverse("rose-detail", kwargs={"pk": rose_with_relations.id})
        new_image = create_image("updated_rose.jpg")

        data = {"title": "updated rose with photo", "photo": new_image}

        response = authenticated_client.patch(url, data=data, format="multipart")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "updated rose with photo"
        assert "updated_rose" in response.data["photo"]

    def test_delete_rose(self, authenticated_client, rose_with_relations):
        url = reverse("rose-detail", kwargs={"pk": rose_with_relations.id})

        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == rose_with_relations.id
        assert response.data["title"] == rose_with_relations.title

        get_response = authenticated_client.get(url)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_photo(
        self, authenticated_client, rose_with_relations, create_image
    ):
        update_url = reverse("rose-detail", kwargs={"pk": rose_with_relations.id})
        new_image = create_image("non_default.jpg")

        authenticated_client.patch(
            update_url, data={"photo": new_image}, format="multipart"
        )

        url = reverse("rose-photo", kwargs={"pk": rose_with_relations.id})

        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Фото успешно удалено"

        rose_response = authenticated_client.get(update_url)
        assert "cap_rose.png" in rose_response.data["photo"]

    def test_delete_photo_default(self, authenticated_client, rose):
        rose.photo = "images/cap_rose.png"
        rose.save()

        url = reverse("rose-photo", kwargs={"pk": rose.id})

        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["message"] == "Фото не удалось удалить"

    def test_filter_by_group(self, authenticated_client, create_multiple_roses):
        url = reverse("rose-list")

        filter_url = f"{url}?group=fancy"

        response = authenticated_client.get(filter_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 10
        assert len(response.data["results"]) == 9
        assert response.data["results"][0]["title"] == "fancy_rose_0"

        filter_url = f"{url}?group=nonexistent"

        response = authenticated_client.get(filter_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0
        assert len(response.data["results"]) == 0

    def test_search_filter(
        self, authenticated_client, rose_with_relations, breeder, group, create_image
    ):
        url = reverse("rose-list")
        image = create_image("another_rose.jpg")

        data = {
            "title": "another rose",
            "title_eng": "another rose in english",
            "description": "another description",
            "breeder": breeder.id,
            "group": group.id,
            "photo": image,
        }

        authenticated_client.post(url, data=data, format="multipart")

        search_url = f"{url}?search=fancy"

        response = authenticated_client.get(search_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 2
        assert len(response.data["results"]) == 2
        assert response.data["results"][0]["title"] == "fancy rose"

        search_url = f"{url}?search=english"

        response = authenticated_client.get(search_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 2
        assert len(response.data["results"]) == 2

        search_url = f"{url}?search=breeder"

        response = authenticated_client.get(search_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 2
        assert len(response.data["results"]) == 2

    def test_pagination(
        self, authenticated_client, rose_with_relations, create_multiple_roses
    ):

        url = reverse("rose-list")

        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 11
        assert len(response.data["results"]) == 9

        assert response.data["next"] is not None
        assert response.data["previous"] is None

        page_url = f"{url}?page=2"

        response = authenticated_client.get(page_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 11
        assert len(response.data["results"]) == 2
        assert response.data["next"] is None
        assert response.data["previous"] is not None

        page_size_url = f"{url}?page_size=5"

        response = authenticated_client.get(page_size_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 11
        assert len(response.data["results"]) == 5
        assert response.data["next"] is not None

        max_page_size_url = f"{url}?page_size=20"  # max_page_size = 18

        response = authenticated_client.get(max_page_size_url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) <= 18
        assert response.data["count"] == 11

    def test_invalid_page(
        self, authenticated_client, rose_with_relations, create_multiple_roses
    ):
        url = reverse("rose-list")

        invalid_page_url = f"{url}?page=999"

        response = authenticated_client.get(invalid_page_url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_combined_filtering_and_pagination(
        self, authenticated_client, rose_with_relations, create_multiple_roses
    ):
        url = reverse("rose-list")

        # 1 initial rose
        # + 5 roses with title = 'fancy_rose'
        # + 5 roses with title_eng = 'fancy_rose_in_english' from fixture
        # = 11 roses

        combined_url_page2 = f"{url}?search=fancy_rose&page=1&page_size=3"

        response = authenticated_client.get(combined_url_page2)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 5
        assert len(response.data["results"]) == 3  # set by page_size
        assert response.data["next"] is not None
        assert response.data["previous"] is None

    def test_empty_queryset(self, authenticated_client):
        url = reverse("rose-list")

        filter_url = f"{url}?search=nonexistent_rose"

        response = authenticated_client.get(filter_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0
        assert response.data["results"] == []

    def test_empty_queryset(self, authenticated_client):
        url = reverse("rose-list")

        filter_url = f"{url}?search=nonexistent_rose"

        response = authenticated_client.get(filter_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0
        assert response.data["results"] == []

    def test_unauthorized_access(self, api_client, rose_with_relations):
        url = reverse("rose-list")

        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_nonexistent_rose(self, authenticated_client):
        """Тестирование запроса несуществующей розы"""
        url = reverse("rose-detail", kwargs={"pk": 9999})  # non-existent rose

        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.parametrize(
        "ordering,expected_first_title,expected_last_title",
        [
            ("title", "another rose", "simple_rose_4"),  # ascending
            ("-title", "simple_rose_4", "another rose"),  # descending
        ],
    )
    def test_ordering_roses_parametrized(
        self,
        authenticated_client,
        rose_with_relations,
        create_multiple_roses,
        breeder,
        group,
        create_image,
        ordering,
        expected_first_title,
        expected_last_title,
    ):
        url = reverse("rose-list")
        image = create_image("another_rose.jpg")

        data = {
            "title": "another rose",
            "title_eng": "another rose in english",
            "description": "another description",
            "breeder": breeder.id,
            "group": group.id,
            "photo": image,
        }

        authenticated_client.post(url, data=data, format="multipart")

        ordering_url = f"{url}?ordering={ordering}&page_size=18"

        response = authenticated_client.get(ordering_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["results"][0]["title"] == expected_first_title

        roses = response.data["results"]
        assert roses[-1]["title"] == expected_last_title

    def test_serializer_selection(self, authenticated_client, rose_with_relations):
        list_url = reverse("rose-list")
        list_response = authenticated_client.get(list_url)

        assert list_response.status_code == status.HTTP_200_OK

        rose_list_data = list_response.data["results"][0]

        detail_url = reverse("rose-detail", kwargs={"pk": rose_with_relations.id})
        detail_response = authenticated_client.get(detail_url)

        assert detail_response.status_code == status.HTTP_200_OK

        assert "id" in detail_response.data
        assert "title" in detail_response.data
        assert "title_eng" in detail_response.data
        assert "feedings" in detail_response.data
        assert "foliages" in detail_response.data
        assert "rosephotos" in detail_response.data
        assert "sizes" in detail_response.data
        assert "videos" in detail_response.data

        assert "rosepesticides" in detail_response.data
        assert "rosefungicides" in detail_response.data

        assert "feedings" not in rose_list_data
        assert "foliages" not in rose_list_data
        assert "rosepesticides" not in rose_list_data
        assert "rosefungicides" not in rose_list_data
        assert "rosephotos" not in rose_list_data
        assert "sizes" not in rose_list_data
        assert "videos" not in rose_list_data

        expected_list_fields = {"id", "title", "photo", "group"}
        assert set(rose_list_data.keys()) == expected_list_fields
