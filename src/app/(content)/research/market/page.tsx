'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader, Badge, Button, Callout, Table } from '@/components/ui';
import { money, percent } from '@/lib/format';

interface IndexQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  status: string;
  high52Week?: number;
  low52Week?: number;
}

interface SectorQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function MarketOverviewPage() {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarket = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/market/indices');
      if (res.ok) {
        const data = await res.json();
        setMarketData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
  }, []);

  const indices: IndexQuote[] = marketData?.indices || [];
  const sectors: SectorQuote[] = marketData?.sectors || [];
  const session = marketData?.sessionStatus;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="Research"
        title="Markets"
        contextSentence="Benchmark index quotes, technology sector momentum, and macroeconomic valuation drivers."
        actions={
          <div className="flex items-center gap-2">
            {session && (
              <Badge tone={session.isOpen ? 'gain' : 'neutral'} dot>
                {session.label}
              </Badge>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchMarket}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh quotes'}
            </Button>
          </div>
        }
      />

      {/* Notice / Rate limit information */}
      {marketData?.notice && (
        <Callout variant="note">
          {marketData.notice} Source: {marketData.source}.
        </Callout>
      )}

      {/* Major benchmark index table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-sm font-semibold text-ink">
            Major benchmark indices
          </h2>
          <span className="text-[11px] text-muted">
            5-second timeout with fallback
          </span>
        </div>

        <div className="border border-rule rounded-sm overflow-hidden bg-surface">
          <table className="w-full text-xs text-left">
            <thead className="bg-sunk border-b border-rule">
              <tr>
                <th className="p-3 font-semibold text-muted">Index / ETF</th>
                <th className="p-3 font-semibold text-muted">Symbol</th>
                <th className="p-3 font-semibold text-muted text-right">Price</th>
                <th className="p-3 font-semibold text-muted text-right">Day change</th>
                <th className="p-3 font-semibold text-muted text-right">Change %</th>
                <th className="p-3 font-semibold text-muted text-right">52-week range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {indices.map((idx) => {
                const isPositive = (idx.change || 0) >= 0;
                return (
                  <tr key={idx.symbol} className="hover:bg-sunk/30 transition-colors">
                    <td className="p-3 font-medium text-ink">{idx.name}</td>
                    <td className="p-3 font-mono text-[11px] text-muted">{idx.symbol}</td>
                    <td className="p-3 font-mono text-right tabular-nums text-ink font-semibold">
                      {money(idx.price, { showCents: true })}
                    </td>
                    <td className={`p-3 font-mono text-right tabular-nums ${isPositive ? 'text-gain' : 'text-loss'}`}>
                      {isPositive ? '+' : ''}{idx.change ? idx.change.toFixed(2) : '0.00'}
                    </td>
                    <td className={`p-3 font-mono text-right tabular-nums font-semibold ${isPositive ? 'text-gain' : 'text-loss'}`}>
                      {isPositive ? '+' : ''}{idx.changePercent ? idx.changePercent.toFixed(2) : '0.00'}%
                    </td>
                    <td className="p-3 font-mono text-right tabular-nums text-muted text-[11px]">
                      {idx.low52Week && idx.high52Week
                        ? `${money(idx.low52Week)} – ${money(idx.high52Week)}`
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sector ETF performance grid */}
      <section className="space-y-3">
        <h2 className="font-serif text-sm font-semibold text-ink">
          Sector ETF performance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectors.map((sec) => {
            const isUp = sec.change >= 0;
            return (
              <div
                key={sec.symbol}
                className="p-3.5 border border-rule rounded-sm bg-surface space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-ink">
                    {sec.symbol}
                  </span>
                  <Badge tone={isUp ? 'gain' : 'loss'}>
                    {isUp ? '+' : ''}{sec.changePercent.toFixed(2)}%
                  </Badge>
                </div>
                <div className="text-xs text-muted truncate">{sec.name}</div>
                <div className="flex items-baseline justify-between pt-1 border-t border-rule/60 text-xs">
                  <span className="font-mono tabular-nums text-ink font-medium">
                    {money(sec.price, { showCents: true })}
                  </span>
                  <span className={`font-mono text-[11px] tabular-nums ${isUp ? 'text-gain' : 'text-loss'}`}>
                    {isUp ? '+' : ''}{money(sec.change, { showCents: true })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8.2 Market dynamics educational explainers */}
      <section className="space-y-4 pt-4 border-t border-rule">
        <div className="space-y-1">
          <h2 className="font-serif text-base font-semibold text-ink">
            Market dynamics and equity valuation
          </h2>
          <p className="text-xs text-muted">
            Understanding how public market multiples, monetary policy, and liquidity affect private employee equity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-rule rounded-sm bg-surface space-y-2">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
              1. Public multiples and 409A appraisals
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Private company 409A valuations rely on comparable public company revenue multiples (e.g. BVP Cloud Index, Nasdaq-100). When public multiples compress from 15x to 8x ARR, independent appraisers mark down private common stock even if company revenue is growing.
            </p>
          </div>

          <div className="p-4 border border-rule rounded-sm bg-surface space-y-2">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
              2. Interest rates and cost of capital
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Higher discount rates reduce the present value of future cash flows in discounted cash flow (DCF) models. This directly lowers equity value per share for high-growth, cash-burning startups and shifts venture capital preference toward profitable business models.
            </p>
          </div>

          <div className="p-4 border border-rule rounded-sm bg-surface space-y-2">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
              3. Secondary market discounts vs preferred stock
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Employee common stock typically trades at a 20% to 40% discount to investor preferred stock on secondary platforms (Forge, CartaX). Preferred shares carry liquidation preferences and protective covenants that common shares lack.
            </p>
          </div>

          <div className="p-4 border border-rule rounded-sm bg-surface space-y-2">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
              4. IPO window readiness and liquidity
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Public market listing windows require low volatility (VIX under 20) and predictable earnings multiples. Employees facing 10-year option expiration dates must monitor IPO pipeline readiness to plan exercise capital before expiration.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 border border-rule rounded-sm bg-sunk/40 text-xs">
          <span className="text-muted">
            Looking for company-specific 409A history and valuations?
          </span>
          <Link
            href="/research/companies"
            className="font-medium text-ink hover:text-accent underline underline-offset-2"
          >
            Explore verified companies
          </Link>
        </div>
      </section>
    </div>
  );
}
