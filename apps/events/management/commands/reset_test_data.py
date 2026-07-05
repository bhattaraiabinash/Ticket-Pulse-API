from django.core.management.base import BaseCommand
from apps.events.models import Ticket, Booking, Event


class Command(BaseCommand):
    help = "Reset all test data — bookings cleared, tickets available"

    def handle(self, *args, **kwargs):
        # Delete allBookings
        booking_count = Booking.objects.count()
        Booking.objects.all().delete()

        # Reset alltickets to AVailable
        Ticket.objects.all().update(status=Ticket.Status.AVAILABLE)

        # Reset available_tickets on all events
        for event in Event.objects.all():
            total = Ticket.objects.filter(event=event).count()
            event.available_tickets = total
            event.save(update_fields=["available_tickets"])

        self.stdout.write(
            self.style.SUCCESS(
                f"Reset complete!\n"
                f"  Deleted bookings : {booking_count}\n"
                f"  Tickets reset    : {Ticket.objects.count()} -> AVAILABLE\n"
                f"  Events updated   : {Event.objects.count()}"
            )
        )