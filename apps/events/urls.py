from django.urls import path
from .views import BookingCreateView, BookingConfirmView, EventListView

urlpatterns = [
    path("events/", EventListView.as_view(), name="event-list"),
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path(
        "bookings/<int:booking_id>/confirm/",
        BookingConfirmView.as_view(),
        name="booking-confirm",
    ),
]