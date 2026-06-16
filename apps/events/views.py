from django.shortcuts import render

# Create your views here.
import logging

from django.db import transaction, OperationalError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking, Event, Ticket
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    EventSerializer,
)

logger = logging.getLogger(__name__)


class EventListView(APIView):
    """
    GET /api/v1/events/
    Returns all upcoming events.
    Phase 3 will add Redis caching here.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        events = Event.objects.all()
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)


class BookingCreateView(APIView):
    """
    POST /api/v1/bookings/

    The critical endpoint. Handles 1000 simultaneous requests
    for the same seats without ever producing a double-booking.

    The mechanism:
      1. transaction.atomic()    — wraps everything in one DB transaction
      2. select_for_update()     — locks the ticket rows at PostgreSQL level
      3. Status check            — verifies tickets are still AVAILABLE
      4. Atomic update           — marks RESERVED, creates PENDING booking
      5. Commit or rollback      — locks released, other requests proceed

    nowait=True means: if another transaction already holds the lock,
    raise OperationalError immediately instead of waiting forever.
    This gives us a clean 409 Conflict rather than a request timeout.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = BookingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        event: Event = serializer.validated_data["event"]
        ticket_ids: list[int] = serializer.validated_data["ticket_ids"]

        try:
            booking = self._create_booking(
                user=request.user,
                event=event,
                ticket_ids=ticket_ids,
            )
        except Ticket.DoesNotExist:
            return Response(
                {"detail": "One or more tickets not found for this event."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except OperationalError:
            # Another transaction holds the lock on these tickets.
            # nowait=True surfaces this immediately as 409 instead of hanging.
            logger.warning(
                "Lock contention on tickets %s for event %s",
                ticket_ids,
                event.id,
            )
            return Response(
                {"detail": "These seats are currently being booked. Please try again."},
                status=status.HTTP_409_CONFLICT,
            )
        except ValueError as e:
            # Tickets are not AVAILABLE (already RESERVED or SOLD)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_409_CONFLICT,
            )

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
        Everything inside this method runs in a single atomic transaction.

        select_for_update(nowait=True) acquires a row-level exclusive lock
        on each requested ticket row. PostgreSQL holds these locks until the
        transaction commits or rolls back.

        If two requests race here:
          - First one in: acquires locks, proceeds normally
          - Second one in: hits OperationalError immediately (nowait=True)
            → caller returns 409 Conflict

        This is the gold standard for high-concurrency inventory systems.
        """

        # Acquire row-level locks on the requested tickets.
        # order_by() ensures consistent lock ordering — prevents deadlocks
        # when two requests try to lock the same tickets in different order.
        tickets = (
            Ticket.objects.select_for_update(nowait=True)
            .filter(id__in=ticket_ids, event=event)
            .order_by("id")
        )

        if tickets.count() != len(ticket_ids):
            raise Ticket.DoesNotExist

        # Check every locked ticket is still AVAILABLE.
        # This check happens AFTER locking, so the status can't change
        # between our check and our write — that's the whole point.
        unavailable = [
            t.seat_number
            for t in tickets
            if t.status != Ticket.Status.AVAILABLE
        ]
        if unavailable:
            raise ValueError(
                f"Seats {', '.join(unavailable)} are no longer available."
            )

        # Calculate total price from the locked ticket data
        total_price = sum(t.price for t in tickets)

        # Create the booking
        booking = Booking.objects.create(
            user=user,
            event=event,
            total_price=total_price,
            status=Booking.Status.PENDING,
        )
        booking.tickets.set(tickets)

        # Mark tickets as RESERVED
        tickets.update(status=Ticket.Status.RESERVED)

        # Decrement available_tickets on the event (denormalized field)
        Event.objects.filter(pk=event.pk).update(
            available_tickets=event.available_tickets - len(ticket_ids)
        )

        logger.info(
            "Booking #%s created — user=%s event=%s tickets=%s total=%s",
            booking.id,
            user.id,
            event.id,
            ticket_ids,
            total_price,
        )

        return booking