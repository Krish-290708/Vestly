'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { date } from '@/lib/format';

export default function Footer() {
  const [marketMeta, setMarketMeta] = useState<{ source?: string; lastUpdated?: string } | null>(null);

  useEffect(() => {
    fetch('/api/market/indices')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.lastUpdated) {
          setMarketMeta({ source: data.source, lastUpdated: data.lastUpdated });
        }
      })
      .catch(() => {});
  }, []);
  const productLinks = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Grants', href: '/grants' },
    { label: 'Calculator', href: '/calculator' },
    { label: 'Scenarios & 83(b)', href: '/scenarios' },
    { label: 'Action center', href: '/actions' },
    { label: 'Reports', href: '/reports' },
    { label: 'Settings', href: '/settings' },
  ];

  const researchLinks = [
    { label: 'Market overview', href: '/research/market' },
    { label: 'Company explorer', href: '/research/companies' },
    { label: 'Company ESOP pool', href: '/pool' },
    { label: 'Market news', href: '/research/news' },
    { label: 'Watchlist', href: '/research/watchlist' },
  ];

  const learnLinks = [
    { label: 'Equity guides', href: '/learn' },
    { label: 'Financial glossary', href: '/learn#glossary' },
    { label: 'Section 83(b) election', href: '/learn#section-83b' },
    { label: 'ISO vs NSO taxation', href: '/learn#iso' },
  ];

  return (
    <footer className="border-t border-rule bg-paper text-ink font-sans transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8 pb-8 border-b border-rule">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-block focus:outline-hidden" title="Vestly">
              <Logo size="sm" />
            </Link>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              A quiet, numbers-first equity compensation calculator and scenario planning tool
              for employees holding stock options, RSUs, and ESPPs.
            </p>
            <div className="text-[11px] font-mono text-muted space-y-0.5">
              <p>Market data: {marketMeta?.source || 'refreshing source information'}</p>
              <p>Last refreshed: {marketMeta?.lastUpdated ? date(marketMeta.lastUpdated) : 'not yet available'}</p>
              <p>Calculations: estimates based on the assumptions you enter</p>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
              Product
            </h4>
            <ul className="space-y-1.5 text-xs">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Research */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
              Research
            </h4>
            <ul className="space-y-1.5 text-xs">
              {researchLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Learn */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
              Learn
            </h4>
            <ul className="space-y-1.5 text-xs">
              {learnLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-muted">
          <p className="leading-relaxed max-w-3xl">
            <strong className="text-ink font-semibold">Notice:</strong> Vestly provides mathematical estimates for educational and scenario planning purposes only. It does not constitute legal, tax, or investment advice. Always consult a certified CPA or tax attorney before exercising options or making tax elections.
          </p>
          <div className="flex items-center gap-3 shrink-0 font-mono text-[10px]">
            <span>Vestly v1.0.0</span>
            <span>·</span>
            <span>The Ledger</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
