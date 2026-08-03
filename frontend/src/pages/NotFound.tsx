import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] pt-24 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl glass-card border border-border shadow-2xl"
      >
        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto">
          <Ticket className="w-10 h-10 transform -rotate-12" />
        </div>

        <div className="space-y-2">
          <span className="font-mono font-black text-4xl text-indigo-500">404</span>
          <h1 className="font-heading font-black text-2xl text-foreground">Page Not Found</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The ticket page or seat layout you requested does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            to="/events"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> Browse All Events
          </Link>

          <Link
            to="/"
            className="w-full py-3 rounded-xl bg-surface border border-border text-foreground font-semibold text-xs hover:border-indigo-500/50 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
