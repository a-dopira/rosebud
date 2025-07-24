import pytest
import json
from django.urls import reverse
from rest_framework import status
from pytils.translit import slugify
from roses.models import Rose

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestRoseViewSet:

    def test_unique_title_validation(
        self, authenticated_client, rose_with_relations, breeder, group, create_image
    ):
        url = reverse("rose-list")
        image = create_image("test_rose.jpg")

        data = {
            "title": "fancy rose", 
            "title_eng": "fancy title",
            "breeder": breeder.id,
            "group": group.id,
            "photo": image,
        }

        response = authenticated_client.post(url, data=data, format="multipart")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "title" in response.data
        assert "already exists" in str(response.data["title"][0])

        data["title"] = "unique title"
        data["title_eng"] = "fancy rose in english"  
        
        response = authenticated_client.post(url, data=data, format="multipart")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "title_eng" in response.data
        assert "already exists" in str(response.data["title_eng"][0])

    def test_slug_generation(self, authenticated_client, breeder, group, create_image):
        url = reverse("rose-list")
        image = create_image("slug_test.jpg")

        data = {
            "title": "прикольная роза",
            "title_eng": "prikolnaya-roza",
            "breeder": breeder.id,
            "group": group.id,
            "photo": image,
        }

        response = authenticated_client.post(url, data=data, format="multipart")
        assert response.status_code == status.HTTP_201_CREATED

        rose = Rose.objects.get(id=response.data["id"])
        expected_slug = slugify("прикольная роза")
        assert rose.slug == expected_slug

    def test_custom_photo_deletion_endpoint(
        self, authenticated_client, rose_with_relations, create_image
    ):
        
        update_url = reverse("rose-detail", kwargs={"pk": rose_with_relations.id})
        new_image = create_image("custom_photo.jpg")
        authenticated_client.patch(
            update_url, data={"photo": new_image}, format="multipart"
        )

        url = reverse("rose-photo", kwargs={"pk": rose_with_relations.id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Фото успешно удалено"

        rose_response = authenticated_client.get(update_url)
        assert "cap_rose.png" in rose_response.data["photo"]

    def test_delete_default_photo_fails(self, authenticated_client, rose):

        rose.photo = "images/cap_rose.png"
        rose.save()

        url = reverse("rose-photo", kwargs={"pk": rose.id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["message"] == "Фото не удалось удалить"

    def test_authorization_required(self, api_client):

        url = reverse("rose-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_serializer_context_switching(self, authenticated_client, rose_with_relations):

        list_url = reverse("rose-list")
        detail_url = reverse("rose-detail", kwargs={"pk": rose_with_relations.id})

        list_response = authenticated_client.get(list_url)
        list_fields = set(list_response.data["results"][0].keys())
        assert list_fields == {"id", "title", "photo", "group"}

        detail_response = authenticated_client.get(detail_url)
        detail_fields = set(detail_response.data.keys())
        
        nested_fields = {"feedings", "foliages", "photos", "sizes", "videos"}
        assert nested_fields.issubset(detail_fields)
        assert len(detail_fields) > len(list_fields)


