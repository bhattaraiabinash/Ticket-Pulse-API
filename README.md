# TicketPulse — Full-Stack Event Ticketing Platform

A production-grade, high-performance Event Ticketing Web Application built with a Django REST Framework backend and a modern React 18 + Vite frontend.

Designed to handle high-demand ticket sales (similar to Ticketmaster/BookMyShow) with zero double-bookings under concurrent load.

---

## 🚀 Tech Stack

### Backend (`/backend`)
| Layer | Technology |
|---|---|
| Framework | Django 5.0 + Django REST Framework |
| Database | PostgreSQL 16 (Row-Level Locking `select_for_update`) |
| Cache | Redis 7 (Cache-aside pattern on events endpoint) |
| Task Queue | Celery + Celery Beat (PDF generation + email + auto-expiry) |
| Containerization | Docker + Docker Compose (5 services) |
| Documentation | OpenAPI 3.0 via drf-spectacular (Swagger UI & ReDoc) |
| Testing | pytest — 58 test suite cases, 100% coverage |

### Frontend (`/frontend`)
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS (Deep Navy `#0F172A`, Electric Purple `#7C3AED`) |
| API Client | Axios (with credentials & structured DRF error interceptor) |
| Navigation | React Router v6 |
| State & Cache | React Query (@tanstack/react-query) |
| UI & Animations | Framer Motion + Lucide React + Canvas Confetti |

---

## 🔥 Key Engineering Features

1. **Concurrency Control (PostgreSQL Row-Level Locking)**
   - Uses `select_for_update(nowait=True)` inside `transaction.atomic()`.
   - Proven by multi-threading concurrency tests: 10 simultaneous requests for the same seat → exactly 1 success, 9 conflict responses (`409 CONFLICT`).

2. **Redis Cache-Aside Architecture**
   - High-traffic `GET /api/v1/events/` endpoint checks Redis first.
   - **Cache HIT:** ~1ms latency.
   - **Cache MISS:** Queries PostgreSQL, populates Redis cache (15-min TTL).
   - Automatically invalidates cache whenever available ticket counts change.

3. **Async Task Processing & Automated Expiry**
   - Confirming a booking dispatches a Celery background task to generate PDF tickets with QR codes and send confirmation emails without blocking HTTP responses.
   - Celery Beat worker runs every 60 seconds to expire `PENDING` bookings older than 10 minutes and return reserved seats back to the available pool.

4. **Interactive SaaS Frontend**
   - **Hero & Event Listing:** Live search, availability badges ("🔥 Only 3 seats left!"), loading skeletons.
   - **Visual Seat Map Grid:** Color-coded seats (Available: Emerald, Selected: Purple, Reserved: Amber, Sold: Slate) with real-time price calculations.
   - **10-Minute Expiry Countdown:** Synchronized countdown timer matching backend reservation expiry.
   - **Sandbox Payment Simulation & Instant PDF Download:** Interactive modal with instant confirmation feedback.

---

## 📂 Project Structure

```
ticketpulse/
├── backend/                  ← Django REST Framework Backend
│   ├── apps/
│   │   ├── events/           # Events, Tickets, Bookings views, serializers, tasks & tests
│   │   └── users/            # Custom User model & Auth endpoints
│   ├── config/
│   │   ├── settings/         # Base & Dev settings (with CORS enabled)
│   │   ├── celery_app.py     # Celery worker configuration
│   │   └── urls.py           # API routing & OpenAPI docs
│   ├── docker-compose.yml    # Orchestrates PostgreSQL, Redis, Web, Celery Worker & Beat
│   ├── Dockerfile
│   ├── pytest.ini
│   └── requirements.txt
├── frontend/                 ← React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/       # Navbar, Footer, SeatMap, CountdownTimer, Modals, Toast
│   │   ├── context/          # AuthContext provider
│   │   ├── pages/            # Home, EventsList, EventDetail, Booking, Confirmation, Auth
│   │   ├── services/         # Axios API service layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🛠️ Quick Start Guide

### Prerequisites
- Python 3.12+ / Node.js 18+
- Docker & Docker Compose (Optional for containerized run)

### Running Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Run migrations & development server
python manage.py migrate
python manage.py runserver
```
The Django API server will run at `http://localhost:8000`.

### Running Frontend (React)

```bash
cd frontend
npm install
npm run dev
```
The React application will run at `http://localhost:5173`.

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/events/` | List all events (Redis cached) |
| `GET` | `/api/v1/events/{id}/` | Get single event details + visual seat map tickets |
| `POST` | `/api/v1/bookings/` | Create pending booking (Row-level locked) |
| `GET` | `/api/v1/bookings/{id}/` | Get booking details |
| `POST` | `/api/v1/bookings/{id}/confirm/` | Confirm booking & trigger Celery PDF+Email |
| `POST` | `/api/v1/users/register/` | User registration |
| `POST` | `/api/v1/users/login/` | User login & session setup |
| `GET` | `/health/` | API Health check |
| `GET` | `/api/docs/` | Swagger UI OpenAPI Documentation |

---

## 👤 Author

**Abinash Bhattarai**  
Fullstack Engineer — Kathmandu, Nepal  
GitHub: [bhattaraiabinash](https://github.com/bhattaraiabinash)
