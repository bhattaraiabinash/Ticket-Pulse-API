import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Ticket, Eye, EyeOff, Lock, User as UserIcon, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/events';

  const { login, isLoggingIn } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err) {
      // Toast error handled in hook
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-3xl glass-card border border-border shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Branding Panel */}
        <div className="relative p-8 md:p-12 bg-gradient-to-tr from-indigo-950 via-purple-950 to-slate-950 text-white flex flex-col justify-between hidden md:flex overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-black text-2xl tracking-tight">
                Ticket<span className="text-indigo-400">Pulse</span>
              </span>
            </Link>
            <h2 className="font-heading font-black text-3xl leading-tight">
              Welcome back to South Asia's Premier Event Ticketing Engine.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Log in to manage your active seat reservations, download QR tickets, or discover upcoming stadium concerts.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/10 relative z-10 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> PostgreSQL 16 Concurrency Lock Active
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Redis Cache-aside Speed
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 md:p-12 space-y-6 flex flex-col justify-center">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="font-heading font-extrabold text-2xl text-foreground">Sign In</h2>
            <p className="text-xs text-muted-foreground">Enter your TicketPulse credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username / Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Username or Email</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. abinash"
                  className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo mode: Please use your registered credentials.'); }} className="text-indigo-500 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? 'Signing In...' : 'Sign In to TicketPulse'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social Logins simulation */}
          <div className="space-y-3 pt-2">
            <div className="relative text-center">
              <span className="bg-surface px-2 text-[10px] text-muted-foreground relative z-10 uppercase">
                Or continue with
              </span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => alert('Social authentication simulation ready!')}
                className="py-2.5 rounded-xl bg-surface border border-border hover:bg-surface/80 text-xs font-semibold text-foreground flex items-center justify-center gap-2"
              >
                <span>Google</span>
              </button>
              <button
                onClick={() => alert('Social authentication simulation ready!')}
                className="py-2.5 rounded-xl bg-surface border border-border hover:bg-surface/80 text-xs font-semibold text-foreground flex items-center justify-center gap-2"
              >
                <span>Apple</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-500 font-bold hover:underline">
              Create Account
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
};
