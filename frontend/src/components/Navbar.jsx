import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Ticket, Zap, ShieldCheck, LogOut, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
            <Ticket className="w-6 h-6 text-white transform -rotate-12" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-violet-400">
                Ticket<span className="text-violet-500">Pulse</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-emerald-400 animate-pulse" /> Concurrency Safe API
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-violet-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            to="/events"
            className={`text-sm font-medium transition-colors ${
              isActive('/events') ? 'text-violet-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            All Events
          </Link>
        </nav>

        {/* Auth / Profile Actions */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <div className="w-6 h-6 rounded-full bg-violet-600/40 text-violet-300 flex items-center justify-center text-xs font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-200">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors flex items-center space-x-1 text-sm font-medium"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/30 transition-all flex items-center space-x-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
