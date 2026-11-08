'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, TrendingUp, HelpCircle } from 'lucide-react';
import { GLOSSARY_TERMS, EDUCATIONAL_ARTICLES, MOCK_MARKET_INDICES } from '@/lib/mockData';

interface MarketIndexItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export function ResearchLearnPreview() {
  const [indices, setIndices] = useState<MarketIndexItem[]>(MOCK_MARKET_INDICES);
  const [sourceLabel, setSourceLabel] = useState('Sample data (offline)');
  const [lastUpdated, setLastUpdated] = useState('Today');

  useEffect(() => {
    let mounted = true;
    async function loadIndices() {
      try {
        const res = await fetch('/api/market/indices');
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.indices && Array.isArray(data.indices)) {
            setIndices(data.indices);
            setSourceLabel(
              data.source?.includes('Finnhub') ? 'Live quote engine' : 'Sample data (offline)'
            );
            if (data.lastUpdated) {
              setLastUpdated(new Date(data.lastUpdated).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }));
            }
          }
        }
      } catch (err) {
        // Graceful fallback to initial mock data
      }
    }
    loadIndices();
    return () => {
      mounted = false;
    };
  }, []);

  // Deterministic term of the day based on day of year
  const termOfTheDay = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = Math.abs(dayOfYear) % GLOSSARY_TERMS.length;
    return GLOSSARY_TERMS[index] || GLOSSARY_TERMS[0];
  }, []);

  // Three featured educational guides
  const featuredArticles = useMemo(() => {
    return [
      {
        slug: 'evaluating-an-offer',
        title: 'Evaluating an equity offer before you sign',
        description: 'How to decode share counts, percent ownership, liquidation preferences, and strike prices.',
        readingTime: '6 min read',
        category: 'Offer Evaluation',
      },
      {
        slug: 'iso-vs-nso',
        title: 'ISO vs. NSO: Complete tax mechanics',
        description: 'Understand the difference between capital gains treatment and ordinary income tax withholding.',
        readingTime: '8 min read',
        category: 'Tax Planning',
      },
      {
        slug: '83b-guide',
        title: 'The 30-day Section 83(b) election guide',
        description: 'Why early exercise requires filing IRS Form 83(b) within 30 days of purchase.',
        readingTime: '5 min read',
        category: 'Statutory Deadlines',
      },
    ];
  }, []);

  return (
    <section className="py-12 border-b border-rule">
      <div className="space-y-3 mb-8">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted block">
          Market context & financial education
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Research and education built-in
        </h2>
        <p className="text-sm text-muted max-w-2xl leading-relaxed">
          Follow market benchmarks and master equity mechanics with deep,
          unbiased guides written in plain English.
        </p>
      </div>

      {/* Index Strip */}
      <div className="border border-rule rounded-xs bg-surface p-4 mb-6 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted border-b border-rule pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span className="font-semibold text-ink">Major market benchmarks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded-xs bg-sunk border border-rule text-ink">
              {sourceLabel}
            </span>
            <span>As of {lastUpdated}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {indices.slice(0, 4).map((idx) => {
            const isPositive = idx.change >= 0;
            return (
              <div key={idx.symbol} className="p-2.5 rounded-xs border border-rule bg-sunk/20 space-y-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-mono font-bold text-ink">{idx.symbol}</span>
                  <span className="text-[10px] text-muted truncate max-w-[80px]">
                    {idx.name}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm font-semibold text-ink tabular-nums">
                    ${idx.price.toFixed(2)}
                  </span>
                  <span
                    className={`font-mono text-xs tabular-nums font-medium ${
                      isPositive ? 'text-gain' : 'text-loss'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {idx.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: 3 Articles (left) + Term of the Day (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Featured Guides (8 cols) */}
        <div className="lg:col-span-8 border border-rule rounded-xs bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" aria-hidden="true" />
              <h3 className="font-serif text-base font-bold text-ink">
                Featured equity guides
              </h3>
            </div>
            <Link
              href="/learn"
              className="text-xs font-sans text-accent hover:underline flex items-center gap-1 font-medium"
            >
              <span>View all guides</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="space-y-3">
            {featuredArticles.map((art) => (
              <Link
                key={art.slug}
                href={`/learn#${art.slug}`}
                className="group block p-3 rounded-xs border border-rule/70 bg-paper/50 hover:bg-paper hover:border-rule transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-muted mb-1">
                  <span className="uppercase tracking-wider">{art.category}</span>
                  <span>{art.readingTime}</span>
                </div>
                <h4 className="font-serif text-sm font-bold text-ink group-hover:text-accent transition-colors">
                  {art.title}
                </h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  {art.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Term of the Day (4 cols) */}
        <div className="lg:col-span-4 border border-rule rounded-xs bg-surface p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-accent" aria-hidden="true" />
                <h3 className="font-serif text-base font-bold text-ink">
                  Term of the day
                </h3>
              </div>
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                Glossary
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-lg font-bold text-ink">
                  {termOfTheDay.term}
                </span>
                <span className="text-[10px] font-mono text-muted px-1.5 py-0.5 rounded-xs bg-sunk border border-rule">
                  {termOfTheDay.category}
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                {termOfTheDay.shortDefinition}
              </p>
              {termOfTheDay.example && (
                <div className="p-2.5 rounded-xs bg-sunk/30 border border-rule/60 text-[11px] font-mono text-ink">
                  <span className="text-muted block text-[10px] uppercase tracking-wider mb-0.5">
                    Example:
                  </span>
                  {termOfTheDay.example}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-rule flex items-center justify-between text-xs">
            <Link
              href="/learn#glossary"
              className="text-accent hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Explore 80+ equity terms</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResearchLearnPreview;
