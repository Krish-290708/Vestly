'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { money, units as formatUnits } from '@/lib/format';

export function HeroSection() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  // Interactive slider state
  const [units, setUnits] = useState(10000);
  const [strikePrice, setStrikePrice] = useState(2.0);
  const [currentPrice, setCurrentPrice] = useState(15.0);
  const [monthsSinceGrant, setMonthsSinceGrant] = useState(24);

  // Standard 4-year schedule with 12-month cliff calculation
  const vestedUnits =
    monthsSinceGrant < 12
      ? 0
      : Math.min(units, Math.floor(units * (monthsSinceGrant / 48)));
  const unvestedUnits = units - vestedUnits;
  const exerciseCost = vestedUnits * strikePrice;
  const currentGrossValue = vestedUnits * currentPrice;
  const spread = Math.max(0, currentPrice - strikePrice) * vestedUnits;
  // Estimated statutory AMT spread liability (~28% federal baseline)
  const estimatedAmtSpreadTax = Math.round(spread * 0.28);

  const handleLaunchDemo = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to launch demo account:', err);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <section className="pt-8 sm:pt-14 pb-12 border-b border-rule">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Heading and Calls to Action */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted block">
              Personal equity statement & modeler
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-ink tracking-tight leading-[1.18]">
              Know what your stock options are worth, what exercising them will
              cost, and which dates you cannot miss.
            </h1>
            <p className="text-base text-muted leading-relaxed max-w-xl">
              Vestly is a free tool for working out what your equity might be
              worth. It is not tax advice.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleLaunchDemo}
              disabled={loadingDemo}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xs font-sans text-xs font-medium bg-accent text-accent-contrast hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span>{loadingDemo ? 'Opening sample portfolio…' : 'Try it with sample data'}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xs font-sans text-xs font-medium border border-rule bg-surface hover:bg-sunk text-ink transition-colors"
            >
              <span>Sign in</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-rule text-xs text-muted space-y-1.5 font-sans">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
              <span>Calculates ISO, NSO, RSU, and ESPP agreements</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
              <span>Section 83(b) deadlines tracked from share purchase date</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
              <span>Private local SQLite storage — your data stays on your machine</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive "Your grant" illustration */}
        <div className="lg:col-span-6 bg-surface border border-rule rounded-xs p-5 sm:p-6 space-y-6">
          <div className="flex items-baseline justify-between border-b border-rule pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">
                Interactive illustration
              </span>
              <h2 className="font-serif text-lg font-bold text-ink">
                Your grant
              </h2>
            </div>
            <span className="text-[11px] font-mono text-muted">
              Illustration, not advice
            </span>
          </div>

          {/* Sliders Grid */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <label htmlFor="slider-units" className="text-muted font-medium">
                  Total options granted
                </label>
                <span className="font-mono text-ink tabular-nums font-semibold">
                  {formatUnits(units)} units
                </span>
              </div>
              <input
                id="slider-units"
                type="range"
                min={1000}
                max={50000}
                step={500}
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label htmlFor="slider-strike" className="text-muted font-medium">
                    Strike price
                  </label>
                  <span className="font-mono text-ink tabular-nums font-semibold">
                    ${strikePrice.toFixed(2)}
                  </span>
                </div>
                <input
                  id="slider-strike"
                  type="range"
                  min={0.25}
                  max={50}
                  step={0.25}
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label htmlFor="slider-fmv" className="text-muted font-medium">
                    Current share price
                  </label>
                  <span className="font-mono text-ink tabular-nums font-semibold">
                    ${currentPrice.toFixed(2)}
                  </span>
                </div>
                <input
                  id="slider-fmv"
                  type="range"
                  min={1}
                  max={100}
                  step={0.5}
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <label htmlFor="slider-months" className="text-muted font-medium">
                  Months elapsed (standard 4-year, 1-year cliff)
                </label>
                <span className="font-mono text-ink tabular-nums font-semibold">
                  {monthsSinceGrant} of 48 months
                </span>
              </div>
              <input
                id="slider-months"
                type="range"
                min={0}
                max={48}
                step={1}
                value={monthsSinceGrant}
                onChange={(e) => setMonthsSinceGrant(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>
          </div>

          {/* Computed Ledger Table */}
          <div className="border border-rule rounded-xs bg-sunk/40 p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                  Vested units
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-ink tabular-nums">
                  {formatUnits(vestedUnits)}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  {monthsSinceGrant < 12 ? 'Cliff not reached' : `${formatUnits(unvestedUnits)} unvested`}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                  Exercise cost
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-ink tabular-nums">
                  {money(exerciseCost)}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  {vestedUnits > 0 ? `@ $${strikePrice.toFixed(2)}/share` : 'No cost yet'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                  Gross value
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-ink tabular-nums">
                  {money(currentGrossValue)}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  @ ${currentPrice.toFixed(2)} FMV
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                  Unrealized spread
                </span>
                <span className={`font-mono text-sm sm:text-base font-bold tabular-nums ${spread > 0 ? 'text-gain' : 'text-muted'}`}>
                  {spread > 0 ? `+${money(spread)}` : '$0'}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  Pre-tax gain
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-rule/70 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
              <span className="text-muted">
                Estimated statutory AMT spread tax (ISO baseline ~28%):
              </span>
              <span className="font-mono font-semibold text-warn tabular-nums">
                ~{money(estimatedAmtSpreadTax)}
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-muted flex items-center justify-between">
            <span>Formula: vested × (FMV - strike)</span>
            <span>Subject to individual income brackets</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

