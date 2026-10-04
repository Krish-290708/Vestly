'use client';

import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  ExternalLink, 
  Clock, 
  Filter, 
  RefreshCw, 
  Sparkles,
  Bookmark
} from 'lucide-react';

export default function NewsFeedPage() {
  const [news, setNews] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('general');
  const [loading, setLoading] = useState(true);
  const [sourceNotice, setSourceNotice] = useState<string>('');

  const fetchNews = async (cat: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/news?category=${cat}`);
      if (res.ok) {
        const data = await res.json();
        setNews(data.news || []);
        setSourceNotice(data.source || 'Market Feed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(category);
  }, [category]);

  const categories = [
    { id: 'general', label: 'All Market News' },
    { id: 'tech', label: 'Technology' },
    { id: 'business', label: 'Business & Finance' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-emerald-600" />
            Live Market News & Tech Coverage
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time coverage of private valuations, IPO pipelines, and venture capital trends via Finnhub API
          </p>
        </div>

        <button
          onClick={() => fetchNews(category)}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 self-start sm:self-auto transition-colors"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              category === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* News Articles Grid */}
      <div className="space-y-4">
        {news.map((item) => (
          <article 
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 sm:p-6 hover:shadow-elevated transition-shadow space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase">
                  {item.category || 'General'}
                </span>
                <span className="font-semibold text-slate-700">{item.source}</span>
              </div>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(item.datetime).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {item.headline}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {item.summary}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-600 transition-colors"
              >
                <span>Read Original Article</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {item.relatedTicker && (
                <span className="text-[10px] font-mono text-slate-400">
                  Tag: {item.relatedTicker}
                </span>
              )}
            </div>
          </article>
        ))}

        {news.length === 0 && !loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
            No news articles found for this category.
          </div>
        )}
      </div>
    </div>
  );
}

