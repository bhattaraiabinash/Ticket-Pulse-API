import React from 'react';
import { Armchair, Check } from 'lucide-react';

export default function SeatMap({ tickets = [], selectedTicketIds = [], onToggleTicket }) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
        No seats initialized for this event yet.
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800">
      
      {/* Stage / Screen indicator */}
      <div className="mb-8">
        <div className="w-full h-3 bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-600 rounded-full opacity-75 shadow-lg shadow-violet-500/30"></div>
        <p className="text-center text-[10px] uppercase font-bold tracking-widest text-violet-400 mt-2">
          STAGE / SCREEN
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/50"></div>
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-violet-600 border border-violet-400 text-white flex items-center justify-center text-[10px]">
            <Check className="w-3 h-3" />
          </div>
          <span className="text-violet-300 font-semibold">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40"></div>
          <span className="text-slate-400">Reserved</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700 opacity-60"></div>
          <span className="text-slate-500">Sold</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 justify-items-center">
        {tickets.map((ticket) => {
          const isSelected = selectedTicketIds.includes(ticket.id);
          const isAvailable = ticket.status === 'AVAILABLE';
          const isReserved = ticket.status === 'RESERVED';
          const isSold = ticket.status === 'SOLD';

          let buttonStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-400 hover:scale-105';
          
          if (isSelected) {
            buttonStyle = 'bg-violet-600 border-violet-400 text-white glow-purple scale-105 ring-2 ring-violet-400/50';
          } else if (isReserved) {
            buttonStyle = 'bg-amber-500/10 border-amber-500/30 text-amber-400/60 cursor-not-allowed opacity-60';
          } else if (isSold) {
            buttonStyle = 'bg-slate-800/80 border-slate-700/50 text-slate-600 cursor-not-allowed opacity-40';
          }

          return (
            <button
              key={ticket.id}
              disabled={!isAvailable && !isSelected}
              onClick={() => onToggleTicket(ticket)}
              className={`w-12 h-14 rounded-xl border flex flex-col items-center justify-between p-1.5 transition-all duration-200 ${buttonStyle}`}
              title={`Seat ${ticket.seat_number} - Rs. ${ticket.price} (${ticket.status})`}
            >
              <Armchair className="w-4 h-4 mt-0.5" />
              <span className="text-[11px] font-bold tracking-tight">
                {ticket.seat_number}
              </span>
              <span className="text-[9px] opacity-75 font-mono">
                Rs.{Math.round(ticket.price)}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
