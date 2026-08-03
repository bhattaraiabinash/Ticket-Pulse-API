import React, { useState, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/events/EventCard';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List as ListIcon, 
  RefreshCw, 
  SlidersHorizontal, 
  Calendar as CalendarIcon, 
  MapPin, 
  X,
  Ticket,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EventsPage: React.FC = () => {
  const { data: events = [], isLoading, isRefetching, refetch, dataUpdatedAt } = useEvents();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories = ['All', 'Music', 'Sports', 'Comedy', 'Conference', 'Festival'];

  // Filter & Sort Logic
  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const matchesSearch =
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === 'All' ||
          event.category === selectedCategory ||
          event.title.toLowerCase().includes(selectedCategory.toLowerCase());

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'popular') {
          return (b.total_capacity - b.available_tickets) - (a.total_capacity - a.available_tickets);
        }
        return 0;
      });
  }, [events, searchTerm, selectedCategory, sortBy]);

  const lastUpdatedText = dataUpdatedAt
    ? `Updated at ${new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
    : 'Live data';

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="relative p-8 sm:p-12 rounded-3xl glass-card border border-indigo-500/20 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500 flex items-center justify-center md:justify-start gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Discover South Asia
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-foreground">
            Explore All Events
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Concerts, stadium matches, tech summits, and live festivals with instant seat locking.
          </p>
        </div>

        {/* Real-time sync indicator */}
        <div className="relative z-10 flex items-center gap-3 bg-surface/80 px-4 py-2 rounded-2xl border border-border">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div className="text-xs">
            <p className="font-bold text-foreground">Live Seat Feed</p>
            <p className="text-[10px] text-muted-foreground">{lastUpdatedText}</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            aria-label="Refresh Events"
            className="p-2 hover:bg-surface rounded-xl transition-colors text-muted-foreground hover:text-indigo-500"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Sorting, View Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events, cities, artists..."
            className="w-full bg-surface border border-border rounded-2xl pl-10 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-xs font-semibold text-foreground"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <span>Filters</span>
          </button>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-surface border border-border text-xs font-semibold text-foreground rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest First</option>
          </select>

          {/* Grid / List View Toggle */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List View"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sticky Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 sticky top-28 h-fit">
          <div className="p-6 rounded-3xl glass-card border border-border space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-500" /> Filters
              </h3>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                }}
                className="text-xs text-indigo-500 hover:underline font-medium"
              >
                Reset
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</h4>
              <div className="flex flex-col gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20'
                        : 'text-muted-foreground hover:bg-surface hover:text-foreground'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability status filter note */}
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500">
                <Ticket className="w-4 h-4" /> Row-Level Lock Info
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Tickets marked <strong>FEW LEFT</strong> are experiencing high booking contention. Select early to lock seats.
              </p>
            </div>

          </div>
        </aside>

        {/* Mobile Drawer Filter */}
        <AnimatePresence>
          {mobileFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex justify-end"
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="w-80 bg-surface h-full p-6 space-y-6 overflow-y-auto shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="font-heading font-bold text-lg text-foreground">Filter Events</h3>
                  <button onClick={() => setMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Categories</h4>
                  <div className="flex flex-col gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setMobileFilterOpen(false);
                        }}
                        className={`text-left p-3 rounded-xl text-sm font-medium ${
                          selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-background border border-border'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events Listing Output */}
        <main className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 rounded-3xl glass-card animate-pulse p-4 space-y-4">
                  <div className="h-44 bg-surface/80 rounded-2xl" />
                  <div className="h-6 bg-surface/80 rounded-lg w-3/4" />
                  <div className="h-4 bg-surface/80 rounded-lg w-1/2" />
                  <div className="h-10 bg-surface/80 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-24 glass-card rounded-3xl space-y-4">
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto opacity-40" />
              <h3 className="font-heading font-bold text-xl text-foreground">No events found matching criteria</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Try searching for a different keyword or resetting your category filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </main>
      </div>

    </div>
  );
};
