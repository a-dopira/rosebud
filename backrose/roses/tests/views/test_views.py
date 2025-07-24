import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
@pytest.mark.parametrize(
    "entity_config",
    [
        {
            "name": "size",
            "url_pattern": "rose-sizes",
            "fixture": "size",
            "create_data": {
                "height": "45.50",
                "width": "35.20",
                "date_added": "2023-09-15",
            },
            "update_data": {
                "height": "50.00",
                "width": "40.00",
                "date_added": "2023-10-01",
            },
            "response_fields": ["height", "width", "date_added"],
        },
        {
            "name": "feeding",
            "url_pattern": "rose-feedings",
            "fixture": "feeding",
            "create_data": {
                "basal": "new basal",
                "basal_time": "2023-09-10",
                "leaf": "new leaf",
                "leaf_time": "2023-09-20",
            },
            "update_data": {
                "basal": "updated basal",
                "basal_time": "2023-10-10",
                "leaf": "updated leaf",
                "leaf_time": "2023-10-20",
            },
            "response_fields": ["basal", "leaf"],
        },
        {
            "name": "foliage",
            "url_pattern": "rose-foliages",
            "fixture": "foliage",
            "create_data": {"foliage": "new foliage", "foliage_time": "2023-09-15"},
            "update_data": {"foliage": "updated foliage", "foliage_time": "2023-10-15"},
            "response_fields": ["foliage"],
        },
    ],
)
class TestNestedResources:

    def test_nested(self, authenticated_client, request, rose, entity_config):

        list_url = reverse(
            f'{entity_config["url_pattern"]}-list', kwargs={"rose_pk": rose.id}
        )

        response = authenticated_client.post(list_url, entity_config["create_data"])
        assert response.status_code == status.HTTP_201_CREATED

        entity_id = response.data["id"]
        detail_url = reverse(
            f'{entity_config["url_pattern"]}-detail',
            kwargs={"rose_pk": rose.id, "pk": entity_id},
        )

        response = authenticated_client.get(detail_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == entity_id

        response = authenticated_client.put(detail_url, entity_config["update_data"])
        assert response.status_code == status.HTTP_200_OK

        for field in entity_config["response_fields"]:
            if field in entity_config["update_data"]:
                assert str(response.data[field]) == str(
                    entity_config["update_data"][field]
                )

        response = authenticated_client.delete(detail_url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

        response = authenticated_client.get(detail_url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestPesticideViewSet:

    def test_pesticide_with_pests(self, authenticated_client, pest):
        url = reverse("pesticide-list")
        data = {
            "name": "fancy pesticide",
            "pest_ids": [pest.id],
        }

        response = authenticated_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "fancy pesticide"
        assert len(response.data["pests"]) == 1
        assert response.data["pests"][0]["id"] == pest.id

    def test_pesticide_nested_serialization(self, authenticated_client, pesticide):
        url = reverse("pesticide-detail", kwargs={"pk": pesticide.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "pests" in response.data
        assert isinstance(response.data["pests"], list)
        assert len(response.data["pests"]) > 0


@pytest.mark.django_db
class TestFungicideViewSet:

    def test_fungicide_with_fungi(self, authenticated_client, fungus):
        url = reverse("fungicide-list")
        data = {
            "name": "fancy fungicide",
            "fungi_ids": [fungus.id],
        }

        response = authenticated_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "fancy fungicide"
        assert len(response.data["fungi"]) == 1
        assert response.data["fungi"][0]["id"] == fungus.id


@pytest.mark.django_db
class TestValidationErrors:

    def test_invalid_nested_creation(self, authenticated_client, rose):
        url = reverse("rose-sizes-list", kwargs={"rose_pk": rose.id})

        response = authenticated_client.post(url, {})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        invalid_data = {"height": "not-a-number", "width": "10.5"}
        response = authenticated_client.post(url, invalid_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.parametrize(
        "viewset_name",
        ["rose-sizes", "rose-feedings", "rose-foliages", "pesticide", "fungicide"],
    )
    def test_nonexistent_404(self, authenticated_client, rose, viewset_name):
        if "rose-" in viewset_name:
            url = reverse(
                f"{viewset_name}-detail", kwargs={"rose_pk": rose.id, "pk": 99999}
            )
        else:
            url = reverse(f"{viewset_name}-detail", kwargs={"pk": 99999})

        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
