import os
import pytest
from django.conf import settings
from roses.models import Rose, RosePhoto
from common.utils import get_filename

pytestmark = pytest.mark.django_db


class TestRoseThumbnailPaths:
    def test_get_filename_for_rose(self, rose, fancy_image):
        filename = get_filename(rose, "test_rose.jpg")

        expected_path = os.path.join(
            "images", rose.title_eng, "thumbnails", f"{rose.title_eng}_test_rose.jpg"
        )

        assert filename == expected_path

        assert os.path.dirname(rose.photo.name) == os.path.join(
            "images", rose.title_eng, "thumbnails"
        )

    def test_media_directory_structure(self, rose, rose_photo):
        rose_media_dir = os.path.dirname(rose.photo.path)
        photo_media_dir = os.path.dirname(rose_photo.photo.path)

        assert os.path.exists(rose_media_dir)
        assert os.path.exists(photo_media_dir)

        expected_rose_dir = os.path.join(
            settings.MEDIA_ROOT, "images", rose.title_eng, "thumbnails"
        )

        expected_photo_dir = os.path.join(settings.MEDIA_ROOT, "images", rose.title_eng)

        assert rose_media_dir == expected_rose_dir
        assert photo_media_dir == expected_photo_dir

    def test_get_filename_with_special_characters(self, create_image):

        special_image = create_image("fancy_special_image.jpg")

        special_title = "fancy rose with awkwardness & symbols!"

        rose_with_special_chars = Rose.objects.create(
            title=special_title, title_eng=special_title, photo=special_image
        )

        filename = get_filename(rose_with_special_chars, "test_file.jpg")

        assert special_title in filename

        rose_with_special_chars.delete()

    def test_file_name_preservation(self):

        rose = Rose.objects.create(
            title="fancy_rose",
            title_eng="fancy_rose_in_eng",
        )

        original_file_name = "fancy file with spaces & symbols?.jpg"

        filename = get_filename(rose, original_file_name)

        expected_filename = f"{rose.title_eng}_{original_file_name}"
        expected_alt_filename = (
            f"{rose.title_eng}_{original_file_name.replace(' ', '_')}"
        )

        assert filename.endswith(expected_filename) or filename.endswith(
            expected_alt_filename
        )

        rose.delete()

        assert not os.path.exists(filename)

class TestRosePhotoPaths:

    def test_get_filename_for_rose_photo(self, rose, rose_photo, fancy_image):
        filename = get_filename(rose_photo, "test_photo.jpg")

        expected_path = os.path.join(
            "images", rose.title_eng, f"{rose.title_eng}_test_photo.jpg"
        )

        assert filename == expected_path
        assert os.path.dirname(rose_photo.photo.name) == os.path.join(
            "images", rose.title_eng
        )

        assert "thumbnails" not in rose_photo.photo.name

    def test_rose_photo_related_file_paths(self, rose, create_image):

        photo1 = RosePhoto.objects.create(
            rose=rose, photo=create_image("photo1.jpg"), descr="fancy photo 1"
        )

        photo2 = RosePhoto.objects.create(
            rose=rose, photo=create_image("photo2.jpg"), descr="fancy photo 2"
        )

        photo1_dir = os.path.dirname(photo1.photo.name)
        photo2_dir = os.path.dirname(photo2.photo.name)

        assert photo1_dir == photo2_dir
        assert photo1_dir == os.path.join("images", rose.title_eng)

        assert rose.title_eng in photo1.photo.name
        assert rose.title_eng in photo2.photo.name

        photo1.delete()
        photo2.delete()

    def test_rose_photo_related_file_paths(self, rose, create_image):

        photo1 = RosePhoto.objects.create(
            rose=rose, photo=create_image("photo1.jpg"), descr="fancy photo1"
        )

        photo2 = RosePhoto.objects.create(
            rose=rose, photo=create_image("photo2.jpg"), descr="fancy photo2"
        )

        assert os.path.dirname(photo1.photo.path) == os.path.dirname(photo2.photo.path)

        expected_dir = os.path.join(settings.MEDIA_ROOT, "images", rose.title_eng)

        assert os.path.dirname(photo1.photo.path) == expected_dir

        assert rose.title_eng in photo1.photo.name
        assert rose.title_eng in photo2.photo.name

        photo1.delete()
        photo2.delete()