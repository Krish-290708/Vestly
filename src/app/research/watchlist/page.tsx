'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Trash2, 
  TrendingUp, 
  Building2, 
  ArrowRight, 
  DollarSign, 
  Layers, 
  Sparkles 
} from 'lucide-react';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/watchlist');
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data.watchlist || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (companyId: string) => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      if (res.ok) fetchWatchlist();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Bookmark className="w-7 h-7 text-emerald-600" />
          Tracked Companies Watchlist
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor valuation changes and secondary market pricing across your employers and target companies
        </p>
      </div>

      {/* Watchlist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {watchlist.map((item) => {
          const company = item.company;
          if (!company) return null;

          return (
            <div 
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4 hover:shadow-elevated transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{company.name}</h3>
                    <span className="text-xs text-slate-500">{company.sector}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(company.id)}
                    title="Remove from watchlist"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">409A / Share:</span>
                  <span className="font-extrabold text-emerald-700 font-mono text-sm">
                    ${company.latestFmvPerShare?.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {company.description || 'Venture-backed private technology enterprise.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`/research/companies?q=${encodeURIComponent(company.name)}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-600 flex items-center gap-1"
                >
                  <span>View Valuation History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                {company.ticker && (
                  <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {company.ticker}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {watchlist.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-card max-w-md mx-auto">
          <Bookmark className="w-10 h-10 text-emerald-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Your watchlist is currently empty</h3>
            <p className="text-xs text-slate-500">
              Browse the Company Explorer to follow companies and track valuation trends in one place.
            </p>
          </div>
          <a
            href="/research/companies"
            className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
          >
            Explore Companies
          </a>
        </div>
      )}
    </div>
  );
}

