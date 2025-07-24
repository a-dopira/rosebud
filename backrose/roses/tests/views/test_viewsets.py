import pytest
from django.urls import reverse
from rest_framework import status

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
@pytest.mark.parametrize(
    "viewset_config",
    [
        {"name": "breeder", "model_data": {"name": "test breeder"}},
        {"name": "pest", "model_data": {"name": "test pest"}},
        {"name": "fungus", "model_data": {"name": "test fungus"}},
    ],
)
def test_simple_viewsets_crud(authenticated_client, viewset_config):

    list_url = reverse(f"{viewset_config['name']}-list")

    response = authenticated_client.post(
        list_url, viewset_config["model_data"], format="json"
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["name"] == viewset_config["model_data"]["name"]

    detail_url = reverse(
        f"{viewset_config['name']}-detail", kwargs={"pk": response.data["id"]}
    )
    response = authenticated_client.get(detail_url)
    assert response.status_code == status.HTTP_200_OK

    response = authenticated_client.delete(detail_url)
    assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
class TestPesticideViewSet:

    def test_create_pesticide_with_pests(self, authenticated_client, pest):
        url = reverse("pesticide-list")
        data = {
            "name": "fancy pesticide",
            "pest_ids": [pest.id],
        }

        response = authenticated_client.post(url, data, format="json")
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

    def test_create_fungicide_with_fungi(self, authenticated_client, fungus):
        url = reverse("fungicide-list")
        data = {
            "name": "fancy fungicide",
            "fungi_ids": [fungus.id],
        }

        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "fancy fungicide"
        assert len(response.data["fungi"]) == 1
        assert response.data["fungi"][0]["id"] == fungus.id


@pytest.mark.django_db
class TestNestedViewSets:

    def test_nested_urls_work(self, authenticated_client, rose):
        urls_to_test = [
            "rose-videos-list",
            "rose-photos-list",
            "rose-sizes-list",
            "rose-feedings-list",
            "rose-foliages-list",
        ]

        for url_name in urls_to_test:
            url = reverse(url_name, kwargs={"rose_pk": rose.id})
            response = authenticated_client.get(url)
            assert response.status_code == status.HTTP_200_OK

    def test_list_videos_filtered_by_rose(self, authenticated_client, rose, video):
        url = reverse("rose-videos-list", kwargs={"rose_pk": rose.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
        for video_data in response.data:
            assert "video" in video_data
            assert "descr" in video_data


@pytest.mark.django_db
@pytest.mark.parametrize(
    "nested_config",
    [
        {
            "url_pattern": "rose-sizes",
            "data": {"height": "45.50", "width": "35.20", "date_added": "2023-09-15"},
        },
        {
            "url_pattern": "rose-feedings",
            "data": {
                "basal": "test basal",
                "basal_time": "2023-09-10",
                "leaf": "test leaf",
                "leaf_time": "2023-09-20",
            },
        },
        {
            "url_pattern": "rose-foliages",
            "data": {"foliage": "test foliage", "foliage_time": "2023-09-15"},
        },
    ],
)
def test_nested_resources_basic_crud(authenticated_client, rose, nested_config):
    list_url = reverse(
        f'{nested_config["url_pattern"]}-list', kwargs={"rose_pk": rose.id}
    )

    response = authenticated_client.post(list_url, nested_config["data"])
    assert response.status_code == status.HTTP_201_CREATED

    response = authenticated_client.get(list_url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1
