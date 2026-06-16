import logging
from decimal import Decimal

from rest_framework import serializers

from .models import Booking, Event, Ticket

logger = logging.getLogger(__name__)


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ["id", "seat_number", "price", "status"]
        read_only_fields = ["status"]


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id", "title", "description", "date",
            "location", "total_capacity", "available_tickets",
        ]


class BookingCreateSerializer(serializers.Serializer):
    """
    Input serializer for POST /api/v1/bookings/

    We use a plain Serializer (not ModelSerializer) because the booking
    creation logic is complex — it spans multiple models, involves locking,
    and computes total_price dynamically. ModelSerializer would fight us here.
    """

    event_id = serializers.IntegerField()
    ticket_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=10,
    )

    def validate_ticket_ids(self, value: list[int]) -> list[int]:
        if len(value) != len(set(value)):
            raise serializers.ValidationError(
                "Duplicate ticket IDs are not allowed."
            )
        return value

    def validate(self, attrs: dict) -> dict:
        event_id = attrs.get("event_id")
        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            raise serializers.ValidationError(
                {"event_id": f"Event {event_id} does not exist."}
            )
        attrs["event"] = event
        return attrs


class BookingSerializer(serializers.ModelSerializer):
    """Output serializer — what we return after a successful booking."""

    tickets = TicketSerializer(many=True, read_only=True)
    event = EventSerializer(read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "user", "event", "tickets",
            "status", "total_price", "created_at",
        ]
        read_only_fields = fields