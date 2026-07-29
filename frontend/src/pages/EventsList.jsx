import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Ticket, Filter, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { eventsAPI } from '../services/api';
import { GridSkeleton } from '../components/SkeletonLoader';

export default function EventsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all'); // all, available, low

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: eventsAPI.getEvents,
  });

  const filteredEvents = (events || []).filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterAvailability === 'available') {
      return matchesSearch && event.available_tickets > 0;
    }
    if (filterAvailability === 'low') {
      return matchesSearch && event.available_tickets > 0 && event.available_tickets <= 5;
    }
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Explore Live Events</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time seat availability synced with PostgreSQL Redis cache-aside
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 w-full sm:w-64"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <button
              onClick={() => setFilterAvailability('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterAvailability === 'all' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterAvailability('low')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterAvailability === 'low' ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Low Seats (&le; 5)
            </button>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="glass-card rounded-2xl p-6 border border-red-500/40 bg-red-950/20 flex items-center space-x-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Failed to load events: {error.message || "Backend API server unreachable at http://localhost:8000"}</span>
        </div>
      )}

      {/* EVENTS GRID */}
      {isLoading ? (
        <GridSkeleton count={6} />
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isLowSeats = event.available_tickets > 0 && event.available_tickets <= 5;
            const isSoldOut = event.available_tickets === 0;

            return (
              <div
                key={event.id}
                className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Availability Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      ID #{event.id}
                    </span>

                    {isSoldOut ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        SOLD OUT
                      </span>
                    ) : isLowSeats ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse glow-red">
                        🔥 Only {event.available_tickets} seats left!
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {event.available_tickets} / {event.total_capacity} Available
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {event.description || "No description provided."}
                    </p>
                  </div>

                  {/* Meta Details */}
                  <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
                      <span>{new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Capacity: {event.total_capacity} seats</span>
                    </div>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Status</span>
                    <p className="text-xs font-bold text-slate-200">
                      {isSoldOut ? 'Unavailable' : 'Booking Open'}
                    </p>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center space-x-1.5 ${
                      isSoldOut
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Select Seats</span>
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
          No matching events found.
        </div>
      )}

    </div>
  );
}
