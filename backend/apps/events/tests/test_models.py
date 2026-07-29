import pytest
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from apps.events.models import Event, Ticket, Booking
from apps.users.models import User


class TestEventModel:
    

    def test_event_creation(self, event):
        
        assert event.title == "Test Concert"
        assert event.total_capacity == 5
        assert event.available_tickets == 5

    def test_event_str(self, event):
        
        result = str(event)
        assert "Test Concert" in result

    def test_event_ordering(self, db):
        
        event1 = Event.objects.create(
            title="Far Future Event",
            date=timezone.now() + timedelta(days=100),
            location="Venue A",
            total_capacity=10,
            available_tickets=10,
        )
        event2 = Event.objects.create(
            title="Near Future Event",
            date=timezone.now() + timedelta(days=5),
            location="Venue B",
            total_capacity=10,
            available_tickets=10,
        )
        events = list(Event.objects.all())
        assert events[0].title == "Near Future Event"
        assert events[1].title == "Far Future Event"


class TestTicketModel:
    

    def test_ticket_default_status(self, event):
        
        ticket = Ticket.objects.create(
            event=event,
            seat_number="Z1",
            price=Decimal("500.00"),
        )
        assert ticket.status == Ticket.Status.AVAILABLE

    def test_ticket_str(self, tickets):
        """Ticket __str__ contains seat number and event title."""
        ticket = tickets[0]
        result = str(ticket)
        assert "A1" in result
        assert "Test Concert" in result

    def test_ticket_unique_seat_per_event(self, db, event):
        """Cannot create two tickets with same seat number for same event."""
        from django.db import IntegrityError
        Ticket.objects.create(
            event=event,
            seat_number="DUPLICATE",
            price=Decimal("500.00"),
        )
        with pytest.raises(IntegrityError):
            Ticket.objects.create(
                event=event,
                seat_number="DUPLICATE",
                price=Decimal("500.00"),
            )

    def test_ticket_status_choices(self, tickets):
        
        ticket = tickets[0]

        ticket.status = Ticket.Status.RESERVED
        ticket.save()
        ticket.refresh_from_db()
        assert ticket.status == "RESERVED"

        ticket.status = Ticket.Status.SOLD
        ticket.save()
        ticket.refresh_from_db()
        assert ticket.status == "SOLD"


class TestBookingModel:
    

    def test_booking_creation(self, pending_booking):
        
        assert pending_booking.status == Booking.Status.PENDING
        assert pending_booking.total_price == Decimal("2000.00")

    def test_booking_has_tickets(self, pending_booking):
    
        assert pending_booking.tickets.count() == 2

    def test_booking_str(self, pending_booking):
        
        result = str(pending_booking)
        assert str(pending_booking.id) in result
        assert "PENDING" in result

    def test_booking_status_transition(self, pending_booking):
        
        pending_booking.status = Booking.Status.CONFIRMED
        pending_booking.save()
        pending_booking.refresh_from_db()
        assert pending_booking.status == "CONFIRMED"