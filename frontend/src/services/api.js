import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Basic Auth header if stored
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('ticketpulse_auth');
  if (authData) {
    try {
      const { username, password } = JSON.parse(authData);
      if (username && password) {
        config.headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
      }
    } catch (e) {
      console.error('Failed to parse stored auth credentials');
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle structured backend errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let formattedError = {
      message: 'An unexpected error occurred.',
      code: 'UNKNOWN_ERROR',
      status: error.response?.status || 500,
    };

    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.error) {
        formattedError.message = data.error;
      } else if (typeof data === 'object') {
        // Collect object errors if DRF unhandled format
        const msgs = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        formattedError.message = msgs || formattedError.message;
      }
      if (data.code) formattedError.code = data.code;
    }

    return Promise.reject(formattedError);
  }
);

export const authAPI = {
  register: async (userData) => {
    const res = await api.post('/users/register/', userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post('/users/login/', credentials);
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/users/logout/');
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/users/me/');
    return res.data;
  },
};

export const eventsAPI = {
  getEvents: async () => {
    const res = await api.get('/events/');
    return res.data;
  },
  getEventDetail: async (id) => {
    const res = await api.get(`/events/${id}/`);
    return res.data;
  },
};

export const bookingsAPI = {
  createBooking: async ({ event_id, ticket_ids }) => {
    const res = await api.post('/bookings/', { event_id, ticket_ids });
    return res.data;
  },
  getBookingDetail: async (booking_id) => {
    const res = await api.get(`/bookings/${booking_id}/`);
    return res.data;
  },
  confirmBooking: async (booking_id) => {
    const res = await api.post(`/bookings/${booking_id}/confirm/`);
    return res.data;
  },
};

export default api;
