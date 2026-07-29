
import pytest
from datetime import timedelta
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from apps.users.models import User
from apps.events.models import Event, Ticket, Booking
from django.core.cache import cache

@pytest.fixture(autouse=True)
def clear_cache():
    cache.clear()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="testuser",
        email="test@ticketpulse.com",
        password="testpass123",
    )
    
@pytest.fixture
def admin_usr(db):
    return User.objects.create_user(
        username="admin",
        email="admin@ticketpulse.com",
        password="adminpass123",
        is_staff=True,
    )    
    
@pytest.fixture
def event(db):
    return Event.objects.create(
        title="Test Concert",
        description="A test concert",
        date=timezone.now() + timedelta(days=30),
        location ="Test Venue, Kathmandu",
        total_capacity=5,
        available_tickets=5,
    )    
    
@pytest.fixture
def tickets(db, event):
    return [
        Ticket.objects.create(
            event=event,
            seat_number=f"A{i}",
            price=Decimal("1000.00"),
            status=Ticket.Status.AVAILABLE,
        )
        for i in range(1,6)
    ]
    
@pytest.fixture
def pending_booking(db, user, event, tickets):
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
    return booking


@pytest.fixture
def api_client(user):
    """Django test client logged in as test user."""
    from django.test import Client
    client = Client()
    client.login(username="testuser", password="testpass123")
    return client