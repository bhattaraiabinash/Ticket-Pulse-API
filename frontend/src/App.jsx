import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-violet-600 selection:text-white">
      <div>
        <Navbar />
        <main className="pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/confirmation/:id" element={<BookingConfirmation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}
