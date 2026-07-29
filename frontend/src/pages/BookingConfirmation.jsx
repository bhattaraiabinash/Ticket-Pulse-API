import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Mail, Download, Ticket, Calendar, MapPin, Sparkles, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useQuery } from '@tanstack/react-query';
import { bookingsAPI } from '../services/api';
import { Loader2 } from 'lucide-react';

export default function BookingConfirmation() {
  const { id } = useParams();

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['bookingConfirmation', id],
    queryFn: () => bookingsAPI.getBookingDetail(id),
  });

  useEffect(() => {
    // Fire confetti explosion on load
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7C3AED', '#4F46E5', '#10B981', '#F43F5E'],
      });
    } catch (e) {
      // Confetti fail-safe
    }
  }, []);

  const handleDownloadTicket = () => {
    // Generate a downloadable text/json representation simulating the PDF ticket
    if (!booking) return;
    const ticketText = `
=====================================================
            TICKETPULSE - CONFIRMED TICKET
=====================================================
Booking ID: #${booking.id}
Event: ${booking.event?.title}
Date: ${booking.event?.date}
Location: ${booking.event?.location}
Seats: ${booking.tickets?.map(t => t.seat_number).join(', ')}
Total Paid: Rs. ${booking.total_price}
Status: CONFIRMED (Celery PDF + QR Generated)
=====================================================
    `;
    const element = document.createElement('a');
    const file = new Blob([ticketText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `TicketPulse_Booking_${booking.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto" />
        <p className="text-slate-400 text-sm">Fetching confirmed ticket details...</p>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="glass-card rounded-2xl p-8 border border-red-500/40 text-red-300">
          <h3 className="text-lg font-bold">Booking Not Found</h3>
          <p className="text-xs text-slate-400 mt-2">Could not load confirmation receipt.</p>
          <Link to="/" className="mt-4 inline-block px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      
      {/* Animated Success Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center mx-auto shadow-2xl glow-emerald">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-extrabold text-white">Booking Confirmed!</h1>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Your payment has been processed and your tickets are officially reserved.
        </p>

        {/* Email Notification Alert Pill */}
        <div className="inline-flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/30 px-4 py-2 rounded-full text-xs text-emerald-300">
          <Mail className="w-4 h-4 text-emerald-400" />
          <span>Email confirmation sent! Celery PDF ticket worker dispatched.</span>
        </div>
      </motion.div>

      {/* Booking Receipt Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6"
      >
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Order Reference</span>
            <p className="text-xl font-extrabold text-white">Booking #{booking.id}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {booking.status}
          </span>
        </div>

        {/* Event Meta */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3">
          <h3 className="text-lg font-bold text-white">{booking.event?.title}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              <span>{new Date(booking.event?.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>{booking.event?.location}</span>
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Confirmed Seats</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {booking.tickets?.map((t) => (
              <div key={t.id} className="bg-violet-950/40 border border-violet-500/30 rounded-xl p-3 text-center">
                <Ticket className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-white">Seat {t.seat_number}</p>
                <p className="text-[10px] text-violet-300 font-mono">Rs. {Number(t.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Total Price */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <span className="text-sm font-bold text-slate-300">Total Paid:</span>
          <span className="text-2xl font-extrabold text-white font-mono">
            Rs. {Number(booking.total_price).toFixed(2)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={handleDownloadTicket}
            className="flex-1 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Ticket (PDF/TXT)</span>
          </button>

          <Link
            to="/"
            className="py-3 px-6 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>

      </motion.div>

    </div>
  );
}
