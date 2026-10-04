'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold mx-auto text-lg">
            !
          </div>
          <h2 className="text-xl font-bold">System Error</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error?.message || 'A global application error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}

