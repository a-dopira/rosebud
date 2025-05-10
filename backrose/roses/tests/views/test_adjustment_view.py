import pytest
from django.urls import reverse
from rest_framework import status
from roses.models import Breeder, Pest, Fungus, Group, Rose


@pytest.mark.django_db
class TestAdjustmentViewSet:

    def test_list_all_entities(
        self, authenticated_client, breeder, pest, fungus, group, create_multiple_roses
    ):
        url = reverse("adjustment-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK

        assert "groups" in response.data
        assert "breeders" in response.data
        assert "pests" in response.data
        assert "fungi" in response.data

    @pytest.mark.parametrize(
        "model_info",
        [(Group, "groups"), (Breeder, "breeders"), (Pest, "pests"), (Fungus, "fungi")],
    )
    def test_list_empty_entities(self, model_info, authenticated_client):

        model, dataset = model_info
        # purify
        Rose.objects.all().delete()
        model.objects.all().delete()

        url = reverse("adjustment-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK

        assert len(response.data[dataset]) == 0

    @pytest.mark.parametrize(
        "model_info",
        [
            (Breeder, "breeders", "breeder"),
            (Pest, "pests", "pest"),
            (Fungus, "fungi", "fungus"),
            (Group, "groups", "group"),
        ],
    )
    def test_with_additional_data(
        self, authenticated_client, request, model_info, create_multiple_roses
    ):
        model_class, response_key, fixture_name = model_info

        base_fixture = request.getfixturevalue(fixture_name) if fixture_name else None

        additional_items = [
            model_class.objects.create(name=f"Additional {model_class.__name__} {i}")
            for i in range(5)
        ]

        url = reverse("adjustment-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response_key in response.data

        expected_count = (1 if base_fixture else 0) + len(additional_items)

        assert len(response.data[response_key]) == expected_count

        item_names = [item["name"] for item in response.data[response_key]]
        for item in additional_items:
            assert item.name in item_names
