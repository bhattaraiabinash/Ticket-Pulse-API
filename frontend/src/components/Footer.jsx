import React from 'react';
import { ShieldCheck, Cpu, Database, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 text-slate-400 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/60">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
                TP
              </div>
              <span className="font-bold text-white text-lg">TicketPulse API</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-performance Event Ticketing REST API featuring PostgreSQL row-level concurrency locking, Redis cache-aside, and Celery async workers.
            </p>
          </div>

          {/* Infrastructure status cards */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Engine Specs</h4>
            <div className="flex items-center space-x-2 text-xs bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>PostgreSQL 16 (select_for_update)</span>
            </div>
            <div className="flex items-center space-x-2 text-xs bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Redis 7 Cache (~1ms Hit)</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Async Pipeline</h4>
            <div className="flex items-center space-x-2 text-xs bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Celery + Celery Beat</span>
            </div>
            <div className="flex items-center space-x-2 text-xs bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>10-Min Expiry Auto Clean</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Repository</h4>
            <a
              href="https://github.com/bhattaraiabinash/Ticket-Pulse-API"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg border border-slate-800 transition-colors"
            >
              <svg className="w-4 h-4 text-violet-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub: bhattaraiabinash/Ticket-Pulse-API</span>
            </a>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TicketPulse API. Senior Engineering Portfolio Project.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> API Operational
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
