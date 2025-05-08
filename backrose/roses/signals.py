from django.db.models.signals import pre_delete
from django.db.models import ProtectedError
from django.dispatch import receiver

from .models import Group


@receiver(pre_delete, sender=Group)
def prevent_group_deletion(sender, instance, **kwargs):
    if instance.roses.exists():
        raise ProtectedError(
            f"Невозможно удалить группу {instance.name} поскольку к ней привязаны розы",
            instance,
        )
