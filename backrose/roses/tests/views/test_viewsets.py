import pytest
from django.urls import reverse
from rest_framework import status

pytestmark = pytest.mark.django_db


class TestViewSets:
    @pytest.mark.parametrize(
        "viewset_info",
        [
            ("breeder", "breeder", {"name": "test breeder"}, "Селекционер"),
            ("pest", "pest", {"name": "test pest"}, "Вредитель"),
            ("fungus", "fungus", {"name": "test fungus"}, "Гриб"),
        ],
    )
    def test_viewset_crud_operations(self, authenticated_client, viewset_info, request):
        viewset_name, fixture_name, create_data, entity_name = viewset_info

        if fixture_name:
            fixture = request.getfixturevalue(fixture_name)

        list_url = reverse(f"{viewset_name}-list")
        list_response = authenticated_client.get(list_url)
        assert list_response.status_code == status.HTTP_200_OK

        create_response = authenticated_client.post(
            list_url, create_data, format="json"
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        assert "message" in create_response.data
        expected_identifier = create_data.get(
            "name", f"ID {create_response.data['id']}"
        )
        assert (
            f"{entity_name} {expected_identifier} успешно добавлен"
            in create_response.data["message"]
        )

        detail_url = reverse(
            f"{viewset_name}-detail", kwargs={"pk": create_response.data["id"]}
        )
        detail_response = authenticated_client.get(detail_url)
        assert detail_response.status_code == status.HTTP_200_OK

        delete_response = authenticated_client.delete(detail_url)
        assert delete_response.status_code == status.HTTP_200_OK
        assert "message" in delete_response.data
        assert (
            f"{entity_name} {expected_identifier} удален"
            in delete_response.data["message"]
        )


class TestVideoViewSet:
    def test_create_video(self, authenticated_client, rose):
        url = reverse("video-list")
        data = {
            "rose": rose.id,
            "video": "https://example.com/new-test-video",
            "descr": "Amazing rose video",
        }

        response = authenticated_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["video"] == "https://example.com/new-test-video"
        assert response.data["descr"] == "Amazing rose video"
        assert "message" in response.data
        assert "items" in response.data

    def test_list_videos(self, authenticated_client, video):
        url = reverse("video-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["video"] == "https://example.com/test-video"
        assert response.data[0]["descr"] == "fancy video description"


@pytest.mark.django_db
class TestRosePhotoViewSet:
    def test_create_rose_photo(self, authenticated_client, rose, create_image):
        url = reverse("rosephoto-list")
        image = create_image("new_test_image.jpg")

        data = {
            "rose": rose.id,
            "descr": "Beautiful test photo",
            "year": 2023,
            "photo": image,
        }

        response = authenticated_client.post(url, data, format="multipart")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["descr"] == "Beautiful test photo"
        assert response.data["year"] == 2023
        assert "message" in response.data
        assert "items" in response.data

    def test_list_rose_photos(self, authenticated_client, rose_photo):
        url = reverse("rosephoto-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["descr"] == "fancy photo description"
        assert response.data[0]["year"] == 2023
