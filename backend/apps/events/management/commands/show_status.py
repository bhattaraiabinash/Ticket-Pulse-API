from django.core.management.base import BaseCommand
from apps.events.models import Ticket, Booking, Event

class Command(BaseCommand):
    help = "Show current status of all events, tickets and bookings"
    
    def handle(self, *args, **kwargs):
        self.stdout.write("\n=== EVENTS ==")
        for event in Event.objects.all():
            self.stdout.write(
                f"  Event #{event.id}: {event.title}"
                f" — {event.available_tickets}/{event.total_capacity} available"
            )

        self.stdout.write("\n== TICKETS ===")
        for ticket in Ticket.objects.all().order_by("id"):
            self.stdout.write(
                f"  Ticket #{ticket.id}: "
                f"Seat {ticket.seat_number} -> {ticket.status}"
            )

        self.stdout.write("\n=== BOOKINGS ===")
        bookings = Booking.objects.all().prefetch_related("tickets")
        if not bookings:
            self.stdout.write("  No bookings found")
        for booking in bookings:
            seats = [t.seat_number for t in booking.tickets.all()]
            self.stdout.write(
                f"  Booking #{booking.id}: "
                f"{booking.status} — "
                f"Seats {seats} — "
                f"NPR {booking.total_price} — "
                f"Created: {booking.created_at.strftime('%H:%M:%S')}"
            )
        self.stdout.write("")
        