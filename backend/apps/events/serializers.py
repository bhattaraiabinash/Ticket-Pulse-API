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
        extra_kwargs = {
            "available_tickets": {"required": False},
        }

    def create(self, validated_data):
        if "available_tickets" not in validated_data:
            validated_data["available_tickets"] = validated_data.get("total_capacity", 20)
        event = Event.objects.create(**validated_data)

        # Auto-generate tickets for the event
        capacity = event.total_capacity or 20
        tickets = []
        rows = ['A', 'B', 'C', 'D', 'E']
        seats_per_row = max(1, capacity // len(rows))

        created_count = 0
        for r in rows:
            for s in range(1, seats_per_row + 1):
                if created_count >= capacity:
                    break
                price = Decimal("250.00") if r == 'A' else (Decimal("150.00") if r == 'B' else Decimal("80.00"))
                tickets.append(Ticket(
                    event=event,
                    seat_number=f"{r}{s}",
                    price=price,
                    status=Ticket.Status.AVAILABLE
                ))
                created_count += 1

        if tickets:
            Ticket.objects.bulk_create(tickets)
        return event


class EventDetailSerializer(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            "id", "title", "description", "date",
            "location", "total_capacity", "available_tickets", "tickets",
        ]


class BookingCreateSerializer(serializers.Serializer): 
   

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