import pytest
from django.urls import reverse
from rest_framework import status
from roses.models import Group

pytestmark = pytest.mark.django_db


class TestGroupViewSet:

    def test_get_groups_list(self, authenticated_client, group):

        url = reverse("group-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_get_groups_list_with_multiple_roses(
        self, authenticated_client, group, create_multiple_roses
    ):

        url = reverse("group-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["rose_count"] == 10

    def test_create_group(self, authenticated_client):

        url = reverse("group-list")
        data = {"name": "new fancy group"}

        response = authenticated_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert "message" in response.data
        assert "items" in response.data
        assert response.data["message"] == "Группа new fancy group успешно добавлена."

        assert Group.objects.filter(name="new fancy group").exists()

        assert len(response.data["items"]) == 1
        assert response.data["items"][0]["name"] == "new fancy group"
        assert response.data["items"][0]["rose_count"] == 0

    def test_create_existing_group(self, authenticated_client, group):
        url = reverse("group-list")
        data = {"name": group.name}

        response = authenticated_client.post(url, data, format="json")

        # should be triggered by UniqueValidator, because name is unique in Group model
        # unique validator should return 400 instead of 409
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_filter_groups_by_name(self, authenticated_client, group):
        Group.objects.create(name="another group")

        url = reverse("group-list")
        response = authenticated_client.get(f"{url}?name={group.name}")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == group.name

    def test_delete_group(self, authenticated_client, group):
        url = reverse("group-detail", kwargs={"pk": group.id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data
        assert "items" in response.data
        assert response.data["message"] == f"Группа {group.name} удалена."
        assert not Group.objects.filter(id=group.id).exists()

        assert len(response.data["items"]) == 0

    def test_delete_group_with_roses(self, authenticated_client, group, rose):
        url = reverse("group-detail", kwargs={"pk": group.id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_409_CONFLICT
        assert (
            response.data["detail"]
            == "Невозможно удалить группу поскольку к ней привязаны розы."
        )

        assert Group.objects.filter(id=group.id).exists()

    def test_update_group(self, authenticated_client, group):
        url = reverse("group-detail", kwargs={"pk": group.id})
        data = {"name": "Updated Group Name"}

        response = authenticated_client.put(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK

        updated_group = Group.objects.get(id=group.id)
        assert updated_group.name == "Updated Group Name"
        assert updated_group.slug == "updated-group-name"
