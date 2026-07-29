import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Zap, Shield, Cpu, ArrowRight, CheckCircle, Sparkles, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { eventsAPI } from '../services/api';
import { GridSkeleton } from '../components/SkeletonLoader';

export default function Home() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: eventsAPI.getEvents,
  });

  return (
    <div className="space-y-16 py-8">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/30 to-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-6 relative z-10"
        >
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-violet-500/10 border border-violet-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-violet-300 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Production-Grade Concurrency-Safe Ticketing Engine</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            High-Performance <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-pink-400">
              Event Ticketing REST API
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Engineered with PostgreSQL row-level locking (`select_for_update`), Redis cache-aside architecture, and async Celery workers. Zero double bookings under concurrent load.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/events"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center space-x-2 text-base"
            >
              <Ticket className="w-5 h-5" />
              <span>Explore Live Events</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            
            <a
              href="http://localhost:8000/api/docs/"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center space-x-2 text-base"
            >
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>OpenAPI Swagger Docs</span>
            </a>
          </div>
        </motion.div>

        {/* Feature Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <Shield className="w-6 h-6 text-violet-400 mb-2" />
            <h4 className="text-sm font-bold text-white">PostgreSQL Locking</h4>
            <p className="text-xs text-slate-400 mt-1">select_for_update atomic isolation prevents conflicts</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <Zap className="w-6 h-6 text-emerald-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Redis Cache-Aside</h4>
            <p className="text-xs text-slate-400 mt-1">~1ms Hit responses with automatic TTL invalidation</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <Cpu className="w-6 h-6 text-amber-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Async Task Queue</h4>
            <p className="text-xs text-slate-400 mt-1">Celery PDF generation + QR codes + Email confirmation</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <CheckCircle className="w-6 h-6 text-cyan-400 mb-2" />
            <h4 className="text-sm font-bold text-white">100% Code Coverage</h4>
            <p className="text-xs text-slate-400 mt-1">58 pytest suite cases covering concurrency & tasks</p>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Live Events</h2>
            <p className="text-xs text-slate-400">Discover upcoming events with real-time seat availability</p>
          </div>
          <Link to="/events" className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1">
            View All Events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <GridSkeleton count={3} />
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Live Ticketing
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      event.available_tickets < 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {event.available_tickets} seats left!
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{event.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Location</p>
                    <p className="text-xs text-slate-300 font-medium truncate max-w-[150px]">{event.location}</p>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all flex items-center gap-1"
                  >
                    Select Seats
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
            No events found. Please ensure Django backend is populated with data.
          </div>
        )}
      </section>

    </div>
  );
}
