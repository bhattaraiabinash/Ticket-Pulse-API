import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ParticleCanvas } from '../components/common/ParticleCanvas';
import { EventCard } from '../components/events/EventCard';
import { useEvents } from '../hooks/useEvents';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Zap, 
  Ticket, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Star, 
  ChevronDown,
  TrendingUp,
  Flame,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Landing: React.FC = () => {
  const { data: events = [], isLoading } = useEvents();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Music', 'Sports', 'Comedy', 'Conference', 'Festival'];

  const filteredEvents = selectedCategory === 'All'
    ? events
    : events.filter(e => e.category === selectedCategory || e.title.toLowerCase().includes(selectedCategory.toLowerCase()));

  const stats = [
    { label: 'Total Events Hosted', value: '10,000+', icon: Calendar },
    { label: 'Tickets Sold in South Asia', value: '500K+', icon: Ticket },
    { label: 'Guaranteed System Uptime', value: '99.9%', icon: ShieldCheck },
    { label: 'Booking Concurrency Lock', value: '< 1ms', icon: Zap },
  ];

  const steps = [
    {
      num: '01',
      title: 'Browse & Discover',
      desc: 'Explore stadium concerts, Tech summits, and sports viewing parties across Nepal & South Asia.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Select Seats & Lock',
      desc: 'Pick your exact seat in real-time. Our PostgreSQL row-level locks hold your seat for 10 minutes.',
      icon: Ticket,
    },
    {
      num: '03',
      title: 'Instant Email QR Ticket',
      desc: 'Pay safely and instantly receive your encrypted PDF ticket with QR code ready for gate scanning.',
      icon: CheckCircle2,
    },
  ];

  const testimonials = [
    {
      name: 'Aarav Sharma',
      role: 'Concert Promoter, Pokhara',
      content: 'TicketPulse handled our 15,000 attendee stadium festival without a single double-booking error! Unbelievable speed.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Priya Adhikari',
      role: 'Tech Summit Organizer',
      content: 'The real-time seat mapping and sub-millisecond locking capability sold out our early-bird conference tier in minutes!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Bikram Thapa',
      role: 'Sports Arena Manager',
      content: 'The cleanest UI and fastest ticket confirmation email engine in South Asia. Highly recommended for venues.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
  ];

  return (
    <div className="relative overflow-hidden space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <ParticleCanvas />

        {/* Ambient Gradient Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-indigo-500/30 shadow-lg text-xs font-semibold text-indigo-600 dark:text-indigo-300"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Next-Gen Concurrency-Safe Ticketing Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-foreground leading-[1.1]"
          >
            Book Your Next <br className="hidden sm:block" />
            <span className="gradient-text">Experience Effortlessly</span>
          </motion.h1>

          {/* Subheadline Glassmorphism Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto p-6 rounded-3xl glass-card border border-border shadow-2xl backdrop-blur-xl"
          >
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Every seat. Every moment. Perfectly placed. Enterprise-grade ticket booking built with PostgreSQL row-level locks and Redis cache-aside speed.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              to="/events"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-heading font-bold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-3 group transform hover:-translate-y-0.5"
            >
              <Ticket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Browse Events</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-surface/80 hover:bg-surface border border-border text-foreground font-heading font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 hover:border-indigo-500/50"
            >
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span>Sell Tickets</span>
            </a>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="pt-12 flex justify-center text-muted-foreground"
          >
            <ChevronDown className="w-6 h-6 opacity-60" />
          </motion.div>
        </div>
      </section>

      {/* 2. STATS BAR SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-3xl glass-card border border-border text-center space-y-2 glass-card-hover"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="font-heading font-black text-2xl sm:text-3xl text-foreground gradient-text">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED EVENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-500 font-semibold text-xs uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Trending Experiences</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground">
              Featured Events
            </h2>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'bg-surface hover:bg-surface/80 border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 rounded-3xl glass-card animate-pulse p-4 space-y-4">
                <div className="h-44 bg-surface/80 rounded-2xl" />
                <div className="h-6 bg-surface/80 rounded-lg w-3/4" />
                <div className="h-4 bg-surface/80 rounded-lg w-1/2" />
                <div className="h-10 bg-surface/80 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl space-y-3">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <h3 className="font-heading font-bold text-lg text-foreground">No events found</h3>
            <p className="text-xs text-muted-foreground">Try selecting a different category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface hover:bg-surface/80 border border-border text-foreground font-semibold text-sm transition-all hover:border-indigo-500/40"
          >
            <span>View All Events ({events.length})</span>
            <ArrowRight className="w-4 h-4 text-indigo-500" />
          </Link>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-indigo-500 font-semibold text-xs uppercase tracking-widest">
            Seamless Experience
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground">
            How TicketPulse Works
          </h2>
          <p className="text-sm text-muted-foreground">
            Book your event tickets in 3 effortless steps backed by enterprise grade concurrency locking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              className="relative p-8 rounded-3xl glass-card border border-border glass-card-hover space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <step.icon className="w-7 h-7" />
                </div>
                <span className="font-mono font-black text-3xl text-indigo-500/20 dark:text-indigo-400/20">
                  {step.num}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-bold text-xl text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. PRICING & REVENUE MODEL SECTION */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-indigo-500 font-semibold text-xs uppercase tracking-widest">
            For Organizers & Venues
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="text-sm text-muted-foreground">
            No hidden setup fees. Scale from intimate club shows to 50,000+ stadium tours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter */}
          <div className="p-8 rounded-3xl glass-card border border-border space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-xl text-foreground">Starter Event</h3>
              <p className="text-xs text-muted-foreground">Ideal for community meetups and local club gigs.</p>
              <div className="text-3xl font-black text-foreground">
                2.5% <span className="text-xs font-normal text-muted-foreground">per ticket sold</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground pt-4 border-t border-border">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Up to 500 tickets/event</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time seat locking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant PDF & QR delivery</li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-xl bg-surface border border-border hover:border-indigo-500/50 text-foreground font-semibold text-xs">
              Start Free Trial
            </button>
          </div>

          {/* Pro (Highlighted) */}
          <div className="relative p-8 rounded-3xl glass-card border-2 border-indigo-500 shadow-2xl space-y-6 flex flex-col justify-between transform md:-translate-y-2">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
              MOST POPULAR FOR CONCERTS
            </span>
            <div className="space-y-4 pt-2">
              <h3 className="font-heading font-bold text-xl text-foreground">Pro Promoter</h3>
              <p className="text-xs text-muted-foreground">Designed for stadium tours, summits & festivals.</p>
              <div className="text-3xl font-black text-foreground gradient-text">
                4.0% <span className="text-xs font-normal text-muted-foreground">+ ₹4,999/mo</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground pt-4 border-t border-border">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited capacity events</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Redis Cache-aside & Select For Update locks</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dedicated gate QR scanner app</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Priority 24/7 organizer support</li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/30">
              Get Started Pro
            </button>
          </div>

          {/* Enterprise */}
          <div className="p-8 rounded-3xl glass-card border border-border space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-xl text-foreground">Stadium Enterprise</h3>
              <p className="text-xs text-muted-foreground">For stadium owners, national arenas & tour agencies.</p>
              <div className="text-3xl font-black text-foreground">
                Custom <span className="text-xs font-normal text-muted-foreground">SLA & Rates</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground pt-4 border-t border-border">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Custom domain & branding</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dedicated database cluster</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> On-site ticketing support engineers</li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-xl bg-surface border border-border hover:border-indigo-500/50 text-foreground font-semibold text-xs">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-indigo-500 font-semibold text-xs uppercase tracking-widest">
            Loved By Promoters
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground">
            Trusted Across South Asia
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className="p-6 rounded-3xl glass-card border border-border space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "{item.content}"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500/30"
                />
                <div>
                  <h4 className="font-heading font-bold text-xs text-foreground">{item.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};
