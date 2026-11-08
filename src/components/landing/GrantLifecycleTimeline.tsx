'use client';

import React, { useState } from 'react';
import { money, units as formatUnits } from '@/lib/format';

interface TimelineNode {
  step: string;
  month: string;
  title: string;
  line1: string;
  line2: string;
}

const TIMELINE_NODES: TimelineNode[] = [
  {
    step: '01',
    month: 'Month 0',
    title: 'Grant approval',
    line1: 'Board approves option agreement.',
    line2: 'Strike price fixed to fair market value.',
  },
  {
    step: '02',
    month: 'Month 12',
    title: 'The one-year cliff',
    line1: 'First 25% of options vest simultaneously.',
    line2: 'Leaving before month 12 forfeits all units.',
  },
  {
    step: '03',
    month: 'Months 13–48',
    title: 'Monthly vesting',
    line1: '1/48th of total grant vests each month.',
    line2: 'Accrues steadily over 36 monthly increments.',
  },
  {
    step: '04',
    month: 'Discretionary',
    title: 'Share exercise',
    line1: 'Pay strike price to purchase vested stock.',
    line2: 'Starts 1-year holding period for long-term gains.',
  },
  {
    step: '05',
    month: 'Exit / Liquidity',
    title: 'Sale of shares',
    line1: 'Sell shares at IPO, tender, or acquisition.',
    line2: 'Realize proceeds; settle capital gains or income tax.',
  },
];

export function GrantLifecycleTimeline() {
  const [sampleUnits, setSampleUnits] = useState(10000);
  const [sampleStrike, setSampleStrike] = useState(2.0);
  const [sampleExit, setSampleExit] = useState(30.0);

  // Worked example live math
  const cliffUnits = Math.round(sampleUnits * 0.25);
  const cliffExerciseCost = cliffUnits * sampleStrike;
  const cliffValueAtExit = cliffUnits * sampleExit;

  const totalExerciseCost = sampleUnits * sampleStrike;
  const totalGrossExitValue = sampleUnits * sampleExit;
  const totalGrossSpread = totalGrossExitValue - totalExerciseCost;

  return (
    <section className="py-12 border-b border-rule">
      <div className="space-y-3 mb-8">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted block">
          The option lifecycle
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          How an option grant works
        </h2>
        <p className="text-sm text-muted max-w-2xl leading-relaxed">
          From board approval to eventual liquidation, standard incentive stock
          options follow five milestone stages under US corporate law.
        </p>
      </div>

      {/* Horizontal Timeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {TIMELINE_NODES.map((node, idx) => (
          <div
            key={node.step}
            className="border border-rule rounded-xs bg-surface p-4 flex flex-col justify-between space-y-3 relative"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted border-b border-rule pb-2">
                <span className="font-semibold text-accent">{node.step}</span>
                <span>{node.month}</span>
              </div>
              <h3 className="font-serif text-sm font-bold text-ink pt-1">
                {node.title}
              </h3>
            </div>

            <div className="text-xs text-muted space-y-1 leading-relaxed">
              <p>{node.line1}</p>
              <p>{node.line2}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Live Worked Example Beneath */}
      <div className="mt-8 border border-rule rounded-xs bg-sunk/30 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">
              Worked example
            </span>
            <h4 className="font-serif text-base font-bold text-ink">
              Live progression for {formatUnits(sampleUnits)} units @ ${sampleStrike.toFixed(2)} strike
            </h4>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-muted">Exit price assumed:</span>
            <span className="font-semibold text-ink">${sampleExit.toFixed(2)}/share</span>
          </div>
        </div>

        {/* Milestone Ruled Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-rule text-muted text-[11px] font-mono">
                <th className="py-2 pr-4 font-medium">Stage</th>
                <th className="py-2 px-4 font-medium text-right">Vested units</th>
                <th className="py-2 px-4 font-medium text-right">Cash needed to exercise</th>
                <th className="py-2 px-4 font-medium text-right">Value at exit (${sampleExit.toFixed(2)})</th>
                <th className="py-2 pl-4 font-medium">Status & key consideration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60 text-ink">
              <tr>
                <td className="py-2.5 pr-4 font-medium">Month 0: Grant approved</td>
                <td className="py-2.5 px-4 font-mono text-right tabular-nums">0</td>
                <td className="py-2.5 px-4 font-mono text-right tabular-nums">$0</td>
                <td className="py-2.5 px-4 font-mono text-right tabular-nums">$0</td>
                <td className="py-2.5 pl-4 text-muted">Options granted; non-exercisable until cliff.</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">Month 12: 1-year cliff</td>
                <td className="py-2.5 px-4 font-mono text-right tabular-nums font-semibold">
                  {formatUnits(cliffUnits)}
                </td>
                <td className="py-2.5 px-4 font-mono text-right tabular-nums">
                  {money(cliffExerciseCost)}
                </td>
                <td className="py-2.5 px-4 font-mono text-right tabular-nums">
                  {money(cliffValueAtExit)}
                </td>
                <td className="py-2.5 pl-4 text-muted">First 25% vests; eligible for early exercise.</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">Month 24: Halfway vested</td>
                <td className="py-2.5 px-4 font-mono text-right tabular-nums font-semibold">
                  {formatUnits(sampleUnits * 0.5)}
                </td>
                <td className="py-2.5 px-4 font-mono text-right tabular-nums">
                  {money(sampleUnits * 0.5 * sampleStrike)}
                </td>
                <td className="py-2.5 px-4 font-mono text-right tabular-nums">
                  {money(sampleUnits * 0.5 * sampleExit)}
                </td>
                <td className="py-2.5 pl-4 text-muted">50% of grant vested; monthly vesting continues.</td>
              </tr>
              <tr className="bg-surface/50">
                <td className="py-2.5 pr-4 font-medium font-serif">Month 48: Fully vested</td>
                <td className="py-2.5 px-4 font-mono text-right tabular-nums font-bold text-accent">
                  {formatUnits(sampleUnits)}
                </td>
                <td className="py-2.5 px-4 font-mono text-right tabular-nums font-bold">
                  {money(totalExerciseCost)}
                </td>
                <td className="py-2.5 px-4 font-mono text-right tabular-nums font-bold text-gain">
                  {money(totalGrossExitValue)}
                </td>
                <td className="py-2.5 pl-4 text-muted">
                  Full ownership potential; gross spread of +{money(totalGrossSpread)} at exit.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-[11px] font-mono text-muted flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2">
          <span>Standard 48-month straight-line schedule with 12-month cliff.</span>
          <span>Actual proceeds depend on exercise timing and tax character.</span>
        </div>
      </div>
    </section>
  );
}

export default GrantLifecycleTimeline;
