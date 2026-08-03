# TicketPulse — Enterprise SaaS Event Ticketing Platform

A production-grade, high-performance Event Ticketing Web Application competing with Ticketmaster, BookMyShow, and Khalti Events in Nepal & South Asia. Built with a **Django 5.0 REST Framework** backend and a high-end **React 18 + TypeScript + Vite + Tailwind CSS** frontend.

Tagline: *"Every seat. Every moment. Perfectly placed."*

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
| Documentation | OpenAPI 3.0 via drf-spectacular (Swagger UI & ReDoc at `/api/docs/`) |
| Testing | pytest — 58 test suite cases, 100% coverage |

### Frontend (`/frontend`)
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS (Indigo `#6366F1`, Purple `#8B5CF6`, Amber `#F59E0B`) |
| Animations | Framer Motion + Canvas Confetti + Particle Canvas |
| State Management | Zustand (`useStore`) + React Query (@tanstack/react-query) |
| API Client | Axios (with session credentials & structured DRF error interceptor) |
| Navigation | React Router v6 |
| Notifications | React Hot Toast |
| Icons | Lucide React |

---

## 🔥 Key Features

1. **PostgreSQL Row-Level Locking**
   - Uses `select_for_update(nowait=True)` inside `transaction.atomic()` to guarantee 0 double bookings under concurrent seat selection.

2. **Redis Cache-Aside Architecture**
   - High-traffic `GET /api/v1/events/` endpoint checks Redis first (~1ms response time) and invalidates automatically on ticket reservation.

3. **10-Minute Concurrency Reservation Timer**
   - Visual 10-minute timer for seat holds with auto-redirection on expiration.

4. **Floating AI Assistant ChatBot**
   - Embedded ticket bot capable of querying live available events, explaining booking steps, and answering ticketing FAQs.

5. **Visual Seat Selection Map**
   - Interactive grid (Rows A-E) displaying status (Available: Emerald, Selected: Amber, Occupied: Rose).

6. **Dark / Light Glassmorphism Theme**
   - Smooth 300ms CSS transition between dark `#0A0A0F` and light `#FFFFFF` modes with system preference detection & localStorage persistence.

---

## 🛠️ Quick Start

```bash
# 1. Backend (Django)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# 2. Frontend (React + Vite + TypeScript)
cd frontend
npm install
npm run dev
```

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/events/` | List all events (Redis cached) |
| `GET` | `/api/v1/events/{id}/` | Get single event details + visual seat map |
| `POST` | `/api/v1/bookings/` | Create pending booking (Row-level locked) |
| `GET` | `/api/v1/bookings/{id}/` | Get booking details |
| `POST` | `/api/v1/bookings/{id}/confirm/` | Confirm booking & dispatch PDF + Email Celery task |
| `POST` | `/api/v1/users/register/` | User registration |
| `POST` | `/api/v1/users/login/` | User login |
| `GET` | `/health/` | API Health check |
| `GET` | `/api/docs/` | OpenAPI 3.0 Swagger UI |

---

## 👤 Author

**Abinash Bhattarai**  
Fullstack Senior Software Engineer — Nepal  
GitHub: [bhattaraiabinash](https://github.com/bhattaraiabinash)
