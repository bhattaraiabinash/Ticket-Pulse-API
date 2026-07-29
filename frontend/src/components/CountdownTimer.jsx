import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export default function CountdownTimer({ createdAt, onExpire, durationMinutes = 10 }) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (!createdAt) return;

    const createdTime = new Date(createdAt).getTime();
    const expiryTime = createdTime + durationMinutes * 60 * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diffSeconds = Math.max(0, Math.floor((expiryTime - now) / 1000));
      
      setTimeLeft(diffSeconds);

      if (diffSeconds <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, durationMinutes, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / (durationMinutes * 60)) * 100;

  const isLow = timeLeft < 120; // less than 2 minutes

  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
      isLow ? 'bg-red-500/10 border-red-500/40 text-red-300 animate-pulse' : 'bg-violet-950/40 border-violet-500/30 text-violet-200'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${isLow ? 'bg-red-500/20 text-red-400' : 'bg-violet-500/20 text-violet-400'}`}>
          {isLow ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-300">Booking Reservation Expiry</p>
          <p className="text-[10px] text-slate-400">Seats return to pool if not confirmed in time</p>
        </div>
      </div>

      <div className="text-right">
        <div className={`text-xl font-extrabold font-mono tracking-wider ${isLow ? 'text-red-400' : 'text-violet-300'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${isLow ? 'bg-red-500' : 'bg-violet-500'}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
