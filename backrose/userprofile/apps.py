from django.apps import AppConfig
from django.core.management import call_command

class UserprofileConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'userprofile'

    def ready(self):
        import os
        if os.environ.get('RUN_MAIN', None) != 'true':
            try:
                call_command('cleartokens')
                print("Очистка просроченных токенов выполнена")
            except Exception as e:
                print(f"Ошибка при очистке токенов: {e}")