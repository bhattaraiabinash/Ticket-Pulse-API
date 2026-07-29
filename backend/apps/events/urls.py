from django.urls import path
from .views import (
    BookingCreateView,
    BookingConfirmView,
    BookingDetailView,
    EventListView,
    EventDetailView,
)

urlpatterns = [
    path("events/", EventListView.as_view(), name="event-list"),
    path("events/<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("bookings/<int:booking_id>/", BookingDetailView.as_view(), name="booking-detail"),
    path(
        "bookings/<int:booking_id>/confirm/",
        BookingConfirmView.as_view(),
        name="booking-confirm",
    ),
]