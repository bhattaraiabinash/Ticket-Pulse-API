import { create } from 'zustand';
import { User, Ticket, Event, Booking } from '../types';

interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

interface BookingSelectionState {
  selectedEvent: Event | null;
  selectedTickets: Ticket[];
  currentBooking: Booking | null;
  setSelectedEvent: (event: Event | null) => void;
  toggleSelectTicket: (ticket: Ticket) => void;
  clearTicketSelection: () => void;
  setCurrentBooking: (booking: Booking | null) => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  const saved = localStorage.getItem('ticketpulse_theme');
  if (saved === 'dark' || saved === 'light') return saved;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'dark'; // Default dark mode as per prompt high quality design
};

export const useStore = create<ThemeState & AuthState & BookingSelectionState>((set, get) => {
  const initialTheme = getInitialTheme();
  if (typeof document !== 'undefined') {
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    // Theme State
    theme: initialTheme,
    toggleTheme: () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ticketpulse_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ theme: nextTheme });
    },
    setTheme: (theme) => {
      localStorage.setItem('ticketpulse_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ theme });
    },

    // Auth State
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),

    // Booking Selection State
    selectedEvent: null,
    selectedTickets: [],
    currentBooking: null,
    setSelectedEvent: (event) => set({ selectedEvent: event, selectedTickets: [] }),
    toggleSelectTicket: (ticket) => {
      const current = get().selectedTickets;
      const exists = current.some((t) => t.id === ticket.id);
      if (exists) {
        set({ selectedTickets: current.filter((t) => t.id !== ticket.id) });
      } else {
        if (current.length >= 10) {
          return; // Max 10 tickets per booking
        }
        set({ selectedTickets: [...current, ticket] });
      }
    },
    clearTicketSelection: () => set({ selectedTickets: [] }),
    setCurrentBooking: (booking) => set({ currentBooking: booking }),
  };
});
