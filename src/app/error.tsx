'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router caught error:', error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-card text-center space-y-5">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error?.message || 'An unexpected error occurred while loading this page.'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <a
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </a>
      </div>
    </div>
  );
}

