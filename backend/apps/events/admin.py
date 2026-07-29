from django.contrib import admin
from .models import Booking, Event, Ticket


# Register your models here.

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "date", "location", "total_capacity", "available_tickets")
    search_fields = ("title", "location")
    list_filter = ("date",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("seat_number", "event", "price", "status")
    search_fields = ("seat_number", "event__title")
    list_filter = ("status", "event")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "event", "status", "total_price", "created_at")
    search_fields = ("user__username", "event__title")
    list_filter = ("status",)
    readonly_fields = ("total_price", "created_at", "updated_at")