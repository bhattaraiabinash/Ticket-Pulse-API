
import pytest
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from unittest.mock import patch
from apps.events.models import Booking, Ticket, Event


class TestExpirePendingBookings:

    @pytest.mark.django_db
    def test_expires_old_pending_bookings(
        self, user, event, tickets
    ):
        from apps.events.tasks import expire_pending_bookings

        # Create a booking
        booking = Booking.objects.create(
            user=user,
            event=event,
            status=Booking.Status.PENDING,
            total_price=Decimal("2000.00"),
        )
        booking.tickets.set(tickets[:2])
        tickets[0].status = Ticket.Status.RESERVED
        tickets[0].save()
        tickets[1].status = Ticket.Status.RESERVED
        tickets[1].save()

        # Make the booking appear old (11 minutes ago)
        old_time = timezone.now() - timedelta(minutes=11)
        Booking.objects.filter(id=booking.id).update(
            created_at=old_time
        )

        # Run the task
        result = expire_pending_bookings()

        # Verify booking is expired
        booking.refresh_from_db()
        assert booking.status == Booking.Status.EXPIRED

        # Verify tickets are back to AVAILABLE
        tickets[0].refresh_from_db()
        tickets[1].refresh_from_db()
        assert tickets[0].status == Ticket.Status.AVAILABLE
        assert tickets[1].status == Ticket.Status.AVAILABLE

        assert "Expired 1" in result

    @pytest.mark.django_db
    def test_does_not_expire_recent_bookings(
        self, user, event, tickets
    ):
        from apps.events.tasks import expire_pending_bookings

        booking = Booking.objects.create(
            user=user,
            event=event,
            status=Booking.Status.PENDING,
            total_price=Decimal("1000.00"),
        )
        booking.tickets.set([tickets[0]])

        # Run the task - booking is fresh, should not expire
        expire_pending_bookings()

        booking.refresh_from_db()
        assert booking.status == Booking.Status.PENDING

    @pytest.mark.django_db
    def test_does_not_expire_confirmed_bookings(
        self, user, event, tickets
    ):
        from apps.events.tasks import expire_pending_bookings

        booking = Booking.objects.create(
            user=user,
            event=event,
            status=Booking.Status.CONFIRMED,
            total_price=Decimal("1000.00"),
        )
        booking.tickets.set([tickets[0]])

        # Make it appear old
        old_time = timezone.now() - timedelta(minutes=11)
        Booking.objects.filter(id=booking.id).update(
            created_at=old_time
        )

        expire_pending_bookings()

        booking.refresh_from_db()
        assert booking.status == Booking.Status.CONFIRMED

    @pytest.mark.django_db
    def test_restores_available_tickets_count(
        self, user, event, tickets
    ):
        from apps.events.tasks import expire_pending_bookings

        # Event starts with 5 available
        initial_available = event.available_tickets

        booking = Booking.objects.create(
            user=user,
            event=event,
            status=Booking.Status.PENDING,
            total_price=Decimal("2000.00"),
        )
        booking.tickets.set(tickets[:2])

        # Reduce available count manually
        Event.objects.filter(pk=event.pk).update(
            available_tickets=initial_available - 2
        )

        # Make booking old
        old_time = timezone.now() - timedelta(minutes=11)
        Booking.objects.filter(id=booking.id).update(
            created_at=old_time
        )

        expire_pending_bookings()

        event.refresh_from_db()
        assert event.available_tickets == initial_available

    @pytest.mark.django_db
    def test_returns_zero_when_nothing_expires(self, user, event, tickets):
        from apps.events.tasks import expire_pending_bookings

        booking = Booking.objects.create(
            user=user,
            event=event,
            status=Booking.Status.PENDING,
            total_price=Decimal("1000.00"),
        )
        booking.tickets.set([tickets[0]])

        result = expire_pending_bookings()
        assert result == "Expired 0 bookings"


class TestSendBookingConfirmation:

    @pytest.mark.django_db
    def test_sends_email_for_confirmed_booking(
        self, pending_booking
    ):
        from apps.events.tasks import send_booking_confirmation
        from django.core import mail

        # Confirm the booking first
        pending_booking.status = Booking.Status.CONFIRMED
        pending_booking.save()

        # Run the task
        result = send_booking_confirmation(pending_booking.id)

        # Check email was sent
        assert len(mail.outbox) == 1
        assert "Booking Confirmed" in mail.outbox[0].subject
        assert pending_booking.user.email in mail.outbox[0].to

        assert "Confirmation sent" in result

    @pytest.mark.django_db
    def test_returns_error_for_missing_booking(self):
        from apps.events.tasks import send_booking_confirmation

        result = send_booking_confirmation(99999)
        assert "not found" in result

    @pytest.mark.django_db
    def test_retries_when_pdf_or_email_generation_fails(
        self, pending_booking
    ):
        from apps.events.tasks import send_booking_confirmation

        pending_booking.status = Booking.Status.CONFIRMED
        pending_booking.save()

        with patch("apps.events.tasks.qrcode.make", side_effect=Exception("boom")):
            with patch.object(
                send_booking_confirmation,
                "retry",
                side_effect=RuntimeError("retry-called"),
            ):
                with pytest.raises(RuntimeError, match="retry-called"):
                    send_booking_confirmation(pending_booking.id)