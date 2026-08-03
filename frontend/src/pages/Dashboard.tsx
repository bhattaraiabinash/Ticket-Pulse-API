import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { useStore } from '../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  Ticket, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Settings, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  Mail,
  Phone,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentBooking, setCurrentBooking } = useStore();

  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'settings'>('bookings');

  if (!user) {
    return (
      <div className="pt-32 pb-20 px-4 max-w-md mx-auto text-center space-y-4">
        <h2 className="font-heading font-bold text-2xl text-foreground">Sign In Required</h2>
        <p className="text-sm text-muted-foreground">Please sign in to access your TicketPulse user dashboard.</p>
        <Link to="/login" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  // Simulated list of user bookings including current active store booking if available
  const userBookings = currentBooking ? [currentBooking] : [];

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* 1. PROFILE HEADER CARD */}
      <div className="p-8 rounded-3xl glass-card border border-border shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-heading font-black text-3xl shadow-xl shadow-indigo-500/30">
            {user.username.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="font-heading font-black text-2xl text-foreground">{user.username}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold uppercase">
                VERIFIED USER
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-3">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-indigo-500" /> {user.email || 'user@ticketpulse.com'}</span>
              {user.phone_number && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-purple-500" /> {user.phone_number}</span>}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 bg-surface/80 px-4 py-2.5 rounded-2xl border border-border">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          <div className="text-xs">
            <p className="font-bold text-foreground">SaaS Tier: Free Organizer</p>
            <p className="text-[10px] text-muted-foreground">0% Platform Surcharge</p>
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD TABS */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'text-muted-foreground hover:bg-surface hover:text-foreground'
          }`}
        >
          <Ticket className="w-4 h-4" /> My Bookings ({userBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'text-muted-foreground hover:bg-surface hover:text-foreground'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Profile Info
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'text-muted-foreground hover:bg-surface hover:text-foreground'
          }`}
        >
          <Settings className="w-4 h-4" /> Preferences
        </button>
      </div>

      {/* 3. TAB CONTENTS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {userBookings.length === 0 ? (
            <div className="p-16 rounded-3xl glass-card border border-border text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-muted-foreground">
                <Ticket className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground">No Active Bookings Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Explore upcoming concerts, tech conferences, and stadium sports events to book your seats.
              </p>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/30"
              >
                <span>Browse Live Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userBookings.map((b) => {
                let statusChip = (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED
                  </span>
                );

                if (b.status === 'PENDING') {
                  statusChip = (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> PENDING PAYMENT
                    </span>
                  );
                } else if (b.status === 'EXPIRED') {
                  statusChip = (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> EXPIRED
                    </span>
                  );
                }

                return (
                  <div
                    key={b.id}
                    className="p-6 rounded-3xl glass-card border border-border flex flex-col md:flex-row items-center justify-between gap-6 glass-card-hover"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs text-muted-foreground">#TP-{b.id}</span>
                        {statusChip}
                      </div>

                      <h3 className="font-heading font-extrabold text-lg text-foreground">
                        {b.event?.title}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          {new Date(b.event?.date || Date.now()).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-purple-500" />
                          {b.event?.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border/60 pt-4 md:pt-0">
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground block">Total Price</span>
                        <span className="font-mono font-black text-lg text-indigo-500">₹{b.total_price}</span>
                      </div>

                      {b.status === 'PENDING' ? (
                        <button
                          onClick={() => navigate('/booking')}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md"
                        >
                          Complete Payment
                        </button>
                      ) : (
                        <Link
                          to={`/confirmation/${b.id}`}
                          className="px-5 py-2.5 rounded-xl bg-surface border border-border hover:border-indigo-500 text-xs font-semibold text-foreground flex items-center gap-1.5"
                        >
                          <span>View Ticket</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="p-8 rounded-3xl glass-card border border-border space-y-6 max-w-2xl">
          <h3 className="font-heading font-bold text-lg text-foreground">User Profile Information</h3>
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-surface border border-border flex justify-between">
              <span className="text-muted-foreground">Username</span>
              <span className="font-bold text-foreground">{user.username}</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface border border-border flex justify-between">
              <span className="text-muted-foreground">Email Address</span>
              <span className="font-bold text-foreground">{user.email || 'Not provided'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface border border-border flex justify-between">
              <span className="text-muted-foreground">Phone Number</span>
              <span className="font-bold text-foreground">{user.phone_number || 'Not provided'}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="p-8 rounded-3xl glass-card border border-border space-y-6 max-w-2xl">
          <h3 className="font-heading font-bold text-lg text-foreground">Notification & Account Settings</h3>
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border cursor-pointer">
              <span>Email Booking Confirmation Receipts</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-indigo-600" />
            </label>
            <label className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border cursor-pointer">
              <span>SMS Gate Scan Alerts</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-indigo-600" />
            </label>
          </div>
        </div>
      )}

    </div>
  );
};
