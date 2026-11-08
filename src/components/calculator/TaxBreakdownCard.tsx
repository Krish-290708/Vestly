'use client';

import React from 'react';
import { SimulationResult, GrantType } from '@/types';
import { COMPLIANCE_DISCLAIMER } from '@/lib/calculations/taxes';
import { Badge, Callout } from '@/components/ui';
import { money, percent } from '@/lib/format';

interface TaxBreakdownCardProps {
  result: SimulationResult;
  grantType: GrantType;
  holdingPeriod: 'LONG_TERM' | 'SHORT_TERM';
}

export default function TaxBreakdownCard({
  result,
  grantType,
  holdingPeriod,
}: TaxBreakdownCardProps) {
  const isLoss = result.estimatedNetProfit < 0;

  return (
    <div className="space-y-6">
      {/* Waterfall Breakdown Box */}
      <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              Waterfall Breakdown
            </span>
            <h3 className="text-base font-medium text-[var(--ink)]">
              Gross to Net Proceeds
            </h3>
          </div>
          <Badge tone={isLoss ? 'loss' : 'gain'} dot>
            {isLoss ? 'Net loss' : 'Net gain'}
          </Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-[var(--rule)]">
            <span className="text-[var(--ink-muted)]">
              Gross proceeds ({result.unitsExercised.toLocaleString()} units × ${result.assumedExitPrice.toFixed(2)})
            </span>
            <span className="font-mono font-medium text-[var(--ink)]">
              {money(result.grossExitValue)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-[var(--rule)] text-[var(--loss)]">
            <span>
              Less: Strike cost ({result.unitsExercised.toLocaleString()} units × ${result.strikePrice.toFixed(2)})
            </span>
            <span className="font-mono font-medium">
              -{money(result.exerciseCost)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-[var(--rule)] font-medium text-[var(--ink)]">
            <span>Gross pre-tax gain</span>
            <span className="font-mono">
              {result.grossGain < 0 ? `-${money(Math.abs(result.grossGain))}` : money(result.grossGain)}
            </span>
          </div>

          {result.exerciseTax.totalTaxAtExercise > 0 && (
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--rule)] text-[var(--loss)]">
              <span>
                Less: Taxes at exercise ({grantType === 'ISO' ? 'Estimated AMT' : 'Ordinary income & payroll'})
              </span>
              <span className="font-mono font-medium">
                -{money(result.exerciseTax.totalTaxAtExercise)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-1.5 border-b border-[var(--rule)] text-[var(--loss)]">
            <span>
              Less: Taxes at sale ({holdingPeriod === 'LONG_TERM' ? 'Long-term' : 'Short-term'} capital gains)
            </span>
            <span className="font-mono font-medium">
              -{money(result.exitTax.totalTaxAtExit)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2.5 px-3 bg-[var(--surface-muted)] border border-[var(--rule)] font-mono font-semibold text-sm">
            <span className="font-sans font-medium text-[var(--ink)]">Net estimated proceeds</span>
            <span className={isLoss ? 'text-[var(--loss)]' : 'text-[var(--gain)]'}>
              {result.estimatedNetProfit < 0 
                ? `-${money(Math.abs(result.estimatedNetProfit))}` 
                : money(result.estimatedNetProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Tax Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* At Exercise */}
        <div className="border border-[var(--rule)] bg-[var(--card)] p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
              Taxes at Exercise
            </span>
            <Badge tone="neutral">{grantType}</Badge>
          </div>

          {grantType === 'ISO' ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between">
                <span className="text-[var(--ink-muted)]">Regular income tax:</span>
                <span className="font-mono text-[var(--ink)]">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-muted)]">AMT paper spread:</span>
                <span className="font-mono text-[var(--ink)]">{money(result.exerciseTax.amtSpread)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--rule)] pt-1 font-medium">
                <span>Estimated AMT due:</span>
                <span className="font-mono text-[var(--ink)]">{money(result.exerciseTax.estimatedAmtLiability)}</span>
              </div>
              <p className="text-[11px] text-[var(--ink-muted)] pt-1 leading-normal">
                Spread is an AMT preference item. May generate Form 8801 minimum tax credit.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between">
                <span className="text-[var(--ink-muted)]">Federal income tax:</span>
                <span className="font-mono text-[var(--ink)]">{money(result.exerciseTax.ordinaryIncomeTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-muted)]">State income tax:</span>
                <span className="font-mono text-[var(--ink)]">{money(result.exerciseTax.stateTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-muted)]">FICA / Medicare:</span>
                <span className="font-mono text-[var(--ink)]">{money(result.exerciseTax.ficaTax)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--rule)] pt-1 font-medium">
                <span>Total at exercise:</span>
                <span className="font-mono text-[var(--ink)]">{money(result.exerciseTax.totalTaxAtExercise)}</span>
              </div>
            </div>
          )}
        </div>

        {/* At Sale / Exit */}
        <div className="border border-[var(--rule)] bg-[var(--card)] p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
              Taxes at Sale
            </span>
            <Badge tone="neutral">
              {holdingPeriod === 'LONG_TERM' ? 'Long-term' : 'Short-term'}
            </Badge>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between">
              <span className="text-[var(--ink-muted)]">Federal capital gains:</span>
              <span className="font-mono text-[var(--ink)]">{money(result.exitTax.capitalGainsTax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-muted)]">State capital gains:</span>
              <span className="font-mono text-[var(--ink)]">{money(result.exitTax.stateCapitalGainsTax)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--rule)] pt-1 font-medium">
              <span>Total at sale:</span>
              <span className="font-mono text-[var(--ink)]">{money(result.exitTax.totalTaxAtExit)}</span>
            </div>
            <div className="flex justify-between pt-1 text-[11px] text-[var(--ink-muted)]">
              <span>Effective tax rate:</span>
              <span className="font-mono text-[var(--ink)]">{percent(result.effectiveTaxRate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Callout */}
      <Callout variant="note">
        {COMPLIANCE_DISCLAIMER}
      </Callout>
    </div>
  );
}
