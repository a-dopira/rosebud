import pytest
from decimal import Decimal
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestSizeViewSet:
    def test_list_sizes(self, authenticated_client, rose_with_relations):
        url = reverse("size-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_retrieve_size(self, authenticated_client, size):
        url = reverse("size-detail", kwargs={"pk": size.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == size.id
        assert Decimal(response.data["height"]) == Decimal(size.height)
        assert Decimal(response.data["width"]) == Decimal(size.width)

    def test_create_size(self, authenticated_client, rose):
        url = reverse("size-list")
        data = {
            "rose": rose.id,
            "height": "45.5",
            "width": "35.2",
            "date_added": "2023-09-15",
        }

        response = authenticated_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert Decimal(response.data["height"]) == Decimal("45.5")
        assert Decimal(response.data["width"]) == Decimal("35.2")

    def test_update_size(self, authenticated_client, size):
        url = reverse("size-detail", kwargs={"pk": size.id})
        data = {
            "rose": size.rose.id,
            "height": "50.0",
            "width": "40.0",
            "date_added": "2023-10-01",
        }

        response = authenticated_client.put(url, data)

        assert response.status_code == status.HTTP_200_OK
        assert Decimal(response.data["height"]) == Decimal("50.0")
        assert Decimal(response.data["width"]) == Decimal("40.0")

    def test_destroy_size(self, authenticated_client, size):
        url = reverse("size-detail", kwargs={"pk": size.id})

        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == size.id
        assert response.data["name"] == "размеры"

        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestFeedingViewSet:
    def test_list_feedings(self, authenticated_client, rose_with_relations):
        url = reverse("feeding-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_retrieve_feeding(self, authenticated_client, feeding):
        url = reverse("feeding-detail", kwargs={"pk": feeding.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == feeding.id
        assert response.data["basal"] == feeding.basal
        assert response.data["leaf"] == feeding.leaf

    def test_create_feeding(self, authenticated_client, rose):
        url = reverse("feeding-list")
        data = {
            "rose": rose.id,
            "basal": "new basal fertilizer",
            "basal_time": "2023-09-10",
            "leaf": "new leaf fertilizer",
            "leaf_time": "2023-09-20",
        }

        response = authenticated_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["basal"] == "new basal fertilizer"
        assert response.data["leaf"] == "new leaf fertilizer"

    def test_update_feeding(self, authenticated_client, feeding):
        url = reverse("feeding-detail", kwargs={"pk": feeding.id})
        data = {
            "rose": feeding.rose.id,
            "basal": "updated basal fertilizer",
            "basal_time": "2023-10-10",
            "leaf": "updated leaf fertilizer",
            "leaf_time": "2023-10-20",
        }

        response = authenticated_client.put(url, data)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["basal"] == "updated basal fertilizer"
        assert response.data["leaf"] == "updated leaf fertilizer"

    def test_destroy_feeding(self, authenticated_client, feeding):
        url = reverse("feeding-detail", kwargs={"pk": feeding.id})

        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == feeding.id
        assert response.data["name"] == feeding.basal

        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestFoliageViewSet:
    def test_list_foliages(self, authenticated_client, rose_with_relations):
        url = reverse("foliage-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_retrieve_foliage(self, authenticated_client, foliage):
        url = reverse("foliage-detail", kwargs={"pk": foliage.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == foliage.id
        assert response.data["foliage"] == foliage.foliage

    def test_create_foliage(self, authenticated_client, rose):
        url = reverse("foliage-list")
        data = {
            "rose": rose.id,
            "foliage": "new foliage treatment",
            "foliage_time": "2023-09-15",
        }

        response = authenticated_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["foliage"] == "new foliage treatment"

    def test_update_foliage(self, authenticated_client, foliage):
        url = reverse("foliage-detail", kwargs={"pk": foliage.id})
        data = {
            "rose": foliage.rose.id,
            "foliage": "updated foliage treatment",
            "foliage_time": "2023-10-15",
        }

        response = authenticated_client.put(url, data)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["foliage"] == "updated foliage treatment"

    def test_destroy_foliage(self, authenticated_client, foliage):
        url = reverse("foliage-detail", kwargs={"pk": foliage.id})

        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == foliage.id
        assert response.data["name"] == foliage.foliage

        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestPesticideViewSet:
    def test_list_pesticides(self, authenticated_client, rose_with_relations):
        url = reverse("pesticide-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_retrieve_pesticide(self, authenticated_client, pesticide):
        url = reverse("pesticide-detail", kwargs={"pk": pesticide.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == pesticide.id
        assert response.data["name"] == pesticide.name

        assert "pests" in response.data
        assert isinstance(response.data["pests"], list)
        assert len(response.data["pests"]) > 0
        assert response.data["pests"][0]["name"] == "fancy pest"

    def test_create_pesticide(self, authenticated_client, pest):
        url = reverse("pesticide-list")
        data = {
            "name": "new pesticide treatment",
            "pest_ids": [pest.id],
        }

        response = authenticated_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "new pesticide treatment"

        assert len(response.data["pests"]) == 1
        assert response.data["pests"][0]["id"] == pest.id

    def test_update_pesticide(self, authenticated_client, pesticide, pest):
        url = reverse("pesticide-detail", kwargs={"pk": pesticide.id})
        data = {
            "name": "updated pesticide treatment",
            "pest_ids": [pest.id],
        }

        response = authenticated_client.put(url, data)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "updated pesticide treatment"
        assert len(response.data["pests"]) == 1
        assert response.data["pests"][0]["id"] == pest.id

    def test_destroy_pesticide(self, authenticated_client, pesticide):
        url = reverse("pesticide-detail", kwargs={"pk": pesticide.id})

        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == pesticide.id
        assert response.data["name"] == pesticide.name

        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestFungicideViewSet:
    def test_list_fungicides(self, authenticated_client, rose_with_relations):
        url = reverse("fungicide-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_retrieve_fungicide(self, authenticated_client, fungicide):
        url = reverse("fungicide-detail", kwargs={"pk": fungicide.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == fungicide.id
        assert response.data["name"] == fungicide.name

        assert "fungi" in response.data
        assert isinstance(response.data["fungi"], list)
        assert len(response.data["fungi"]) > 0
        assert response.data["fungi"][0]["name"] == "fancy fungus"

    def test_create_fungicide(self, authenticated_client, fungus):
        url = reverse("fungicide-list")
        data = {
            "name": "new fungicide treatment",
            "fungi_ids": [fungus.id],
        }

        response = authenticated_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "new fungicide treatment"

        assert len(response.data["fungi"]) == 1
        assert response.data["fungi"][0]["id"] == fungus.id

    def test_update_fungicide(self, authenticated_client, fungicide, fungus):
        url = reverse("fungicide-detail", kwargs={"pk": fungicide.id})
        data = {
            "name": "updated fungicide treatment",
            "fungi_ids": [fungus.id],
        }

        response = authenticated_client.put(url, data)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "updated fungicide treatment"
        assert len(response.data["fungi"]) == 1
        assert response.data["fungi"][0]["id"] == fungus.id

    def test_destroy_fungicide(self, authenticated_client, fungicide):
        url = reverse("fungicide-detail", kwargs={"pk": fungicide.id})

        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == fungicide.id
        assert response.data["name"] == fungicide.name

        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestInvalidRequests:
    def test_invalid_create_size(self, authenticated_client, rose):

        url = reverse("size-list")

        data = {
            "rose": rose.id,
            # height and width absent
        }

        response = authenticated_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # incorrect height
        data = {"rose": rose.id, "height": "not-a-number", "width": "10.5"}

        response = authenticated_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.parametrize(
        "path",
        [
            "size-detail",
            "feeding-detail",
            "foliage-detail",
            "pesticide-detail",
            "fungicide-detail",
        ],
    )
    def test_non_existent_object(self, authenticated_client, path):

        non_existent_id = 99999

        url = (reverse(path, kwargs={"pk": non_existent_id}),)

        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
