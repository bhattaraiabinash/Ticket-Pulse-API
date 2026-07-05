
from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask, IntervalSchedule


class Command(BaseCommand):
    help = "register Celery Beat periodic tasks in the database"
    
    def handle(self, *args, **kwargs):
        
        schedule, _ = IntervalSchedule.objects.get_or_create(
            every=60,
            period=IntervalSchedule.SECONDS,
        )
        
        task, created = PeriodicTask.objects.update_or_create(
            name="Expire pending bookings every 60 seconds",
            defaults={
                "task": "apps.events.tasks.expire_pending_bookings",
                "interval": schedule,
                "enabled": True
            }
        )
        
        action = "Created" if created else "Updated"
        self.stdout.write(
            self.style.SUCCESS(f"{action}: {task.name}")
        )