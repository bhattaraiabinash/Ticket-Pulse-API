
import threading
from datetime import timedelta
from decimal import Decimal

import pytest
from django.test import Client
from django.utils import timezone

from apps.events.models import Booking, Event, Ticket
from apps.users.models import User


@pytest.fixture
def event_with_tickets(db):
    event = Event.objects.create(
        title="Test Concert",
        date=timezone.now() + timedelta(days=7),
        location="Test Venue",
        total_capacity=2,
        available_tickets=2,
    )
    t1 = Ticket.objects.create(
        event=event,
        seat_number="A1",
        price=Decimal("100.00"),
        status=Ticket.Status.AVAILABLE,
    )
    t2 = Ticket.objects.create(
        event=event,
        seat_number="A2",
        price=Decimal("100.00"),
        status=Ticket.Status.AVAILABLE,
    )
    return event, [t1, t2]


@pytest.fixture
def test_user(db):
    return User.objects.create_user(
        username="testuser",
        email="test@ticketpulse.com",
        password="testpass123",
    )


@pytest.mark.django_db(transaction=True)
def test_concurrent_booking_only_one_succeeds(event_with_tickets, test_user):
   
    event, tickets = event_with_tickets
    ticket_ids = [t.id for t in tickets]

    results = []
    lock = threading.Lock()

    def attempt_booking():
        c = Client()
        c.login(username="testuser", password="testpass123")
        response = c.post(
            "/api/v1/bookings/",
            data={"event_id": event.id, "ticket_ids": ticket_ids},
            content_type="application/json",
        )
        with lock:
            results.append(response.status_code)

    threads = [threading.Thread(target=attempt_booking) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    successes = results.count(201)
    conflicts = results.count(409)

    print(f"\nResults: {results}")
    print(f"Successes: {successes}, Conflicts: {conflicts}")

    assert successes == 1, (
        f"Expected exactly 1 success, got {successes}. Results: {results}"
    )
    assert conflicts == 9, (
        f"Expected 9 conflicts, got {conflicts}. Results: {results}"
    )

    assert Booking.objects.count() == 1
    assert Ticket.objects.filter(status=Ticket.Status.RESERVED).count() == 2
    assert Ticket.objects.filter(status=Ticket.Status.AVAILABLE).count() == 0