'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, ArrowRight, TrendingUp } from 'lucide-react';
import { money } from '@/lib/format';

interface WatchlistItemData {
  id: string;
  companyId: string;
  note?: string | null;
  company: {
    id: string;
    name: string;
    symbol?: string | null;
    slug?: string | null;
    latestFmvPerShare: number;
    industry?: string | null;
  };
}

export function WatchlistStrip() {
  const [watchlist, setWatchlist] = useState<WatchlistItemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadWatchlist() {
      try {
        const res = await fetch('/api/watchlist');
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.watchlist && Array.isArray(data.watchlist)) {
            setWatchlist(data.watchlist);
          }
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadWatchlist();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="border border-rule rounded-xs bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent" aria-hidden="true" />
          <h2 className="font-serif text-base font-bold text-ink">
            Company watchlist
          </h2>
        </div>
        <Link
          href="/research/watchlist"
          className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-medium"
        >
          <span>Manage watchlist</span>
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>

      {watchlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {watchlist.map((item) => (
            <Link
              key={item.id}
              href={`/research/companies/${item.company.slug || item.company.id}`}
              className="p-3 border border-rule/70 rounded-xs bg-sunk/20 hover:bg-sunk/40 transition-colors block space-y-1 group"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-xs text-ink group-hover:text-accent transition-colors">
                  {item.company.name}
                </span>
                {item.company.symbol && (
                  <span className="text-[10px] font-mono text-muted uppercase">
                    {item.company.symbol}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between text-xs font-mono">
                <span className="font-bold text-ink">
                  ${item.company.latestFmvPerShare.toFixed(2)}
                </span>
                <span className="text-[10px] text-muted">Latest 409A / FMV</span>
              </div>
              {item.note && (
                <p className="text-[11px] text-muted truncate pt-0.5 font-sans">
                  {item.note}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted font-sans">
          <span>
            No companies on your watchlist. Track employer valuations, funding rounds, and public comps.
          </span>
          <Link
            href="/research/companies"
            className="text-accent hover:underline inline-flex items-center gap-1 font-medium shrink-0"
          >
            <span>Explore companies</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default WatchlistStrip;

