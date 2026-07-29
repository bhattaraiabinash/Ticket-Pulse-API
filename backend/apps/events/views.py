import logging
from datetime import timedelta

from django.core.cache import cache
from django.db import transaction, OperationalError
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiExample
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .exceptions import ConflictError
from .models import Booking, Event, Ticket
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    EventSerializer,
    EventDetailSerializer,
)

logger = logging.getLogger(__name__)

EVENTS_CACHE_KEY = "ticketpulse:events:list"
EVENTS_CACHE_TTL = 60 * 15  # 15 minutes


class EventListView(APIView):
    """
    GET /api/v1/events/

    Returns list of all events using Redis cache-aside pattern.
    Cache MISS → query PostgreSQL → store in Redis → return
    Cache HIT  → return from Redis (no DB query)
    """

    permission_classes = [AllowAny]

    @extend_schema(responses=EventSerializer(many=True))
    def get(self, request: Request) -> Response:
        # Step 1: Check Redis first
        cached_data = cache.get(EVENTS_CACHE_KEY)
        if cached_data is not None:
            logger.debug("Cache HIT — returning events from Redis")
            return Response(cached_data)

        # Step 2: Cache MISS — query PostgreSQL
        logger.debug("Cache MISS — querying PostgreSQL")
        events = Event.objects.all()
        serializer = EventSerializer(events, many=True)
        data = serializer.data

        # Step 3: Store in Redis for next request
        cache.set(EVENTS_CACHE_KEY, data, timeout=EVENTS_CACHE_TTL)
        logger.debug(
            "Stored events in Redis cache (TTL: %s seconds)",
            EVENTS_CACHE_TTL,
        )

        return Response(data)

    @extend_schema(request=EventSerializer, responses=EventSerializer)
    def post(self, request: Request) -> Response:
        if not request.user or not request.user.is_authenticated or not request.user.is_staff:
            return Response(
                {"error": "Only admin staff can create events.", "code": "FORBIDDEN"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            event = serializer.save()
            cache.delete(EVENTS_CACHE_KEY)
            return Response(EventSerializer(event).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookingCreateView(APIView):
    """
    POST /api/v1/bookings/

    Creates a booking with PostgreSQL row-level locking.
    Guarantees zero double-bookings under concurrent load.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=BookingCreateSerializer,
        responses=BookingSerializer,
        examples=[
            OpenApiExample(
                name="Book two seats",
                value={"event_id": 1, "ticket_ids": [1, 2]},
                request_only=True,
            )
        ],
    )
    def post(self, request: Request) -> Response:
        serializer = BookingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            raise ValidationError(serializer.errors)

        event: Event = serializer.validated_data["event"]
        ticket_ids: list[int] = serializer.validated_data["ticket_ids"]

        try:
            booking = self._create_booking(
                user=request.user,
                event=event,
                ticket_ids=ticket_ids,
            )
        except Ticket.DoesNotExist:
            raise NotFound(
                "One or more tickets not found for this event."
            )
        except OperationalError:
            logger.warning(
                "Lock contention on tickets %s for event %s",
                ticket_ids,
                event.id,
            )
            raise ConflictError(
                "These seats are currently being booked. Please try again."
            )
        except ValueError as e:
            raise ConflictError(str(e))

        output = BookingSerializer(booking)
        return Response(output.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def _create_booking(
        self,
        user,
        event: Event,
        ticket_ids: list[int],
    ) -> Booking:
        """
        Core booking logic inside atomic transaction.

        select_for_update(nowait=True) acquires exclusive row-level
        locks on ticket rows. If another transaction holds the lock,
        raises OperationalError immediately (no waiting).
        """

        # Acquire row-level locks — consistent ordering prevents deadlocks
        tickets = (
            Ticket.objects.select_for_update(nowait=True)
            .filter(id__in=ticket_ids, event=event)
            .order_by("id")
        )

        if tickets.count() != len(ticket_ids):
            raise Ticket.DoesNotExist

        # Check all locked tickets are still AVAILABLE
        unavailable = [
            t.seat_number
            for t in tickets
            if t.status != Ticket.Status.AVAILABLE
        ]
        if unavailable:
            raise ValueError(
                f"Seats {', '.join(unavailable)} are no longer available."
            )

        total_price = sum(t.price for t in tickets)

        booking = Booking.objects.create(
            user=user,
            event=event,
            total_price=total_price,
            status=Booking.Status.PENDING,
        )
        booking.tickets.set(tickets)
        tickets.update(status=Ticket.Status.RESERVED)

        new_available = event.available_tickets - len(ticket_ids)
        Event.objects.filter(pk=event.pk).update(
            available_tickets=new_available
        )

        # Invalidate cache — availability has changed
        cache.delete(EVENTS_CACHE_KEY)
        logger.debug("Cache invalidated — available_tickets changed")

        logger.info(
            "Booking #%s created — user=%s event=%s tickets=%s total=%s",
            booking.id,
            user.id,
            event.id,
            ticket_ids,
            total_price,
        )

        return booking


class BookingConfirmView(APIView):
   
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses=BookingSerializer,
        description=(
            "Confirm a PENDING booking. "
            "Triggers Celery task to generate PDF ticket and send email. "
            "Booking must be confirmed within 10 minutes of creation."
        ),
    )
    def post(self, request: Request, booking_id: int) -> Response:
        try:
            booking = Booking.objects.select_related(
                "user", "event"
            ).prefetch_related("tickets").get(
                id=booking_id,
                user=request.user,
            )
        except Booking.DoesNotExist:
            raise NotFound("Booking not found.")

        if booking.status != Booking.Status.PENDING:
            raise ValidationError(
                f"Booking is already {booking.status}."
            )

        expiry_time = booking.created_at + timedelta(minutes=10)
        if timezone.now() > expiry_time:
            raise ValidationError(
                "Booking has expired. Please start again."
            )

        booking.status = Booking.Status.CONFIRMED
        booking.save(update_fields=["status", "updated_at"])

        booking.tickets.update(status=Ticket.Status.SOLD)

        # Hand off to Celery — non-blocking
        from .tasks import send_booking_confirmation
        send_booking_confirmation.delay(booking.id)

        logger.info(
            "Booking #%s confirmed — Celery task dispatched",
            booking.id,
        )

        output = BookingSerializer(booking)
        return Response(output.data, status=status.HTTP_200_OK)


class EventDetailView(APIView):
    """
    GET /api/v1/events/<int:pk>/

    Returns single event details including seat map tickets.
    """
    permission_classes = [AllowAny]

    @extend_schema(responses=EventDetailSerializer)
    def get(self, request: Request, pk: int) -> Response:
        try:
            event = Event.objects.prefetch_related("tickets").get(pk=pk)
        except Event.DoesNotExist:
            raise NotFound("Event not found.")
        serializer = EventDetailSerializer(event)
        return Response(serializer.data)


class BookingDetailView(APIView):
    """
    GET /api/v1/bookings/<int:booking_id>/

    Returns booking details for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=BookingSerializer)
    def get(self, request: Request, booking_id: int) -> Response:
        try:
            booking = Booking.objects.select_related("user", "event").prefetch_related("tickets").get(
                id=booking_id,
                user=request.user,
            )
        except Booking.DoesNotExist:
            raise NotFound("Booking not found.")
        serializer = BookingSerializer(booking)
        return Response(serializer.data)