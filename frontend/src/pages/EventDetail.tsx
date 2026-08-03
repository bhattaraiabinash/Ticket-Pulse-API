import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventDetail } from '../hooks/useEvents';
import { useBooking } from '../hooks/useBooking';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';
import { Ticket as TicketType } from '../types';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Share2, 
  Clock, 
  Check, 
  ShieldCheck, 
  Ticket, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = id ? parseInt(id, 10) : null;
  const navigate = useNavigate();

  const { data: event, isLoading, isError } = useEventDetail(eventId);
  const { createBooking, isCreating } = useBooking();
  const { isAuthenticated } = useAuth();
  
  const { selectedTickets, toggleSelectTicket, clearTicketSelection, setSelectedEvent } = useStore();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (event) {
      setSelectedEvent(event);
    }
  }, [event, setSelectedEvent]);

  if (isLoading) {
    return (
      <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-64 rounded-3xl bg-surface/80" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 rounded-3xl bg-surface/80" />
          <div className="h-96 rounded-3xl bg-surface/80" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="pt-32 pb-20 px-4 max-w-xl mx-auto text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="font-heading font-bold text-2xl text-foreground">Event Not Found</h2>
        <p className="text-sm text-muted-foreground">The event you are looking for does not exist or has ended.</p>
        <button
          onClick={() => navigate('/events')}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Event link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSeatClick = (ticket: TicketType) => {
    if (ticket.status !== 'AVAILABLE') return;
    if (!selectedTickets.some(t => t.id === ticket.id) && selectedTickets.length >= 10) {
      toast.error('Maximum 10 seats allowed per booking transaction.');
      return;
    }
    toggleSelectTicket(ticket);
  };

  const subtotal = selectedTickets.reduce((sum, t) => sum + Number(t.price), 0);
  const serviceFee = subtotal * 0.05; // 5% fee
  const grandTotal = subtotal + serviceFee;

  const handleProceedToBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to proceed with seat reservation.');
      navigate('/login', { state: { from: `/events/${event.id}` } });
      return;
    }

    if (selectedTickets.length === 0) {
      toast.error('Please select at least 1 available seat.');
      return;
    }

    try {
      const ticketIds = selectedTickets.map((t) => t.id);
      await createBooking({ eventId: event.id, ticketIds });
      clearTicketSelection();
      navigate('/booking');
    } catch (err) {
      // Error toast handled in hook
    }
  };

  // Group tickets by row (A, B, C...)
  const ticketsByRow: Record<string, TicketType[]> = {};
  if (event.tickets) {
    event.tickets.forEach((t) => {
      const rowChar = t.seat_number.charAt(0);
      if (!ticketsByRow[rowChar]) ticketsByRow[rowChar] = [];
      ticketsByRow[rowChar].push(t);
    });
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden glass-card border border-border shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-purple-950/80 to-slate-950 z-10" />
        <img
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80"
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        <div className="relative z-20 p-8 sm:p-12 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {event.category || 'Live Event'}
            </span>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied Link' : 'Share Event'}</span>
            </button>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{event.available_tickets} / {event.total_capacity} Seats Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN GRID: SEAT MAP & BOOKING SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLS: EVENT DETAILS & SEAT MAP */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Description */}
          <div className="p-6 rounded-3xl glass-card border border-border space-y-3">
            <h3 className="font-heading font-bold text-lg text-foreground">About This Event</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* VISUAL SEAT SELECTION GRID */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card border border-border space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <h3 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-500" /> Select Your Seats
                </h3>
                <p className="text-xs text-muted-foreground">
                  Click on an available seat to add it to your booking (Max 10).
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/20 border border-emerald-500"></span>
                  <span className="text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-amber-500 border border-amber-400 shadow-sm"></span>
                  <span className="text-muted-foreground">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-rose-500/20 border border-rose-500/40 opacity-50"></span>
                  <span className="text-muted-foreground">Occupied</span>
                </div>
              </div>
            </div>

            {/* STAGE GRAPHIC */}
            <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 border border-indigo-500/30 text-center font-mono text-xs text-indigo-400 uppercase tracking-widest font-semibold shadow-inner">
              ── STAGE / PERFORMANCE AREA ──
            </div>

            {/* SEAT GRID LAYOUT */}
            <div className="space-y-4 pt-2">
              {Object.keys(ticketsByRow).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No seat mapping available for this event.
                </p>
              ) : (
                Object.entries(ticketsByRow).map(([rowLabel, rowTickets]) => (
                  <div key={rowLabel} className="flex items-center gap-3">
                    <span className="w-6 font-mono font-bold text-sm text-indigo-500 text-center">
                      {rowLabel}
                    </span>

                    <div className="flex-1 grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                      {rowTickets.map((t) => {
                        const isSelected = selectedTickets.some((st) => st.id === t.id);
                        const isAvailable = t.status === 'AVAILABLE';

                        return (
                          <motion.button
                            key={t.id}
                            whileHover={isAvailable ? { scale: 1.1 } : {}}
                            whileTap={isAvailable ? { scale: 0.95 } : {}}
                            onClick={() => handleSeatClick(t)}
                            disabled={!isAvailable}
                            title={`Seat ${t.seat_number} - NPR ${t.price} (${t.status})`}
                            className={`h-11 rounded-xl font-mono text-xs font-bold transition-all flex flex-col items-center justify-center border relative ${
                              isSelected
                                ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/50'
                                : isAvailable
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-surface/50 text-muted-foreground border-border/40 cursor-not-allowed opacity-40 line-through'
                            }`}
                          >
                            <span>{t.seat_number}</span>
                            <span className="text-[9px] font-normal opacity-80">₹{t.price}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selected Seats Pill List */}
            {selectedTickets.length > 0 && (
              <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    Selected Seats ({selectedTickets.length})
                  </span>
                  <button
                    onClick={clearTicketSelection}
                    className="text-rose-500 hover:underline font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTickets.map((st) => (
                    <span
                      key={st.id}
                      className="px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-500 font-mono text-xs font-bold flex items-center gap-1.5"
                    >
                      Seat {st.seat_number} (NPR {st.price})
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COL: STICKY BOOKING SUMMARY SIDEBAR */}
        <aside className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-border space-y-6 sticky top-28 shadow-2xl">
            <h3 className="font-heading font-bold text-xl text-foreground border-b border-border/60 pb-3">
              Booking Summary
            </h3>

            {/* Event overview */}
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-foreground line-clamp-1">{event.title}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {event.location}
              </p>
            </div>

            {/* Selected Seats Count */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Selected Seats:</span>
                <span className="font-mono font-bold text-foreground">{selectedTickets.length} / 10</span>
              </div>

              {selectedTickets.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {selectedTickets.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Seat {t.seat_number}</span>
                      <span className="text-foreground">₹{t.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-3 border-t border-border/60 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Service Fee (5%)</span>
                <span className="font-mono text-foreground">₹{serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border">
                <span>Total Amount</span>
                <span className="font-mono text-indigo-500 text-lg">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Hold guarantee alert */}
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600 dark:text-indigo-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Row-level locking guarantees 10-minute hold after reservation.</span>
            </div>

            {/* Proceed Button */}
            <button
              onClick={handleProceedToBooking}
              disabled={selectedTickets.length === 0 || isCreating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-heading font-bold text-sm shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <span>Locking Seats...</span>
              ) : (
                <>
                  <span>Proceed to Booking</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>
        </aside>

      </div>

    </div>
  );
};
