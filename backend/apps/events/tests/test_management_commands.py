import pytest
from io import StringIO
from decimal import Decimal
from datetime import timedelta
from django.core.management import call_command
from django.utils import timezone
from django_celery_beat.models import PeriodicTask

from apps.events.models import Booking, Event, Ticket


@pytest.mark.django_db
def test_reset_test_data_command_resets_state(user, event, tickets):
    booking = Booking.objects.create(
        user=user,
        event=event,
        status=Booking.Status.PENDING,
        total_price=Decimal("2000.00"),
    )
    booking.tickets.set(tickets[:2])

    tickets[0].status = Ticket.Status.RESERVED
    tickets[0].save(update_fields=["status"])
    tickets[1].status = Ticket.Status.SOLD
    tickets[1].save(update_fields=["status"])

    Event.objects.filter(pk=event.pk).update(available_tickets=1)

    out = StringIO()
    call_command("reset_test_data", stdout=out)

    assert Booking.objects.count() == 0
    assert Ticket.objects.exclude(status=Ticket.Status.AVAILABLE).count() == 0

    event.refresh_from_db()
    assert event.available_tickets == Ticket.objects.filter(event=event).count()

    output = out.getvalue()
    assert "Reset complete!" in output
    assert "Deleted bookings" in output


@pytest.mark.django_db
def test_setup_periodic_tasks_command_is_idempotent():
    out1 = StringIO()
    call_command("setup_periodic_tasks", stdout=out1)

    assert PeriodicTask.objects.filter(
        name="Expire pending bookings every 60 seconds"
    ).count() == 1
    assert "Created" in out1.getvalue() or "Updated" in out1.getvalue()

    out2 = StringIO()
    call_command("setup_periodic_tasks", stdout=out2)

    assert PeriodicTask.objects.filter(
        name="Expire pending bookings every 60 seconds"
    ).count() == 1
    assert "Updated" in out2.getvalue() or "Created" in out2.getvalue()


@pytest.mark.django_db
def test_show_status_command_prints_expected_sections(event, tickets):
    Event.objects.filter(pk=event.pk).update(
        date=timezone.now() + timedelta(days=1),
        available_tickets=len(tickets),
    )

    out = StringIO()
    call_command("show_status", stdout=out)

    output = out.getvalue()
    assert "=== EVENTS ==" in output
    assert "== TICKETS ===" in output
    assert "=== BOOKINGS ===" in output
    assert "No bookings found" in output


@pytest.mark.django_db
def test_show_status_command_prints_booking_rows(user, event, tickets):
    booking = Booking.objects.create(
        user=user,
        event=event,
        status=Booking.Status.PENDING,
        total_price=Decimal("1000.00"),
    )
    booking.tickets.set([tickets[0]])

    out = StringIO()
    call_command("show_status", stdout=out)

    output = out.getvalue()
    assert f"Booking #{booking.id}" in output
    assert "Seats" in output
