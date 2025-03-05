from django.apps import AppConfig


class RosesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "roses"

    def ready(self):
        import roses.signals