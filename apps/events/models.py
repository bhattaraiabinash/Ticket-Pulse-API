from django.db import models
import logging
from decimal import Decimal

from django.utils import timezone

from apps.users.models import User

# Create your models here.


logger = logging.getLogger(__name__)


class Event(models.Model):
    """
    Represents a ticketed event.

    available_tickets is denormalized (could be computed from Ticket
    queryset) but storing it directly makes the GET /events/ endpoint
    cache-friendly and avoids expensive COUNT queries under high load.
    We keep it in sync via select_for_update in the booking flow (Phase 2).
    """

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateTimeField()
    location = models.CharField(max_length=500)
    total_capacity = models.PositiveIntegerField()
    available_tickets = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "events"
        ordering = ["date"]
        indexes = [
            models.Index(fields=["date"]),
            models.Index(fields=["available_tickets"]),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.date.strftime('%Y-%m-%d')})"


class Ticket(models.Model):
    """
    Represents a single seat/ticket for an event.

    Status lifecycle:
      AVAILABLE → RESERVED (booking initiated, 10-min hold)
      RESERVED  → SOLD      (payment confirmed)
      RESERVED  → AVAILABLE (booking expired, cleaned up by Celery Beat)

    The db_index=True on status is critical — Celery Beat's cleanup
    query does: Ticket.objects.filter(status='RESERVED', booking__status='PENDING')
    Without an index this is a full table scan at scale.
    """

    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        RESERVED = "RESERVED", "Reserved"
        SOLD = "SOLD", "Sold"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="tickets")
    seat_number = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tickets"
        unique_together = [("event", "seat_number")]
        indexes = [
            models.Index(fields=["event", "status"]),
        ]

    def __str__(self) -> str:
        return f"Seat {self.seat_number} - {self.event.title} [{self.status}]"


class Booking(models.Model):
    """
    Links a user to one or more tickets for an event.

    Status lifecycle:
      PENDING   → CONFIRMED (payment webhook received)
      PENDING   → EXPIRED   (Celery Beat cleanup after 10 minutes)

    total_price is stored explicitly (not computed) so historical
    bookings reflect the price at time of purchase, even if ticket
    prices change later.
    """

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        EXPIRED = "EXPIRED", "Expired"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="bookings")
    tickets = models.ManyToManyField(Ticket, related_name="bookings")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bookings"
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["status", "created_at"]),  # Celery Beat cleanup query
        ]

    def __str__(self) -> str:
        return f"Booking #{self.pk} - {self.user.username} [{self.status}]"