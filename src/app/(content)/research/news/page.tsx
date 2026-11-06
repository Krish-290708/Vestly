'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, Badge, Button, Callout } from '@/components/ui';
import { date, relativeDays } from '@/lib/format';

interface NewsItem {
  id: string;
  category: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  relatedTicker?: string;
  image?: string;
}

export default function NewsFeedPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [category, setCategory] = useState<string>('general');
  const [loading, setLoading] = useState(true);
  const [sourceNotice, setSourceNotice] = useState<string>('');
  const [isSimulated, setIsSimulated] = useState(false);

  const fetchNews = async (cat: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/news?category=${cat}`);
      if (res.ok) {
        const data = await res.json();
        setNews(data.news || []);
        setSourceNotice(data.source || 'Market Feed');
        setIsSimulated(Boolean(data.isSimulated));
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
    { id: 'general', label: 'All market news' },
    { id: 'tech', label: 'Technology' },
    { id: 'business', label: 'Venture and finance' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Research"
        title="News"
        contextSentence="Curated venture capital coverage, secondary tender offers, and regulatory shifts affecting equity holders."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchNews(category)}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh feed'}
          </Button>
        }
      />

      {/* Source transparency notice */}
      <Callout variant="note">
        Source transparency: Headlines are retrieved from {sourceNotice}. Articles are tagged with verification status to distinguish live API feeds from curated reference samples.
      </Callout>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-rule pb-2 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${
              category === cat.id
                ? 'bg-accent text-white font-semibold'
                : 'text-muted hover:text-ink hover:bg-sunk/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
        <span className="text-muted ml-auto font-mono text-[11px] tabular-nums">
          {news.length} articles
        </span>
      </div>

      {/* News Articles List */}
      <div className="space-y-3">
        {news.map((item) => (
          <article
            key={item.id}
            className="p-4 sm:p-5 border border-rule rounded-sm bg-surface hover:border-rule/80 transition-colors space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink">{item.source}</span>
                <Badge tone={isSimulated ? 'neutral' : 'gain'}>
                  {isSimulated ? 'Sample archive' : 'Live wire'}
                </Badge>
                <span className="text-muted text-[11px] uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              <span className="font-mono text-[11px] text-muted tabular-nums">
                {date(item.datetime)} ({relativeDays(item.datetime)})
              </span>
            </div>

            <h3 className="font-serif text-base font-semibold text-ink leading-snug">
              {item.headline}
            </h3>

            <p className="text-xs text-muted leading-relaxed">
              {item.summary}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-rule/60 text-xs">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink hover:text-accent underline underline-offset-2"
              >
                Read original source →
              </a>

              {item.relatedTicker && (
                <span className="font-mono text-[10px] text-muted bg-sunk px-1.5 py-0.5 rounded-sm border border-rule">
                  Ticker: {item.relatedTicker}
                </span>
              )}
            </div>
          </article>
        ))}

        {news.length === 0 && !loading && (
          <div className="p-8 border border-rule rounded-sm text-center text-xs text-muted bg-surface">
            No news articles found for this category.
          </div>
        )}
      </div>
    </div>
  );
}
