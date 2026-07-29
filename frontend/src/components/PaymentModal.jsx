import React, { useState } from 'react';
import { CreditCard, CheckCircle, Lock, Loader2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentModal({ isOpen, onClose, onConfirmPayment, totalAmount }) {
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setProcessing(true);
    // Simulate 1.2s payment gateway processing delay
    setTimeout(() => {
      setProcessing(false);
      onConfirmPayment();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card rounded-2xl max-w-md w-full p-6 border border-slate-700 shadow-2xl relative"
        >
          <button
            onClick={onClose}
            disabled={processing}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-600/30 text-violet-400 flex items-center justify-center border border-violet-500/40">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Payment Simulation</h3>
              <p className="text-xs text-slate-400">Sandbox Payment Gateway Demo</p>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Total Payable:</span>
              <span className="text-xl font-extrabold text-white font-mono">
                Rs. {totalAmount ? Number(totalAmount).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 pt-2 border-t border-slate-800">
              <Lock className="w-3.5 h-3.5" />
              <span>256-bit SSL Encrypted Sandbox Transaction</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSimulatePayment}
              disabled={processing}
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-violet-300" />
                  <span>Simulate Payment & Confirm</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              disabled={processing}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
