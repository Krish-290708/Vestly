import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 text-slate-400">
      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 animate-pulse">
        <Sparkles className="w-4 h-4 animate-spin" />
      </div>
      <span className="text-xs font-medium">Loading equity data...</span>
    </div>
  );
}

