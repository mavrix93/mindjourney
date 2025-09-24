from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask, IntervalSchedule
from insights.tasks import retry_unprocessed_entries, check_entry_processing_status


class Command(BaseCommand):
    help = 'Set up periodic task to retry unprocessed entries and check processing status'

    def add_arguments(self, parser):
        parser.add_argument(
            '--setup-periodic',
            action='store_true',
            help='Set up the periodic task for checking unprocessed entries',
        )
        parser.add_argument(
            '--run-now',
            action='store_true',
            help='Run the retry task immediately',
        )

    def handle(self, *args, **options):
        if options['setup_periodic']:
            self.setup_periodic_task()
        
        if options['run_now']:
            self.run_retry_now()

    def setup_periodic_task(self):
        """Set up a periodic task to check for unprocessed entries every 5 minutes"""
        try:
            # Create interval schedule for every 5 minutes
            schedule, created = IntervalSchedule.objects.get_or_create(
                every=5,
                period=IntervalSchedule.MINUTES,
            )
            
            # Create or update the periodic task
            task, created = PeriodicTask.objects.get_or_create(
                name='retry_unprocessed_entries',
                defaults={
                    'task': 'insights.tasks.check_entry_processing_status',
                    'interval': schedule,
                    'enabled': True,
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS('Successfully created periodic task for retrying unprocessed entries')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('Periodic task already exists')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to set up periodic task: {e}')
            )

    def run_retry_now(self):
        """Run the retry task immediately"""
        try:
            result = retry_unprocessed_entries.delay()
            self.stdout.write(
                self.style.SUCCESS(f'Queued retry task with ID: {result.id}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to queue retry task: {e}')
            )
