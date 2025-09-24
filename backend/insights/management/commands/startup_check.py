from django.core.management.base import BaseCommand
from django.db import connection
from entries.models import Entry
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Check for unprocessed entries on startup and queue them for processing'

    def handle(self, *args, **options):
        try:
            # Check if database is ready
            connection.ensure_connection()
            
            # Count unprocessed entries
            unprocessed_count = Entry.objects.filter(insights_processed=False).count()
            
            if unprocessed_count > 0:
                self.stdout.write(
                    self.style.WARNING(f"Found {unprocessed_count} unprocessed entries on startup")
                )
                
                # Queue them for processing
                try:
                    from insights.tasks import retry_unprocessed_entries
                    result = retry_unprocessed_entries.delay()
                    self.stdout.write(
                        self.style.SUCCESS(f"Queued {unprocessed_count} entries for processing (task ID: {result.id})")
                    )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"Failed to queue unprocessed entries: {e}")
                    )
            else:
                self.stdout.write(
                    self.style.SUCCESS("All entries are processed!")
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error during startup check: {e}")
            )
