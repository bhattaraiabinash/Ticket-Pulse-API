import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ShieldAlert, ArrowLeft, Loader2, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { eventsAPI, bookingsAPI } from '../services/api';
import SeatMap from '../components/SeatMap';
import ConflictModal from '../components/ConflictModal';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const { data: event, isLoading, isError, refetch } = useQuery({
    queryKey: ['eventDetail', id],
    queryFn: () => eventsAPI.getEventDetail(id),
  });

  const handleToggleTicket = (ticket) => {
    if (selectedTickets.some((t) => t.id === ticket.id)) {
      setSelectedTickets(selectedTickets.filter((t) => t.id !== ticket.id));
    } else {
      if (selectedTickets.length >= 10) {
        setToastMessage({ message: 'Maximum 10 tickets allowed per booking.', type: 'warning' });
        return;
      }
      setSelectedTickets([...selectedTickets, ticket]);
    }
  };

  const handleBookNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (selectedTickets.length === 0) {
      setToastMessage({ message: 'Please select at least 1 seat before booking.', type: 'warning' });
      return;
    }

    setIsSubmitting(true);
    setConflictError(null);

    try {
      const ticketIds = selectedTickets.map((t) => t.id);
      const bookingData = await bookingsAPI.createBooking({
        event_id: Number(id),
        ticket_ids: ticketIds,
      });

      // Redirect to Booking page for 10-minute timer & payment simulation
      navigate(`/booking/${bookingData.id}`);
    } catch (err) {
      setIsSubmitting(false);

      if (err.status === 409 || err.code === 'CONFLICT') {
        setConflictError(err.message || 'Seat conflict: These seats are currently being booked or no longer available.');
      } else {
        setToastMessage({ message: err.message || 'Failed to create booking', type: 'error' });
      }
    }
  };

  const totalPrice = selectedTickets.reduce((sum, t) => sum + Number(t.price), 0);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto" />
        <p className="text-slate-400 text-sm">Querying PostgreSQL seat table...</p>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass-card rounded-2xl p-8 border border-red-500/40 text-red-300">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <h3 className="text-lg font-bold">Event Not Found</h3>
          <p className="text-xs text-slate-400 mt-2">The requested event ID could not be loaded.</p>
          <button
            onClick={() => navigate('/events')}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* 409 Conflict Modal */}
      <ConflictModal
        isOpen={!!conflictError}
        errorMessage={conflictError}
        onRetry={() => {
          setConflictError(null);
          setSelectedTickets([]);
          refetch(); // Refresh ticket availability
        }}
        onClose={() => setConflictError(null)}
      />

      {/* Back link */}
      <button
        onClick={() => navigate('/events')}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </button>

      {/* EVENT BANNER & DETAILS */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {event.available_tickets} / {event.total_capacity} Tickets Remaining
            </span>
            <span className="text-xs font-mono text-slate-400">
              Event #{event.id}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{event.title}</h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">{event.description}</p>

          <div className="flex flex-wrap gap-6 text-xs font-medium text-slate-300 pt-4 border-t border-slate-800/80">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              <span>{new Date(event.date).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEAT MAP & SELECTION SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Seat Map Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-violet-400" /> Select Your Seats
          </h2>
          <SeatMap
            tickets={event.tickets || []}
            selectedTicketIds={selectedTickets.map((t) => t.id)}
            onToggleTicket={handleToggleTicket}
          />
        </div>

        {/* Selected Seats Breakdown Sidebar */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 sticky top-24 space-y-6">
            
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Booking Summary</span>
              <ShoppingBag className="w-5 h-5 text-violet-400" />
            </h3>

            {/* List of selected seats */}
            {selectedTickets.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedTickets.map((ticket) => (
                  <div key={ticket.id} className="flex justify-between items-center bg-slate-900/90 px-3 py-2 rounded-lg text-xs border border-slate-800">
                    <span className="font-bold text-white">Seat {ticket.seat_number}</span>
                    <span className="font-mono text-violet-300">Rs. {Number(ticket.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">
                Click seats on the seat map to add them to your reservation.
              </p>
            )}

            {/* Total Price Calculation */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Selected Seats Count:</span>
                <span className="font-bold text-white">{selectedTickets.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-slate-800/60">
                <span>Total Amount:</span>
                <span className="text-xl font-extrabold text-violet-400 font-mono">
                  Rs. {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleBookNow}
              disabled={isSubmitting || selectedTickets.length === 0}
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Locking Seats (select_for_update)...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proceed to Booking ({selectedTickets.length})</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-500 text-center">
              PostgreSQL row lock guarantees exclusive 10-minute hold upon clicking proceed.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
}
