'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Calculator, 
  GitFork, 
  Bell, 
  FileText, 
  Building2, 
  ArrowRight,
  Check
} from 'lucide-react';
import { money, units as formatUnits } from '@/lib/format';

export function FeaturesSection() {
  return (
    <section className="py-12 border-b border-rule">
      <div className="space-y-3 mb-12">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted block">
          Platform capabilities
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          What Vestly does
        </h2>
        <p className="text-sm text-muted max-w-2xl leading-relaxed">
          Six practical tools designed to replace ad-hoc spreadsheets with precise,
          statutory equity calculations.
        </p>
      </div>

      <div className="space-y-12">
        {/* Row 1: Vesting schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <Calendar className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>Capability 01</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">
              Multi-grant vesting engine
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Consolidate grants across employers in one unified timeline. Track
              one-year cliffs, monthly vesting increments, and remaining unvested
              shares without juggling disparate stock portals.
            </p>
            <div className="pt-1">
              <Link
                href="/grants"
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
              >
                <span>Explore grants ledger</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 bg-surface border border-rule rounded-xs p-5 space-y-4">
            <div className="flex items-baseline justify-between border-b border-rule pb-2.5">
              <span className="font-serif text-xs font-bold text-ink">
                Stripe, Inc. — 10,000 ISOs
              </span>
              <span className="text-[11px] font-mono text-gain font-semibold">
                50% vested (24 of 48 mo)
              </span>
            </div>

            <div className="space-y-2">
              <div className="h-2 w-full bg-sunk rounded-xs overflow-hidden flex">
                <div className="h-full bg-accent" style={{ width: '50%' }} />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-muted">
                <span>5,000 vested</span>
                <span>5,000 unvested</span>
              </div>
            </div>

            <div className="border border-rule rounded-xs bg-sunk/30 p-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-mono text-muted block">Next vest date</span>
                <span className="font-mono text-ink font-semibold">1 Nov 2026 (in 14 days)</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-muted block">Next vesting units</span>
                <span className="font-mono text-ink font-semibold">+208 shares</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Calculator (reversed layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 bg-surface border border-rule rounded-xs p-5 space-y-4">
            <div className="flex items-baseline justify-between border-b border-rule pb-2.5">
              <span className="font-serif text-xs font-bold text-ink">
                Exercise cost & tax waterfall
              </span>
              <span className="text-[11px] font-mono text-muted">
                5,000 units @ $2.00 strike
              </span>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between py-1 border-b border-rule/50">
                <span className="text-muted">Exercise cost (5,000 × $2.00)</span>
                <span className="font-mono text-ink tabular-nums">$10,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-rule/50">
                <span className="text-muted">Current fair market value ($15.00/share)</span>
                <span className="font-mono text-ink tabular-nums">$75,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-rule/50">
                <span className="text-muted">Unrealized spread subject to AMT</span>
                <span className="font-mono text-gain font-semibold tabular-nums">+$65,000</span>
              </div>
              <div className="flex justify-between py-1 text-warn font-medium">
                <span>Estimated statutory AMT liability (~28%)</span>
                <span className="font-mono tabular-nums">~$18,200</span>
              </div>
            </div>

            <div className="p-2.5 border-t border-rule bg-sunk/40 flex justify-between items-center text-xs">
              <span className="font-serif font-bold text-ink">Total upfront cash needed:</span>
              <span className="font-mono text-sm font-bold text-ink tabular-nums">$28,200</span>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <Calculator className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>Capability 02</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">
              Exercise cost and tax modeling
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Calculate required cash before writing a check to exercise. Model
              exact strike payments, statutory Alternative Minimum Tax (AMT) on
              ISO spreads, and ordinary income tax withholding on NSOs.
            </p>
            <div className="pt-1">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
              >
                <span>Launch equity calculator</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Row 3: Scenarios */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <GitFork className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>Capability 03</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">
              Multi-scenario exit comparison
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Compare financial outcomes across different exit strategies and
              company valuation multiples. Understand how early exercise and
              long-term holding periods impact your net take-home proceeds.
            </p>
            <div className="pt-1">
              <Link
                href="/scenarios"
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
              >
                <span>Compare exit strategies</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 bg-surface border border-rule rounded-xs p-5 space-y-3">
            <div className="flex items-baseline justify-between border-b border-rule pb-2">
              <span className="font-serif text-xs font-bold text-ink">
                Exit comparison @ $30.00/share
              </span>
              <span className="text-[11px] font-mono text-muted">
                10,000 units
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-left">
              <div className="border border-rule rounded-xs p-2.5 bg-sunk/20 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                  Early exercise
                </span>
                <span className="font-mono text-sm font-bold text-gain block tabular-nums">
                  $212,400
                </span>
                <span className="text-[10px] text-muted block">
                  Long-term gains
                </span>
              </div>

              <div className="border border-rule rounded-xs p-2.5 bg-sunk/20 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                  Cashless at exit
                </span>
                <span className="font-mono text-sm font-bold text-ink block tabular-nums">
                  $176,400
                </span>
                <span className="text-[10px] text-muted block">
                  Ordinary income
                </span>
              </div>

              <div className="border border-rule rounded-xs p-2.5 bg-sunk/20 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                  Walk away
                </span>
                <span className="font-mono text-sm font-bold text-muted block tabular-nums">
                  $0
                </span>
                <span className="text-[10px] text-muted block">
                  Zero proceeds
                </span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-muted pt-1">
              Early exercise delivers +$36,000 net in this model due to 20% capital gains rate.
            </p>
          </div>
        </div>

        {/* Row 4: Deadlines (reversed layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 bg-surface border border-rule rounded-xs p-5 space-y-3">
            <div className="flex items-baseline justify-between border-b border-rule pb-2">
              <span className="font-serif text-xs font-bold text-ink">
                Action items and statutory deadlines
              </span>
              <span className="text-[11px] font-mono text-muted">
                Active alerts
              </span>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="p-2.5 border border-rule rounded-xs bg-sunk/30 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-semibold text-ink block">
                    Section 83(b) election filing deadline
                  </span>
                  <span className="text-[11px] text-muted block">
                    30 days from share purchase date (IRS Form required)
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-warn/15 text-warn border border-warn/30 shrink-0">
                  Due in 18 days
                </span>
              </div>

              <div className="p-2.5 border border-rule rounded-xs bg-sunk/30 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-semibold text-ink block">
                    Post-termination exercise window
                  </span>
                  <span className="text-[11px] text-muted block">
                    90-day statutory window after company departure
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-medium bg-sunk text-muted border border-rule shrink-0">
                  Monitored
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <Bell className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>Capability 04</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">
              Critical deadline tracking
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Never miss an irrevocable statutory election. Track the strict
              30-day Section 83(b) window from your actual share purchase date,
              post-termination exercise periods, and 10-year grant expirations.
            </p>
            <div className="pt-1">
              <Link
                href="/actions"
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
              >
                <span>View action center</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Row 5: Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <FileText className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>Capability 05</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">
              CPA and tax-year report pack
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Export clean, structured statements for tax season. Generate complete
              portfolio summaries, Form 3921 references, and CSV files ready for
              your accountant or financial planner.
            </p>
            <div className="pt-1">
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
              >
                <span>View equity reports</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 bg-surface border border-rule rounded-xs p-5 space-y-3">
            <div className="flex items-baseline justify-between border-b border-rule pb-2">
              <span className="font-serif text-xs font-bold text-ink">
                Annual Equity Statement · Tax Year 2026
              </span>
              <span className="text-[10px] font-mono text-muted">
                PDF & CSV Ready
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 border border-rule rounded-xs bg-sunk/30">
                <span className="text-[10px] text-muted block">Grants held</span>
                <span className="font-bold text-ink">3 active</span>
              </div>
              <div className="p-2 border border-rule rounded-xs bg-sunk/30">
                <span className="text-[10px] text-muted block">Cost basis</span>
                <span className="font-bold text-ink">$22,500</span>
              </div>
              <div className="p-2 border border-rule rounded-xs bg-sunk/30">
                <span className="text-[10px] text-muted block">Estimated value</span>
                <span className="font-bold text-gain">$187,500</span>
              </div>
            </div>

            <div className="pt-1 text-[11px] font-mono text-muted flex items-center justify-between">
              <span>Includes IRS Form 3921 exercise records</span>
              <span className="text-accent font-medium">Download CSV / Print</span>
            </div>
          </div>
        </div>

        {/* Row 6: Research comps (reversed layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 bg-surface border border-rule rounded-xs p-5 space-y-3">
            <div className="flex items-baseline justify-between border-b border-rule pb-2">
              <span className="font-serif text-xs font-bold text-ink">
                Stripe, Inc. · Series I benchmark
              </span>
              <span className="text-[10px] font-mono text-muted">
                As of Mar 2024
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 border border-rule rounded-xs bg-sunk/30">
                <span className="text-[10px] text-muted block">Valuation</span>
                <span className="font-bold text-ink">$65.0B</span>
              </div>
              <div className="p-2 border border-rule rounded-xs bg-sunk/30">
                <span className="text-[10px] text-muted block">Share price</span>
                <span className="font-bold text-ink">$32.00</span>
              </div>
              <div className="p-2 border border-rule rounded-xs bg-sunk/30">
                <span className="text-[10px] text-muted block">Revenue multiple</span>
                <span className="font-bold text-accent">6.8x P/S</span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-muted pt-1">
              Source: Secondary tender offer filings · Sample benchmark data
            </p>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <Building2 className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>Capability 06</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">
              Verified company benchmarks
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Put your equity in context. Review verified funding rounds, 409A
              valuation trajectories, and public SaaS revenue multiples to understand
              what your equity represents.
            </p>
            <div className="pt-1">
              <Link
                href="/research/companies"
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
              >
                <span>Browse research database</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;

