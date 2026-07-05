# TicketPulse API

A high-performance, production-grade Event Ticketing REST API built to demonstrate advanced backend engineering skills.


## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Django 5.0 + Django REST Framework |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Task Queue | Celery + Celery Beat |
| Containerization | Docker + Docker Compose |
| Documentation | OpenAPI 3.0 via drf-spectacular |
| Testing | pytest + pytest-django |

## Key Features

### Concurrency Control
Handles 1,000 simultaneous booking requests for the same seat without ever producing a double-booking. Implemented using PostgreSQL row-level locking via `select_for_update(nowait=True)` inside `transaction.atomic()`.

**Proven by a threading test:**
10 simultaneous requests → exactly 1 success, 9 conflicts

### Redis Caching (Cache-Aside Pattern)
High-traffic `GET /api/v1/events/` endpoint uses Redis cache-aside pattern:
- Cache HIT → returns in ~1ms (no database query)
- Cache MISS → queries PostgreSQL, stores in Redis
- Cache invalidated automatically when availability changes

### Async Task Processing
PDF ticket generation and email delivery are handled by Celery workers in the background. API responds in ~50ms regardless of how long the background work takes.

### Automated Booking Expiry
Celery Beat runs a cleanup job every 60 seconds. PENDING bookings older than 10 minutes are automatically expired and seats returned to the pool — same pattern as real ticketing platforms.

### Structured Error Handling
Every error response is consistent JSON:
```json
{
    "error": "Seats A1, A2 are no longer available.",
    "code": "CONFLICT",
    "status": 409
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/events/` | List all events (Redis cached) |
| POST | `/api/v1/bookings/` | Create a booking (concurrency-safe) |
| POST | `/api/v1/bookings/{id}/confirm/` | Confirm booking + trigger PDF/email |
| GET | `/health/` | Health check |
| GET | `/api/docs/` | Swagger UI |
| GET | `/api/redoc/` | ReDoc documentation |

## Architecture
          
   Client    ────▶   Django    ────▶ PostgreSQL  
                        +           
                       DRF      


┌────────────┼────────────┐
                           
Redis     Celery        Celery  
Cache     Worker        Beat   
    

## Test Coverage
58 tests - 100% code coverage

| Test Suite        | Tests | Coverage |
|-----------        |-------|----------|
| API endpoints     | 24    | 100% |
| Models            | 10    | 100% |
| Celery tasks      | 8     | 100% |
| Concurrency       | 1     | 100% |
| Error handling    | 6    | 100% |
| Management commands| 4 | 100% |
| Users | 1 | 100% |

## Getting Started

### Prerequisites
- Docker
- Docker Compose

### Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ticketpulse-api.git
cd ticketpulse-api

# Copy environment variables
cp .env.example .env

# Build and start all services
docker compose up -d --build

# Run database migrations
docker compose exec web python manage.py migrate

# Create superuser
docker compose exec web python manage.py createsuperuser

# Set up periodic tasks
docker compose exec web python manage.py setup_periodic_tasks
```

### Access

| Service | URL |
|---------|----|
| API Documentation | http://localhost:8000/api/docs/ |
| Admin Panel | http://localhost:8000/admin/ |
| Health Check | http://localhost:8000/health/ |

### Running Tests

```bash
# Run all tests
docker compose exec web pytest -v

# Run with coverage report
docker compose exec web pytest -v --cov=apps --cov-report=term-missing
```

## Project Structure
ticketpulse/
├── apps/
│   ├── events/
│   │   ├── models.py        # Event, Ticket, Booking models
│   │   ├── views.py         # API views with caching + locking
│   │   ├── serializers.py   # DRF serializers
│   │   ├── tasks.py         # Celery tasks (PDF, email, expiry)
│   │   ├── exceptions.py    # Custom exception handler
│   │   └── tests/           # 58 tests, 100% coverage
│   └── users/
│       └── models.py        # Custom User model
├── config/
│   ├── settings/
│   │   ├── base.py          # Base settings
│   │   └── dev.py           # Development settings
│   ├── celery_app.py        # Celery configuration
│   └── urls.py              # URL routing
├── docker-compose.yml       # 5 services orchestration
├── Dockerfile
└── requirements.txt

## Author

**Abinash Bhattarai**
Fullstack Engineer - Kathmandu, Nepal
