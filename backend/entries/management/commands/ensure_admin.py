from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config


class Command(BaseCommand):
    help = "Create an admin (superuser) from environment variables if none exists"

    def handle(self, *args, **options):
        User = get_user_model()
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(self.style.SUCCESS("Superuser already exists. Skipping."))
            return

        admin_username = config("ADMIN_USERNAME", default=None)
        admin_email = config("ADMIN_EMAIL", default=None)
        admin_password = config("ADMIN_PASSWORD", default=None)

        if not admin_username or not admin_password:
            self.stdout.write(
                self.style.ERROR(
                    "ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment to create admin"
                )
            )
            return

        if not admin_email:
            admin_email = f"{admin_username}@example.com"

        User.objects.create_superuser(
            username=admin_username,
            email=admin_email,
            password=admin_password,
        )
        self.stdout.write(self.style.SUCCESS(f"Superuser '{admin_username}' created."))

