import os
from django.apps import apps


def get_filename(instance, filename):
    Rose = apps.get_model("roses", "Rose")

    title_eng = (
        instance.title_eng if isinstance(instance, Rose) else instance.rose.title_eng
    )
    filename = f"{title_eng}_{filename}"

    if isinstance(instance, Rose):
        return os.path.join("images", title_eng, "thumbnails", filename)

    return os.path.join("images", title_eng, filename)
