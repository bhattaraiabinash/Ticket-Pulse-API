import React from 'react';

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 animate-pulse space-y-4">
      <div className="h-48 bg-slate-800/60 rounded-xl"></div>
      <div className="h-6 bg-slate-800/80 rounded w-3/4"></div>
      <div className="h-4 bg-slate-800/60 rounded w-1/2"></div>
      <div className="flex justify-between items-center pt-4">
        <div className="h-6 bg-slate-800 rounded w-1/4"></div>
        <div className="h-10 bg-slate-800 rounded-lg w-1/3"></div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
