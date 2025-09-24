from django.core.management.base import BaseCommand
from entries.models import Entry


class Command(BaseCommand):
    help = 'Check the processing status of all entries'

    def add_arguments(self, parser):
        parser.add_argument(
            '--retry-unprocessed',
            action='store_true',
            help='Automatically retry unprocessed entries',
        )

    def handle(self, *args, **options):
        try:
            total_entries = Entry.objects.count()
            processed_entries = Entry.objects.filter(insights_processed=True).count()
            unprocessed_entries = total_entries - processed_entries
            
            self.stdout.write(f"Total entries: {total_entries}")
            self.stdout.write(f"Processed entries: {processed_entries}")
            self.stdout.write(f"Unprocessed entries: {unprocessed_entries}")
            
            if unprocessed_entries > 0:
                self.stdout.write(
                    self.style.WARNING(f"Found {unprocessed_entries} unprocessed entries")
                )
                
                if options['retry_unprocessed']:
                    from insights.tasks import retry_unprocessed_entries
                    result = retry_unprocessed_entries.delay()
                    self.stdout.write(
                        self.style.SUCCESS(f"Queued retry task with ID: {result.id}")
                    )
            else:
                self.stdout.write(
                    self.style.SUCCESS("All entries have been processed!")
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error checking processing status: {e}")
            )
