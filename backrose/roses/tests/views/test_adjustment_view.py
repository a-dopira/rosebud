import pytest
from django.urls import reverse
from rest_framework import status
from roses.models import Breeder, Pest, Fungus, Group, Rose


@pytest.mark.django_db
class TestAdjustmentViewSet:

    def test_returns_all_entity_types(self, authenticated_client):
        url = reverse("adjustments-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK

        expected_keys = {
            "groups",
            "breeders",
            "pests",
            "fungi",
            "pesticides",
            "fungicides",
        }
        assert set(response.data.keys()) == expected_keys

        for key in expected_keys:
            assert isinstance(response.data[key], list)

    def test_with_data(
        self, authenticated_client, breeder, group, pest, fungus, pesticide, fungicide
    ):
        url = reverse("adjustments-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK

        assert len(response.data["breeders"]) >= 1
        assert len(response.data["groups"]) >= 1
        assert len(response.data["pests"]) >= 1
        assert len(response.data["fungi"]) >= 1
        assert len(response.data["pesticides"]) >= 1
        assert len(response.data["fungicides"]) >= 1

        assert "name" in response.data["breeders"][0]
        assert "name" in response.data["groups"][0]
        assert "rose_count" in response.data["groups"][0]

    def test_groups_rose_count_annotation(self, authenticated_client, group, breeder):

        Rose.objects.create(
            title="test rose", title_eng="test rose eng", group=group, breeder=breeder
        )

        url = reverse("adjustments-list")
        response = authenticated_client.get(url)

        groups = response.data["groups"]
        test_group = next((g for g in groups if g["name"] == group.name), None)

        assert test_group is not None
        assert test_group["rose_count"] >= 1
