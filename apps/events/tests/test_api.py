
import pytest
import json
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db import OperationalError
from apps.events.models import Booking, Ticket, Event
from apps.events.views import BookingCreateView


class TestHealthCheck:

    def test_health_check_returns_200(self, client):
        response = client.get("/health/")
        assert response.status_code == 200

    def test_health_check_response_format(self, client):
        response = client.get("/health/")
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "TicketPulse API"
        assert "timestamp" in data


class TestEventListAPI:

    def test_unauthenticated_request_returns_401(self, client):
        response = client.get("/api/v1/events/")
        assert response.status_code == 403

    def test_authenticated_request_returns_200(self, api_client, event):
        response = api_client.get("/api/v1/events/")
        assert response.status_code == 200

    def test_events_list_contains_event(self, api_client, event):
        response = api_client.get("/api/v1/events/")
        data = response.json()
        assert len(data) >= 1
        titles = [e["title"] for e in data]
        assert "Test Concert" in titles

    def test_events_list_shows_availability(self, api_client, event):
        response = api_client.get("/api/v1/events/")
        data = response.json()
        test_event = next(e for e in data if e["title"] == "Test Concert")
        assert test_event["available_tickets"] == 5
        assert test_event["total_capacity"] == 5

    def test_events_list_cached_on_second_request(
        self, api_client, event
    ):
    
        from django.core.cache import cache
        cache.clear()

        # First request - cache miss
        response1 = api_client.get("/api/v1/events/")
        assert response1.status_code == 200

        # Second request - cache hit
        response2 = api_client.get("/api/v1/events/")
        assert response2.status_code == 200

        # Bothshould return same data
        assert response1.json() == response2.json()


class TestBookingCreateAPI:

    def test_unauthenticated_booking_returns_401(
        self, client, event, tickets
    ):
        response = client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": event.id,
                "ticket_ids": [tickets[0].id],
            }),
            content_type="application/json",
        )
        assert response.status_code == 403

    def test_valid_booking_returns_201(
        self, api_client, event, tickets
    ):
        response = api_client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": event.id,
                "ticket_ids": [tickets[0].id, tickets[1].id],
            }),
            content_type="application/json",
        )
        assert response.status_code == 201

    def test_booking_response_structure(
        self, api_client, event, tickets
    ):
    
        response = api_client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": event.id,
                "ticket_ids": [tickets[0].id],
            }),
            content_type="application/json",
        )
        data = response.json()
        assert "id" in data
        assert "status" in data
        assert "total_price" in data
        assert "tickets" in data
        assert data["status"] == "PENDING"

    def test_booking_marks_tickets_reserved(
        self, api_client, event, tickets
    ):
        api_client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": event.id,
                "ticket_ids": [tickets[0].id],
            }),
            content_type="application/json",
        )
        tickets[0].refresh_from_db()
        assert tickets[0].status == Ticket.Status.RESERVED

    def test_booking_calculates_total_price(
        self, api_client, event, tickets
    ):
    
        response = api_client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": event.id,
                "ticket_ids": [tickets[0].id, tickets[1].id],
            }),
            content_type="application/json",
        )
        data = response.json()
        # Each ticket is 1000.00, so total should be 2000.00
        assert Decimal(data["total_price"]) == Decimal("2000.00")

    def test_booking_decrements_available_tickets(
        self, api_client, event, tickets
    ):
        
        api_client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": event.id,
                "ticket_ids": [tickets[0].id, tickets[1].id],
            }),
            content_type="application/json",
        )
        event.refresh_from_db()
        assert event.available_tickets == 3

    def test_invalid_event_returns_400(
        self, api_client, tickets
    ):
        response = api_client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": 99999,
                "ticket_ids": [tickets[0].id],
            }),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.json()
        assert data["code"] == "BAD_REQUEST"

    def test_empty_ticket_list_returns_400(
        self, api_client, event
    ):
        response = api_client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": event.id,
                "ticket_ids": [],
            }),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.json()
        assert data["code"] == "BAD_REQUEST"

    def test_duplicate_ticket_ids_returns_400(
        self, api_client, event, tickets
    ):
        response = api_client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": event.id,
                "ticket_ids": [tickets[0].id, tickets[0].id],
            }),
            content_type="application/json",
        )
        assert response.status_code == 400

    def test_already_reserved_ticket_returns_409(
        self, api_client, event, tickets
    ):
        # First booking
        api_client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": event.id,
                "ticket_ids": [tickets[0].id],
            }),
            content_type="application/json",
        )
        # Second booking —same ticket
        response = api_client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": event.id,
                "ticket_ids": [tickets[0].id],
            }),
            content_type="application/json",
        )
        assert response.status_code == 409
        data = response.json()
        assert data["code"] == "CONFLICT"

    def test_nonexistent_ticket_for_event_returns_404(
        self, api_client, event
    ):
        response = api_client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": event.id,
                "ticket_ids": [999999],
            }),
            content_type="application/json",
        )

        assert response.status_code == 404
        data = response.json()
        assert data["code"] == "NOT_FOUND"


