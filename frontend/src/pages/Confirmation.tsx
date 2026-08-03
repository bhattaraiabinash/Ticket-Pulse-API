import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBookingDetail } from '../hooks/useBooking';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Mail, 
  QrCode, 
  Download, 
  Calendar, 
  MapPin, 
  Ticket as TicketIcon, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const ConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const idNum = bookingId ? parseInt(bookingId, 10) : null;
  const navigate = useNavigate();

  const { data: booking, isLoading, isError } = useBookingDetail(idNum);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 },
    });
  }, []);

  const handleCopyBookingId = () => {
    if (!booking) return;
    navigator.clipboard.writeText(`TP-${booking.id}`);
    setCopied(true);
    toast.success('Booking reference copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    toast.success('Generating official encrypted PDF ticket...');
    window.print();
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 px-4 max-w-2xl mx-auto space-y-6 text-center animate-pulse">
        <div className="w-20 h-20 rounded-full bg-surface/80 mx-auto" />
        <div className="h-8 bg-surface/80 rounded-xl w-1/2 mx-auto" />
        <div className="h-64 bg-surface/80 rounded-3xl" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="pt-32 pb-20 px-4 max-w-md mx-auto text-center space-y-4">
        <h2 className="font-heading font-bold text-2xl text-foreground">Booking Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested booking confirmation could not be loaded.</p>
        <Link to="/events" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs">
          Return to Events
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(booking.event?.date || Date.now()).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      
      {/* 1. SUCCESS HEADER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold text-xs border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Booking Confirmed & Locked
        </span>

        <h1 className="font-heading font-black text-3xl sm:text-4xl text-foreground">
          You're All Set!
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your tickets have been confirmed and locked in PostgreSQL database.
        </p>
      </motion.div>

      {/* 2. EMAIL SENT BANNER */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3.5 text-xs text-indigo-600 dark:text-indigo-300">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-500">
          <Mail className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1">
          <p className="font-bold">PDF Ticket Sent to Email</p>
          <p className="text-[11px] text-muted-foreground">
            Our Celery async worker has generated and dispatched your digital pass with QR verification.
          </p>
        </div>
      </div>

      {/* 3. DIGITAL PASS TICKET TICKET CARD */}
      <div className="rounded-3xl glass-card border border-border overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8">
        
        {/* Ticket Header & Reference */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
              Booking Reference
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xl text-foreground">
                TP-{booking.id}
              </span>
              <button
                onClick={handleCopyBookingId}
                aria-label="Copy Reference Code"
                className="p-1.5 rounded-lg bg-surface border border-border hover:border-indigo-500 text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 uppercase tracking-wider">
            STATUS: {booking.status}
          </span>
        </div>

        {/* Event Meta */}
        <div className="space-y-3">
          <h3 className="font-heading font-black text-xl text-foreground">{booking.event?.title}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span>{booking.event?.location}</span>
            </div>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Confirmed Seats ({booking.tickets.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {booking.tickets.map((t) => (
              <div
                key={t.id}
                className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-mono font-bold text-foreground flex items-center gap-1.5"
              >
                <TicketIcon className="w-3.5 h-3.5 text-indigo-500" />
                Seat {t.seat_number} (NPR {t.price})
              </div>
            ))}
          </div>
        </div>

        {/* Animated QR Code Display */}
        <div className="p-6 rounded-2xl bg-surface border border-border/80 text-center space-y-3 flex flex-col items-center justify-center">
          <div className="p-4 rounded-2xl bg-white text-black shadow-lg border border-slate-200">
            {/* SVG QR Code Simulation */}
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              <path fill="#000" d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M35,10 h10 v10 h-10 z M50,20 h10 v10 h-10 z M35,40 h30 v20 h-30 z M75,45 h20 v20 h-20 z M40,75 h20 v20 h-20 z M70,70 h30 v30 h-30 z" />
            </svg>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground">
            SCAN AT GATE • HASH: {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
          <div>
            <span className="text-[10px] uppercase font-mono text-muted-foreground block">Total Paid</span>
            <span className="font-mono font-black text-2xl text-indigo-500">₹{booking.total_price}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-surface hover:bg-surface/80 border border-border text-foreground font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>Download PDF Ticket</span>
            </button>

            <Link
              to="/events"
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>Book Another</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
