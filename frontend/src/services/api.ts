import axios from 'axios';
import { Event, Booking, User, ApiErrorResponse } from '../types';

const API_BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper for extracting Django error messages
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data.error === 'string') return data.error;
      if (typeof data.detail === 'string') return data.detail;
      if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const val = data[firstKey];
          return Array.isArray(val) ? `${firstKey}: ${val[0]}` : `${firstKey}: ${val}`;
        }
      }
    }
    return error.message || 'An unexpected error occurred.';
  }
  return 'An unexpected error occurred.';
};

// Events API
export const eventsApi = {
  getEvents: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events/');
    return response.data;
  },

  getEventDetail: async (id: number): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}/`);
    return response.data;
  },
};

// Bookings API
export const bookingsApi = {
  createBooking: async (eventId: number, ticketIds: number[]): Promise<Booking> => {
    const response = await api.post<Booking>('/bookings/', {
      event_id: eventId,
      ticket_ids: ticketIds,
    });
    return response.data;
  },

  getBookingDetail: async (bookingId: number): Promise<Booking> => {
    const response = await api.get<Booking>(`/bookings/${bookingId}/`);
    return response.data;
  },

  confirmBooking: async (bookingId: number): Promise<Booking> => {
    const response = await api.post<Booking>(`/bookings/${bookingId}/confirm/`);
    return response.data;
  },
};

// User Auth API
export const authApi = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    phone_number?: string;
  }): Promise<User> => {
    const response = await api.post<User>('/users/register/', data);
    return response.data;
  },

  login: async (data: { username: string; password: string }): Promise<User> => {
    const response = await api.post<User>('/users/login/', data);
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/users/logout/');
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/users/me/');
    return response.data;
  },
};
