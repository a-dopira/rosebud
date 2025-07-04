import os
from django.apps import AppConfig


class UserprofileConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "userprofile"

    def ready(self):

        if os.environ.get("RUN_MAIN", None) != "true":
            from django.core import management

            management.call_command("cleartokens")

        from . import spectacular_extensions
