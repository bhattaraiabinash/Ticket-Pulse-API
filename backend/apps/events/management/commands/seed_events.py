from datetime import timedelta
from decimal import Decimal
from django.core.cache import cache
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.events.models import Event, Ticket, Booking
from apps.users.models import User

class Command(BaseCommand):
    help = "Seed sample high-demand events, seats, and superuser admin"

    def handle(self, *args, **kwargs):
        # 1. Clear Redis cache first
        cache.clear()

        # 2. Ensure Superuser Admin exists
        admin_user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@ticketpulse.com",
                "is_staff": True,
                "is_superuser": True,
            }
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created superuser: admin / admin123"))
        else:
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()

        # 3. Ensure sample user exists
        sample_user, u_created = User.objects.get_or_create(
            username="johndoe",
            defaults={"email": "johndoe@example.com"}
        )
        if u_created:
            sample_user.set_password("password123")
            sample_user.save()

        # 4. Clean old bookings/tickets/events if desired or seed missing
        Booking.objects.all().delete()
        Ticket.objects.all().delete()
        Event.objects.all().delete()

        events_data = [
            {
                "title": "Coldplay — Music of the Spheres World Tour 2026",
                "description": "Experience the world's biggest stadium tour live with eco-friendly kinetic dance floors, immersive light shows, and iconic anthems.",
                "days_ahead": 15,
                "location": "Dasharath National Stadium, Kathmandu",
                "rows": [
                    ("VIP-A", 5, Decimal("250.00")),
                    ("CAT1-B", 10, Decimal("150.00")),
                    ("CAT2-C", 10, Decimal("90.00")),
                ]
            },
            {
                "title": "TechEx Global AI & Cloud Summit 2026",
                "description": "The premiere conference for Next-Gen AI Engineers, LLM System Designers, and High-Performance Distributed Systems Experts.",
                "days_ahead": 30,
                "location": "Silicon Valley Convention Center, CA",
                "rows": [
                    ("EXEC-A", 5, Decimal("499.00")),
                    ("DEV-B", 10, Decimal("299.00")),
                    ("GEN-C", 10, Decimal("149.00")),
                ]
            },
            {
                "title": "UEFA Champions League Final Viewing Party 2026",
                "description": "Live 4K Ultra-HD broadcast on massive LED screens with live DJ commentary, stadium seating, and VIP lounges.",
                "days_ahead": 45,
                "location": "London Wembley Arena Hub",
                "rows": [
                    ("LOUNGE-A", 5, Decimal("180.00")),
                    ("PITCH-B", 10, Decimal("100.00")),
                    ("STAND-C", 10, Decimal("60.00")),
                ]
            },
            {
                "title": "Quantum Pulse EDM Beach Festival",
                "description": "3-Day nonstop electronic dance music festival featuring world top 10 DJs, laser shows, and futuristic soundstages.",
                "days_ahead": 60,
                "location": "Ibiza Sunset Beach Arena, Spain",
                "rows": [
                    ("STAGE-A", 5, Decimal("320.00")),
                    ("DANCE-B", 10, Decimal("210.00")),
                    ("BEACH-C", 10, Decimal("120.00")),
                ]
            }
        ]

        created_events_count = 0
        created_tickets_count = 0

        for item in events_data:
            event = Event.objects.create(
                title=item["title"],
                description=item["description"],
                date=timezone.now() + timedelta(days=item["days_ahead"]),
                location=item["location"],
                total_capacity=sum(cnt for _, cnt, _ in item["rows"]),
                available_tickets=sum(cnt for _, cnt, _ in item["rows"]),
            )
            created_events_count += 1

            for row_prefix, count, price in item["rows"]:
                for i in range(1, count + 1):
                    seat_num = f"{row_prefix}{i}"
                    Ticket.objects.create(
                        event=event,
                        seat_number=seat_num,
                        price=price,
                        status=Ticket.Status.AVAILABLE
                    )
                    created_tickets_count += 1

        cache.clear()

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {created_events_count} events with {created_tickets_count} total tickets!\n"
                f"Admin user: admin / admin123\n"
                f"Sample user: johndoe / password123"
            )
        )
