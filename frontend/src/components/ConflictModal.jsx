import React from 'react';
import { AlertOctagon, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConflictModal({ isOpen, errorMessage, onRetry, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card rounded-2xl max-w-md w-full p-6 border border-red-500/30 shadow-2xl relative glow-red"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40 shrink-0">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">409 Concurrency Conflict</h3>
              <p className="text-xs text-red-300 font-mono">PostgreSQL Row-Level Lock Active</p>
            </div>
          </div>

          <div className="bg-red-950/30 rounded-xl p-4 border border-red-500/20 mb-6">
            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              {errorMessage || "One or more of your selected seats were just claimed by another user!"}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              TicketPulse enforces strict atomic row locks (`select_for_update`) to prevent double-booking.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onRetry}
              className="flex-1 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Select Other Seats</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
