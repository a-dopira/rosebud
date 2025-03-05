from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import Rose


@receiver(pre_save, sender=Rose)
def delete_photo(sender, instance, **kwargs):
    if getattr(instance, "_delete_photo", False):
        if instance.pk:
            try:
                original = Rose.objects.get(pk=instance.pk)
                if original.photo and original.photo != "images/cap_rose.png":
                    original.photo.delete()
                    instance.photo = "images/cap_rose.png"
            except Rose.DoesNotExist:
                pass