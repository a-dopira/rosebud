import pytest
from PIL import Image
from io import BytesIO
from django.db.models import Count
from django.core.files.uploadedfile import SimpleUploadedFile
from decimal import Decimal
from datetime import date

from roses.models import (
    Rose,
    Group,
    Breeder,
    Size,
    Feeding,
    RosePhoto,
    Video,
    Foliage,
    Pest,
    Pesticide,
    Fungus,
    Fungicide,
)


@pytest.fixture
def breeder():
    return Breeder.objects.create(name="fancy breeder")


@pytest.fixture
def group():
    group = Group.objects.create(name="fancy group")
    return Group.objects.annotate(rose_count=Count("roses")).get(id=group.id)


@pytest.fixture
def fancy_image():
    img = Image.new("RGB", (1, 1), color="white")
    img_io = BytesIO()
    img.save(img_io, format="JPEG")
    img_io.seek(0)

    return SimpleUploadedFile(
        name="fancy_image.jpg",
        content=img_io.getvalue(),
        content_type="image/jpeg",
    )


@pytest.fixture
def create_image():
    def _create(name="test_image.jpg"):
        img = Image.new("RGB", (1, 1), color="white")
        img_io = BytesIO()
        img.save(img_io, format="JPEG")
        img_io.seek(0)

        return SimpleUploadedFile(
            name=name,
            content=img_io.getvalue(),
            content_type="image/jpeg",
        )

    return _create


@pytest.fixture
def rose(breeder, group, fancy_image):
    return Rose.objects.create(
        title="fancy rose",
        title_eng="fancy rose in english",
        photo=fancy_image,
        description="fancy description",
        landing_date=date(2023, 5, 15),
        observation="fancy observation",
        susceptibility="succeptible to beer",
        const_width=Decimal("10.5"),
        const_height=Decimal("15.2"),
        breeder=breeder,
        group=group,
    )


@pytest.fixture
def pest():
    return Pest.objects.create(name="fancy pest")


@pytest.fixture
def pesticide(rose, pest):
    return Pesticide.objects.create(
        rose=rose,
        pest=pest,
        name="fancy pesticide treatment",
        date_added=date(2023, 6, 15),
    )


@pytest.fixture
def fungus():
    return Fungus.objects.create(name="fancy fungus")


@pytest.fixture
def fungicide(rose, fungus):
    return Fungicide.objects.create(
        rose=rose,
        fungicide=fungus,
        name="fancy fungicide treatment",
        date_added=date(2023, 7, 12),
    )


@pytest.fixture
def feeding(rose):
    return Feeding.objects.create(
        rose=rose,
        basal="fancy basal fertilizer",
        basal_time=date(2023, 6, 10),
        leaf="fancy leaf fertilizer",
        leaf_time=date(2023, 6, 20),
    )


@pytest.fixture
def foliage(rose):
    return Foliage.objects.create(
        rose=rose,
        foliage="some tasty beer",
        foliage_time=date(2023, 7, 5),
    )


@pytest.fixture
def rose_photo(rose, fancy_image):
    return RosePhoto.objects.create(
        rose=rose, photo=fancy_image, descr="fancy photo description", year=2023
    )


@pytest.fixture
def size(rose):
    return Size.objects.create(
        rose=rose,
        width="25.5",
        height="30.2",
        date_added=date(2023, 8, 20),
    )


@pytest.fixture
def video(rose):
    return Video.objects.create(
        rose=rose,
        video="https://example.com/test-video",
        descr="fancy video description",
    )


@pytest.fixture
def rose_with_relations(
    rose, pesticide, fungicide, feeding, foliage, rose_photo, size, video
):
    """
    fixture with rose with relations
    """
    return rose

@pytest.fixture
def create_multiple_roses(breeder, group, create_image):
    """Фикстура для создания нескольких роз с разными параметрами"""
    roses = []
    
    # Создаем 5 "fancy" роз
    for i in range(5):
        image = create_image(f"fancy_rose_{i}.jpg")
        rose = Rose.objects.create(
            title=f'fancy_rose_{i}',
            title_eng=f'fancy_rose_{i}_english',
            description=f'fancy rose {i} description',
            breeder=breeder,
            group=group,
            photo=image.name
        )
        roses.append(rose)
    
    # Создаем 5 "simple" роз
    for i in range(5):
        image = create_image(f"simple_rose_{i}.jpg")
        rose = Rose.objects.create(
            title=f'simple_rose_{i}',
            title_eng=f'simple_rose_{i}_english',
            description=f'simple rose {i} description',
            breeder=breeder,
            group=group,
            photo=image.name
        )
        roses.append(rose)
    
    return roses