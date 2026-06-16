from django.urls import path

from .views import BookingCreateView, EventListView

urlpatterns = [
    path("events/", EventListView.as_view(), name="event-list"),
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
]