'use client';

import React from 'react';
import { Figure } from '@/components/ui/Figure';
import { money } from '@/lib/format';

export interface GrantMetricItem {
  id: string;
  grantIdentifier: string;
  grantType: string;
  unitsGranted: number;
  vestedUnits: number;
  strikePrice: number;
  currentFmv: number;
  companyName: string;
}

interface FigureStripProps {
  grants: GrantMetricItem[];
  fmvMultiplier: number;
  onMultiplierChange: (mult: number) => void;
}

export function FigureStrip({
  grants,
  fmvMultiplier,
  onMultiplierChange,
}: FigureStripProps) {
  const multipliers = [0.5, 1, 2, 5];

  // Aggregated calculations based on current multiplier
  let totalVestedValue = 0;
  let totalExerciseCost = 0;
  const underwaterGrants: string[] = [];

  grants.forEach((g) => {
    const effectiveFmv = g.currentFmv * fmvMultiplier;
    const vestedVal = g.vestedUnits * effectiveFmv;
    const exCost = g.grantType === 'RSU' ? 0 : g.vestedUnits * g.strikePrice;

    totalVestedValue += vestedVal;
    totalExerciseCost += exCost;

    // Check if underwater (strike price exceeds effective share price)
    if (g.grantType !== 'RSU' && g.strikePrice > effectiveFmv && g.vestedUnits > 0) {
      underwaterGrants.push(`${g.companyName} (${g.grantIdentifier})`);
    }
  });

  // Bug 3 Fix: NEVER clamp netEstimatedEquity to 0!
  const netEstimatedEquity = totalVestedValue - totalExerciseCost;
  const isNetNegative = netEstimatedEquity < 0;

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      {/* Top Bar: Multiplier controls labelled as assumption */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-rule pb-3">
        <div className="space-y-0.5">
          <span className="font-serif font-bold text-ink block">
            Portfolio valuation summary
          </span>
          <span className="text-[11px] text-muted font-sans">
            Figures update based on hypothetical share price multiple.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
            Share price assumption:
          </span>
          <div
            role="group"
            aria-label="Hypothetical FMV multiplier assumption"
            className="inline-flex rounded-xs border border-rule bg-sunk/40 p-0.5"
          >
            {multipliers.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onMultiplierChange(m)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-xs transition-colors ${
                  fmvMultiplier === m
                    ? 'bg-surface text-ink shadow-xs border border-rule font-bold'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Primary Figures Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Figure 1: Estimated Vested Value */}
        <div className="border border-rule rounded-xs bg-surface p-4 sm:p-5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
            Estimated vested value
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            <Figure
              value={money(totalVestedValue)}
              marker="[1]"
              calculation={{
                title: 'Estimated vested value calculation',
                asOfDate: todayStr,
                inputs: [
                  {
                    name: 'Vested units across grants',
                    value: grants.reduce((s, g) => s + g.vestedUnits, 0).toLocaleString(),
                  },
                  {
                    name: 'Hypothetical share price multiplier',
                    value: `${fmvMultiplier}x`,
                  },
                ],
                steps: [
                  'For each grant: Vested units × (Latest 409A / FMV × Multiplier)',
                  'Sum of all active grant values as of today',
                ],
                note: 'Private company valuations represent latest board 409A or user estimates. Not guaranteed liquidity.',
              }}
            />
          </div>
          <span className="text-[11px] font-mono text-muted block pt-1">
            {fmvMultiplier !== 1 ? `Modeled @ ${fmvMultiplier}x base FMV` : 'At current 409A valuation'}
          </span>
        </div>

        {/* Figure 2: Exercise Cost */}
        <div className="border border-rule rounded-xs bg-surface p-4 sm:p-5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
            Cost to exercise vested options
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            <Figure
              value={money(totalExerciseCost)}
              marker="[2]"
              calculation={{
                title: 'Exercise cost calculation',
                asOfDate: todayStr,
                inputs: [
                  {
                    name: 'Vested options eligible to exercise',
                    value: grants
                      .filter((g) => g.grantType !== 'RSU')
                      .reduce((s, g) => s + g.vestedUnits, 0)
                      .toLocaleString(),
                  },
                ],
                steps: [
                  'For each option grant: Vested options × Strike price',
                  'RSU grants require $0 purchase cost',
                ],
                note: 'Cash required to purchase vested options. Does not include potential AMT or withholding taxes.',
              }}
            />
          </div>
          <span className="text-[11px] font-mono text-muted block pt-1">
            Cash outlay to buy vested shares
          </span>
        </div>

        {/* Figure 3: Estimated Net Before Tax (Unclamped Negatives) */}
        <div className="border border-rule rounded-xs bg-surface p-4 sm:p-5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
            Estimated net before tax
          </span>
          <div className={`font-serif text-2xl sm:text-3xl font-bold ${isNetNegative ? 'text-loss' : 'text-gain'}`}>
            <Figure
              value={
                isNetNegative
                  ? `-${money(Math.abs(netEstimatedEquity))}`
                  : `+${money(netEstimatedEquity)}`
              }
              marker="[3]"
              calculation={{
                title: 'Pre-tax net equity calculation',
                asOfDate: todayStr,
                inputs: [
                  {
                    name: 'Gross vested value',
                    value: money(totalVestedValue),
                  },
                  {
                    name: 'Total exercise cost',
                    value: money(totalExerciseCost),
                  },
                ],
                steps: [
                  `${money(totalVestedValue)} gross value - ${money(totalExerciseCost)} exercise cost = ${
                    isNetNegative
                      ? `-${money(Math.abs(netEstimatedEquity))}`
                      : money(netEstimatedEquity)
                  }`,
                ],
                note: 'Shows pre-tax gain if vested shares were exercised and sold today. Negative numbers indicate options are underwater.',
              }}
            />
          </div>
          <span className="text-[11px] font-mono text-muted block pt-1">
            {isNetNegative ? (
              <span className="text-loss font-medium">
                Underwater options (strike &gt; FMV)
              </span>
            ) : (
              'Gross value minus exercise cost'
            )}
          </span>
        </div>
      </div>

      {/* Underwater alert disclosure note if any grants are underwater */}
      {underwaterGrants.length > 0 && (
        <div
          role="note"
          className="p-3 border border-loss/30 rounded-xs bg-loss/5 text-xs text-loss font-sans flex items-start gap-2"
        >
          <span className="font-semibold shrink-0">Underwater options note:</span>
          <span>
            Strike price currently exceeds fair market value for {underwaterGrants.join(', ')}.
            Exercising these options would result in an immediate paper loss.
          </span>
        </div>
      )}
    </div>
  );
}

export default FigureStrip;