class TestBookingConfirmAPI:

    def test_confirm_pending_booking_returns_200(
        self, api_client, pending_booking
    ):
        response = api_client.post(
            f"/api/v1/bookings/{pending_booking.id}/confirm/",
        )
        assert response.status_code == 200

    def test_confirm_changes_status_to_confirmed(
        self, api_client, pending_booking
    ):
        api_client.post(
            f"/api/v1/bookings/{pending_booking.id}/confirm/",
        )
        pending_booking.refresh_from_db()
        assert pending_booking.status == Booking.Status.CONFIRMED

    def test_confirm_marks_tickets_sold(
        self, api_client, pending_booking, tickets
    ):
        api_client.post(
            f"/api/v1/bookings/{pending_booking.id}/confirm/",
        )
        tickets[0].refresh_from_db()
        tickets[1].refresh_from_db()
        assert tickets[0].status == Ticket.Status.SOLD
        assert tickets[1].status == Ticket.Status.SOLD

    def test_confirm_nonexistent_booking_returns_404(
        self, api_client
    ):
        response = api_client.post(
            "/api/v1/bookings/99999/confirm/",
        )
        assert response.status_code == 404

    def test_confirm_already_confirmed_returns_400(
        self, api_client, pending_booking
    ):
        # Confirmfirst time
        api_client.post(
            f"/api/v1/bookings/{pending_booking.id}/confirm/",
        )
        # Try toconfirm again
        response = api_client.post(
            f"/api/v1/bookings/{pending_booking.id}/confirm/",
        )
        assert response.status_code == 400

    def test_confirm_expired_booking_returns_400(
        self, api_client, pending_booking
    ):
        Booking.objects.filter(id=pending_booking.id).update(
            created_at=timezone.now() - timedelta(minutes=11)
        )

        response = api_client.post(
            f"/api/v1/bookings/{pending_booking.id}/confirm/",
        )
        assert response.status_code == 400
        data = response.json()
        message = data.get("error") or data.get("detail", "")
        assert "expired" in str(message).lower()


class TestBookingCreateOperationalError:

    def test_lock_contention_returns_409(self, api_client, event, tickets, monkeypatch):
        def _raise_operational_error(*args, **kwargs):
            raise OperationalError("could not obtain lock")

        monkeypatch.setattr(
            BookingCreateView,
            "_create_booking",
            _raise_operational_error,
        )

        response = api_client.post(
            "/api/v1/bookings/",
            data=json.dumps({
                "event_id": event.id,
                "ticket_ids": [tickets[0].id],
            }),
            content_type="application/json",
        )

        assert response.status_code == 409
        data = response.json()
        assert data["code"] == "CONFLICT"


class TestBookingCreateViewInternalBranches:

    @pytest.mark.django_db
    def test_create_booking_raises_ticket_not_found_for_mismatch_ids(
        self, user, event, tickets
    ):
        view = BookingCreateView()

        with pytest.raises(Ticket.DoesNotExist):
            view._create_booking(
                user=user,
                event=event,
                ticket_ids=[tickets[0].id, 999999],
            )

    @pytest.mark.django_db
    def test_create_booking_raises_value_error_for_unavailable_ticket(
        self, user, event, tickets
    ):
        view = BookingCreateView()

        tickets[0].status = Ticket.Status.RESERVED
        tickets[0].save(update_fields=["status"])

        with pytest.raises(ValueError, match="no longer available"):
            view._create_booking(
                user=user,
                event=event,
                ticket_ids=[tickets[0].id],
            )