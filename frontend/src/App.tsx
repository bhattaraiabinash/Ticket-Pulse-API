import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ChatBot } from './components/chatbot/ChatBot';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Route-level code splitting using React.lazy()
const Landing = lazy(() => import('./pages/Landing').then((m) => ({ default: m.Landing })));
const EventsPage = lazy(() => import('./pages/Events').then((m) => ({ default: m.EventsPage })));
const EventDetail = lazy(() => import('./pages/EventDetail').then((m) => ({ default: m.EventDetail })));
const BookingPage = lazy(() => import('./pages/Booking').then((m) => ({ default: m.BookingPage })));
const ConfirmationPage = lazy(() => import('./pages/Confirmation').then((m) => ({ default: m.ConfirmationPage })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased selection:bg-indigo-500 selection:text-white">
              <Navbar />

              <main className="flex-1">
                <Suspense
                  fallback={
                    <div className="min-h-[70vh] flex items-center justify-center p-4">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse" />
                        <span className="text-xs font-mono text-muted-foreground animate-pulse">
                          Loading TicketPulse...
                        </span>
                      </div>
                    </div>
                  }
                >
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/events/:id" element={<EventDetail />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>

              <Footer />
              <ChatBot />

              {/* Toast Notifications Provider */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--card-bg)',
                    color: 'rgb(var(--text-primary))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: 500,
                  },
                }}
              />
            </div>
          </ErrorBoundary>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
