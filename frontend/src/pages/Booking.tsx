import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useBooking } from '../hooks/useBooking';
import { 
  Clock, 
  ShieldCheck, 
  Ticket, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Tag, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBooking, setCurrentBooking } = useStore();
  const { confirmBooking, isConfirming } = useBooking();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  // 10 minute countdown timer (600 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!currentBooking) return 600;
    const createdAt = new Date(currentBooking.created_at).getTime();
    const now = new Date().getTime();
    const elapsedSeconds = Math.floor((now - createdAt) / 1000);
    const remaining = 600 - elapsedSeconds;
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    if (!currentBooking) {
      toast.error('No active pending booking found.');
      navigate('/events');
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error('Your 10-minute seat reservation timer expired.');
          setCurrentBooking(null);
          navigate('/events');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentBooking, navigate, setCurrentBooking]);

  if (!currentBooking) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Timer color thresholding
  let timerBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
  let timerTextColor = 'text-emerald-500';
  if (timeLeft < 120) { // < 2 minutes
    timerBg = 'bg-rose-500/10 border-rose-500/40 text-rose-500 animate-pulse';
    timerTextColor = 'text-rose-500';
  } else if (timeLeft < 300) { // < 5 minutes
    timerBg = 'bg-amber-500/10 border-amber-500/30 text-amber-500';
    timerTextColor = 'text-amber-500';
  }

  const subtotal = Number(currentBooking.total_price || 0);
  const serviceFee = subtotal * 0.05;
  const discountAmount = subtotal * discount;
  const totalAmount = Math.max(0, subtotal + serviceFee - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'PULSE10' || promoCode.trim().toUpperCase() === 'NEPAL2026') {
      setDiscount(0.1); // 10% discount
      setPromoApplied(true);
      toast.success('Promo code applied! 10% discount added.');
    } else {
      toast.error('Invalid promo code. Try "PULSE10"');
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await confirmBooking(currentBooking.id);

      // Trigger Confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      navigate(`/confirmation/${currentBooking.id}`);
    } catch (err) {
      // Handled in hook
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Top Bar: Back & Timer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </button>

        {/* Prominent Countdown Timer */}
        <div className={`px-5 py-2.5 rounded-2xl border backdrop-blur-md flex items-center gap-3 shadow-md ${timerBg}`}>
          <Clock className="w-5 h-5 shrink-0" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-mono tracking-wider block leading-none">
              Seats Held For
            </span>
            <span className={`font-mono font-black text-xl tracking-wider ${timerTextColor}`}>
              {formattedTime}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLS: ORDER & SEATS DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Event Header Card */}
          <div className="p-6 rounded-3xl glass-card border border-border space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 uppercase tracking-widest">
              <Ticket className="w-4 h-4" /> Reserved Booking #{currentBooking.id}
            </div>

            <h2 className="font-heading font-black text-2xl text-foreground">
              {currentBooking.event?.title}
            </h2>

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border/60">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" />
                {new Date(currentBooking.event?.date || Date.now()).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-500" />
                {currentBooking.event?.location}
              </span>
            </div>
          </div>

          {/* Reserved Seats List */}
          <div className="p-6 rounded-3xl glass-card border border-border space-y-4">
            <h3 className="font-heading font-bold text-lg text-foreground">Reserved Seat Tickets</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentBooking.tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-500 flex items-center justify-center font-mono font-bold text-sm">
                      {t.seat_number}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Seat {t.seat_number}</p>
                      <p className="text-[11px] text-muted-foreground">Row {t.seat_number.charAt(0)}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground">₹{t.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Code Input */}
          <div className="p-6 rounded-3xl glass-card border border-border space-y-3">
            <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" /> Have a Promo Code?
            </h3>
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code (e.g. PULSE10)"
                disabled={promoApplied}
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={promoApplied || !promoCode.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs transition-colors"
              >
                {promoApplied ? 'Applied' : 'Apply'}
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COL: PAYMENT & TOTAL */}
        <aside className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-border space-y-6 shadow-2xl">
            <h3 className="font-heading font-bold text-xl text-foreground border-b border-border/60 pb-3">
              Payment Breakdown
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({currentBooking.tickets.length} seats)</span>
                <span className="font-mono text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Service Fee (5%)</span>
                <span className="font-mono text-foreground">₹{serviceFee.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-500 font-semibold">
                  <span>Promo Discount (10%)</span>
                  <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-foreground pt-3 border-t border-border">
                <span>Total Amount</span>
                <span className="font-mono text-indigo-500 text-xl">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Simulator */}
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-500" /> Payment Gateway
                </span>
                <span className="text-[10px] text-emerald-500 font-mono">SIMULATION READY</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Simulate instant authorization via Khalti / eSewa / Visa card gateway.
              </p>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isConfirming}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-heading font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isConfirming ? (
                <span>Confirming Booking...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Simulate Payment & Confirm</span>
                </>
              )}
            </button>

          </div>
        </aside>

      </div>

    </div>
  );
};
