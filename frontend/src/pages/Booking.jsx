import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, CreditCard, ShieldCheck, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { bookingsAPI } from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import PaymentModal from '../components/PaymentModal';
import Toast from '../components/Toast';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const { data: booking, isLoading, isError, error } = useQuery({
    queryKey: ['bookingDetail', id],
    queryFn: () => bookingsAPI.getBookingDetail(id),
    refetchInterval: isExpired ? false : 10000, // Poll every 10s if active
  });

  const handleExpiry = () => {
    setIsExpired(true);
    setToastMessage({ message: 'Reservation time expired! Seats have been returned to pool.', type: 'error' });
  };

  const handleConfirmPayment = async () => {
    setIsPaymentModalOpen(false);
    setIsConfirming(true);

    try {
      const confirmedBooking = await bookingsAPI.confirmBooking(id);
      // Success! Navigate to Confirmation page
      navigate(`/confirmation/${confirmedBooking.id}`);
    } catch (err) {
      setIsConfirming(false);
      setToastMessage({
        message: err.message || 'Failed to confirm booking.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto" />
        <p className="text-slate-400 text-sm">Retrieving pending booking reservation...</p>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass-card rounded-2xl p-8 border border-red-500/40 text-red-300">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <h3 className="text-lg font-bold">Booking Not Found</h3>
          <p className="text-xs text-slate-400 mt-2">
            {error?.message || "Could not retrieve booking details."}
          </p>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Toast Notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirmPayment={handleConfirmPayment}
        totalAmount={booking.total_price}
      />

      <button
        onClick={() => navigate('/events')}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </button>

      {/* Main Reservation Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
              PENDING RESERVATION
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-2">Booking #{booking.id}</h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Total Price:</span>
            <p className="text-2xl font-extrabold text-violet-400 font-mono">
              Rs. {Number(booking.total_price).toFixed(2)}
            </p>
          </div>
        </div>

        {/* 10-Minute Countdown Timer */}
        <CountdownTimer
          createdAt={booking.created_at}
          onExpire={handleExpiry}
          durationMinutes={10}
        />

        {/* Event Meta Card */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white">{booking.event?.title}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
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

        {/* Selected Seats Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Reserved Seat Breakdown</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Seat Number</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {booking.tickets?.map((t) => (
                  <tr key={t.id}>
                    <td className="py-3 font-bold text-white flex items-center space-x-2">
                      <Ticket className="w-4 h-4 text-violet-400" />
                      <span>Seat {t.seat_number}</span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-200 text-right">
                      Rs. {Number(t.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={isConfirming || isExpired}
            className="w-full py-4 px-6 rounded-xl font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-violet-600/30 transition-all flex items-center justify-center space-x-2 text-base disabled:opacity-50"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Triggering Celery Tasks & Confirming...</span>
              </>
            ) : isExpired ? (
              <span>Booking Expired - Select Seats Again</span>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Simulate Payment & Confirm Booking</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Confirmation hands off task to Celery worker (Generates PDF + QR + Email)
          </p>
        </div>

      </div>

    </div>
  );
}
