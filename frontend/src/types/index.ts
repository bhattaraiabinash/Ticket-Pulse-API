export interface User {
  id: number;
  username: string;
  email: string;
  phone_number?: string;
  created_at?: string;
}

export type TicketStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export interface Ticket {
  id: number;
  seat_number: string;
  price: string | number;
  status: TicketStatus;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  total_capacity: number;
  available_tickets: number;
  category?: 'Music' | 'Sports' | 'Comedy' | 'Conference' | 'Festival' | string;
  image_url?: string;
  tickets?: Ticket[];
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED';

export interface Booking {
  id: number;
  user: User | string;
  event: Event;
  tickets: Ticket[];
  status: BookingStatus;
  total_price: string | number;
  created_at: string;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  status?: number;
}
