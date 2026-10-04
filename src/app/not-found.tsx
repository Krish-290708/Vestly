import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-card text-center space-y-4">
      <span className="text-4xl font-extrabold text-emerald-600 font-mono block">
        404
      </span>
      <h2 className="text-lg font-bold text-slate-900">Page Not Found</h2>
      <p className="text-xs text-slate-500 leading-relaxed">
        The requested equity module or resource could not be found.
      </p>
      <div className="pt-2">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Go to Dashboard</span>
        </a>
      </div>
    </div>
  );
}

