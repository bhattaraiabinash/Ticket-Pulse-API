import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../../types';
import { Calendar, MapPin, Ticket as TicketIcon, ArrowRight, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const percentageAvailable = Math.round(
    (event.available_tickets / (event.total_capacity || 20)) * 100
  );

  const isSoldOut = event.available_tickets === 0;
  const isFewLeft = !isSoldOut && percentageAvailable < 10;

  // Determine urgency color
  let progressColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';

  if (percentageAvailable < 10) {
    progressColor = 'bg-rose-500';
    badgeColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  } else if (percentageAvailable <= 50) {
    progressColor = 'bg-amber-500';
    badgeColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  }

  // Stock imagery per event type/id fallback
  const getEventImage = () => {
    if (event.image_url) return event.image_url;
    const images = [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    ];
    return images[event.id % images.length];
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative rounded-3xl glass-card border border-border overflow-hidden flex flex-col h-full glass-card-hover shadow-lg"
    >
      {/* Top Banner Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={getEventImage()}
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {isSoldOut ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md uppercase tracking-wider">
              SOLD OUT
            </span>
          ) : isFewLeft ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-black shadow-md uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-black" /> FEW LEFT
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20 uppercase tracking-wider">
              {event.category || 'Live Event'}
            </span>
          )}
        </div>

        {/* Quick Book Button Overlay on Hover */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <Link
            to={`/events/${event.id}`}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl flex items-center gap-2 transform group-hover:scale-100 scale-95 transition-transform"
          >
            <span>{isSoldOut ? 'View Details' : 'Book Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-lg text-foreground line-clamp-1 group-hover:text-indigo-500 transition-colors">
            {event.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="space-y-2.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Availability Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${badgeColor}`}>
              {isSoldOut ? '0 Seats' : `${event.available_tickets} seats remaining`}
            </span>
            <span className="text-muted-foreground font-mono text-[11px]">
              {event.total_capacity} Capacity
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-surface border border-border/60 overflow-hidden">
            <div
              className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
              style={{ width: `${Math.min(100, Math.max(0, percentageAvailable))}%` }}
            />
          </div>
        </div>

        {/* Footer info: Starting Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-mono">
              Tickets From
            </span>
            <span className="font-heading font-extrabold text-lg text-foreground">
              ₹80 <span className="text-xs font-normal text-muted-foreground">NPR</span>
            </span>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="p-2.5 rounded-xl bg-surface hover:bg-indigo-500/10 border border-border text-foreground hover:text-indigo-500 transition-all font-medium text-xs flex items-center gap-1"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
