'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { SimulationResult, GrantType } from '@/types';
import { COMPLIANCE_DISCLAIMER } from '@/lib/calculations/taxes';

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
  return (
    <div className="space-y-6">
      {/* Net Proceeds Hero Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Estimated Financial Outcome
            </span>
            <h3 className="text-xl font-bold text-white">
              Net Estimated Proceeds
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            ESTIMATE
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-slate-950/80 p-5 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block mb-1">
              After Exercise Costs &amp; Estimated Taxes:
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
              ${result.estimatedNetProfit.toLocaleString()}
            </span>
          </div>
          <div className="text-right text-xs space-y-1">
            <div className="text-slate-400">
              Gross Exit Value: <strong className="text-white">${result.grossExitValue.toLocaleString()}</strong>
            </div>
            <div className="text-slate-400">
              Effective Tax Rate: <strong className="text-white">{result.effectiveTaxRate}%</strong>
            </div>
          </div>
        </div>

        {/* Financial Waterfall Breakdown */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Financial Breakdown
          </h4>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">
                Gross Proceeds ({result.unitsExercised.toLocaleString()} units @ ${result.assumedExitPrice}/sh)
              </span>
              <span className="font-mono font-bold text-white">${result.grossExitValue.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800 text-rose-400">
              <span>Less: Exercise Strike Cost ({result.unitsExercised.toLocaleString()} × ${result.strikePrice.toFixed(2)})</span>
              <span className="font-mono font-bold">-${result.exerciseCost.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800 text-white font-bold">
              <span>Gross Gain (Profit before taxes)</span>
              <span className="font-mono">${result.grossGain.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800 text-amber-400">
              <span>Less: Total Estimated Taxes (Federal, State &amp; AMT)</span>
              <span className="font-mono font-bold">-${result.totalEstimatedTax.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-2.5 bg-emerald-950/40 border border-emerald-800/60 px-3 rounded-lg text-emerald-300 font-extrabold text-sm">
              <span>Estimated Net Take-Home</span>
              <span className="font-mono text-emerald-400">${result.estimatedNetProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Liability Breakdown Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-6 space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Estimated Tax Liability Details</span>
          <span className="text-[11px] font-semibold text-slate-400">
            Type: {grantType} ({result.dispositionType === 'QUALIFYING' ? 'Qualifying' : result.dispositionType === 'DISQUALIFYING' ? 'Disqualifying' : 'Ordinary Compensation'})
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Box 1: At Exercise */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wide">
              Taxes Triggered at Exercise
            </span>

            {grantType === 'ISO' ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Regular Income Tax:</span>
                  <span className="font-mono font-bold text-emerald-400">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AMT Paper Spread:</span>
                  <span className="font-mono font-bold text-white">${result.exerciseTax.amtSpread.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1 text-amber-400 font-bold">
                  <span>Est. AMT Due Today:</span>
                  <span className="font-mono">${result.exerciseTax.estimatedAmtLiability.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 pt-1">
                  ISO paper spread is an AMT preference item. Generates Form 8801 AMT credit for future years.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ordinary Income Tax:</span>
                  <span className="font-mono font-bold text-white">${result.exerciseTax.ordinaryIncomeTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">State Income Tax:</span>
                  <span className="font-mono font-bold text-white">${result.exerciseTax.stateTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FICA / Medicare (2.35%):</span>
                  <span className="font-mono font-bold text-white">${result.exerciseTax.ficaTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1 text-white font-bold">
                  <span>Total At Exercise:</span>
                  <span className="font-mono text-amber-400">${result.exerciseTax.totalTaxAtExercise.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Box 2: At Sale / Exit */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wide">
              Taxes Triggered at Exit / Sale
            </span>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Federal Capital Gains:</span>
                <span className="font-mono font-bold text-white">${result.exitTax.capitalGainsTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">State Capital Gains:</span>
                <span className="font-mono font-bold text-white">${result.exitTax.stateCapitalGainsTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1 text-white font-bold">
                <span>Total At Exit:</span>
                <span className="font-mono text-amber-400">${result.exitTax.totalTaxAtExit.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1">
                Taxed at {holdingPeriod === 'LONG_TERM' ? 'preferential Long-Term Capital Gains rate' : 'ordinary short-term rates'}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Disclaimer Box */}
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-300">Disclaimer Notice:</span>
          <p className="leading-relaxed text-[11px] text-amber-200/90">
            {COMPLIANCE_DISCLAIMER}
          </p>
        </div>
      </div>
    </div>
  );
}

