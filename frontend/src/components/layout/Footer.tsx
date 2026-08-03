import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Send, ShieldCheck, Zap, Globe, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                <Ticket className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-2xl text-white tracking-tight">
                Ticket<span className="text-indigo-400">Pulse</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Every seat. Every moment. Perfectly placed. Enterprise-grade event ticketing infrastructure built for Nepal and South Asia.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Row-Level Locking
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <Zap className="w-4 h-4 text-amber-400" />
                Sub-ms Locks
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/events" className="hover:text-indigo-400 transition-colors">Browse Events</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</Link></li>
              <li><Link to="/#pricing" className="hover:text-indigo-400 transition-colors">Pricing & Plans</Link></li>
              <li><a href="http://localhost:8000/api/docs/" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors flex items-center gap-1">API Docs <Globe className="w-3 h-3"/></a></li>
            </ul>
          </div>

          {/* Organizers */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm tracking-wider uppercase mb-4">Organizers</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#sell" className="hover:text-indigo-400 transition-colors">Sell Tickets</a></li>
              <li><a href="#venues" className="hover:text-indigo-400 transition-colors">Venue Partners</a></li>
              <li><a href="#analytics" className="hover:text-indigo-400 transition-colors">Real-time Analytics</a></li>
              <li><a href="http://localhost:8000/health/" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">System Health</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm tracking-wider uppercase mb-4">Stay Updated</h4>
            <p className="text-xs text-slate-400 mb-3">Get notified about hot concerts and sports finals in South Asia.</p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter email..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TicketPulse Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Powered by</span>
            <span className="font-semibold text-white">TicketPulse SaaS Engine</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
