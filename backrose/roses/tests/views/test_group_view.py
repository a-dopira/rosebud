import pytest
from django.urls import reverse
from rest_framework import status
from roses.models import Rose, Group

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestGroupViewSet:

    def test_rose_count_annotation(self, authenticated_client, group, breeder):
        for i in range(3):
            Rose.objects.create(
                title=f"rose {i}",
                title_eng=f"rose {i} eng",
                group=group,
                breeder=breeder,
            )

        url = reverse("group-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        group_data = next(g for g in response.data if g["name"] == group.name)
        assert group_data["rose_count"] == 3

    def test_create_group(self, authenticated_client):
        url = reverse("group-list")
        data = {"name": "fancy group"}

        response = authenticated_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "fancy group"

    def test_unique_name_validation(self, authenticated_client, group):
        url = reverse("group-list")
        data = {"name": group.name}

        response = authenticated_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "name" in response.data

    def test_successful_deletion(self, authenticated_client, group):
        url = reverse("group-detail", kwargs={"pk": group.id})

        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Group.objects.filter(id=group.id).exists()

    def test_name_filtering(self, authenticated_client):
        Group.objects.create(name="apple group")
        Group.objects.create(name="banana group")

        url = reverse("group-list")
        response = authenticated_client.get(f"{url}?name=apple group")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == "apple group"
