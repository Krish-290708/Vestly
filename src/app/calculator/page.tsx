'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Calculator, 
  DollarSign, 
  HelpCircle, 
  Info, 
  ShieldAlert, 
  TrendingUp, 
  ArrowRight, 
  Check, 
  Sparkles,
  PieChart as PieIcon,
  Layers
} from 'lucide-react';
import { calculateEquityOutcome, COMPLIANCE_DISCLAIMER } from '@/lib/calculations/taxes';
import { GrantType, TaxBracketSettings } from '@/types';

function CalculatorContent() {
  const searchParams = useSearchParams();
  const grantIdParam = searchParams.get('grantId');

  const [grants, setGrants] = useState<any[]>([]);
  const [selectedGrantId, setSelectedGrantId] = useState<string>('custom');

  // Interactive Inputs
  const [grantType, setGrantType] = useState<GrantType>('ISO');
  const [unitsToExercise, setUnitsToExercise] = useState<number>(5000);
  const [strikePrice, setStrikePrice] = useState<number>(5.00);
  const [currentFmv, setCurrentFmv] = useState<number>(25.00);
  const [assumedExitPrice, setAssumedExitPrice] = useState<number>(60.00);
  const [holdingPeriod, setHoldingPeriod] = useState<'LONG_TERM' | 'SHORT_TERM'>('LONG_TERM');

  // Tax Assumptions
  const [taxSettings, setTaxSettings] = useState<TaxBracketSettings>({
    federalTaxRate: 0.32,
    stateTaxRate: 0.093, // California median
    capitalGainsRate: 0.20,
    stateCapitalGainsRate: 0.093,
    ficaRate: 0.0235,
    filingStatus: 'SINGLE',
  });

  // State tax presets
  const statePresets = [
    { label: 'California (9.3%)', rate: 0.093 },
    { label: 'New York (6.85%)', rate: 0.0685 },
    { label: 'Washington / Texas / Florida (0%)', rate: 0.00 },
    { label: 'Massachusetts (5.0%)', rate: 0.05 },
  ];

  useEffect(() => {
    fetch('/api/grants')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.grants) {
          setGrants(data.grants);
          if (grantIdParam) {
            const found = data.grants.find((g: any) => g.id === grantIdParam);
            if (found) {
              selectGrant(found);
            }
          } else if (data.grants.length > 0) {
            selectGrant(data.grants[0]);
          }
        }
      })
      .catch(() => {});
  }, [grantIdParam]);

  const selectGrant = (grant: any) => {
    setSelectedGrantId(grant.id);
    setGrantType(grant.grantType);
    setUnitsToExercise(grant.vestedUnits || grant.unitsGranted);
    setStrikePrice(grant.strikePrice);
    setCurrentFmv(grant.company?.latestFmvPerShare || 25.00);
    setAssumedExitPrice(Math.round((grant.company?.latestFmvPerShare || 25.00) * 2.5));
  };

  // Run calculation live
  const result = calculateEquityOutcome({
    unitsToExercise,
    assumedExitPrice,
    currentFmv,
    strikePrice,
    grantType,
    holdingPeriod,
    taxSettings,
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Calculator className="w-7 h-7 text-emerald-400" />
          Interactive ESOP & Tax Calculator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Model gross returns, Alternative Minimum Tax (AMT) preference liability, and net proceeds across ISO, NSO, and RSU grants
        </p>
      </div>

      {/* Grant Selector Pill Bar */}
      {grants.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
            Load from Grant:
          </span>
          {grants.map(g => (
            <button
              key={g.id}
              onClick={() => selectGrant(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedGrantId === g.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>{g.company?.name} ({g.grantType})</span>
              <span className="text-[10px] opacity-70">{(g.vestedUnits || g.unitsGranted).toLocaleString()} units</span>
            </button>
          ))}
          <button
            onClick={() => setSelectedGrantId('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedGrantId === 'custom'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            Custom Numbers
          </button>
        </div>
      )}

      {/* Main Grid: Inputs (Left) and Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-6 space-y-5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
              1. Exercise & Exit Assumptions
            </h3>

            {/* Grant Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Equity Instrument
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ISO', 'NSO', 'RSU'] as GrantType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setGrantType(type);
                      if (type === 'RSU') setStrikePrice(0);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      grantType === type
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-xs'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Units to Exercise */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Number of Units to Exercise
                </label>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {unitsToExercise.toLocaleString()} shares
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="50000"
                step="100"
                value={unitsToExercise}
                onChange={(e) => setUnitsToExercise(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Strike Price & FMV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Strike Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled={grantType === 'RSU'}
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-900 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current FMV ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={currentFmv}
                  onChange={(e) => setCurrentFmv(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Assumed Exit Price */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Assumed Exit / Sale Price ($)
                </label>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  ${assumedExitPrice.toFixed(2)}/share
                </span>
              </div>
              <input
                type="range"
                min={strikePrice}
                max={Math.max(100, currentFmv * 5)}
                step="1"
                value={assumedExitPrice}
                onChange={(e) => setAssumedExitPrice(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Holding Period Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Holding Period at Sale
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHoldingPeriod('LONG_TERM')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-left transition-all ${
                    holdingPeriod === 'LONG_TERM'
                      ? 'bg-slate-800 text-emerald-400 border-slate-600 shadow-xs'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-805'
                  }`}
                >
                  <div>Long-Term (&gt;1 Year)</div>
                  <div className="text-[10px] font-normal opacity-80">Qualifying / LTCG rates</div>
                </button>

                <button
                  type="button"
                  onClick={() => setHoldingPeriod('SHORT_TERM')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-left transition-all ${
                    holdingPeriod === 'SHORT_TERM'
                      ? 'bg-slate-800 text-emerald-400 border-slate-600 shadow-xs'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-805'
                  }`}
                >
                  <div>Short-Term (≤1 Year)</div>
                  <div className="text-[10px] font-normal opacity-80">Ordinary income rates</div>
                </button>
              </div>
            </div>
          </div>

          {/* Tax Bracket Controls */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
              2. Tax Profile & State Assumptions
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Federal Income Bracket
                </label>
                <select
                  value={taxSettings.federalTaxRate}
                  onChange={(e) => setTaxSettings({ ...taxSettings, federalTaxRate: parseFloat(e.target.value) })}
                  className="w-full px-2.5 py-2 text-xs border border-slate-700 rounded-lg bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={0.24}>24% (Middle)</option>
                  <option value={0.32}>32% (Standard Tech)</option>
                  <option value={0.35}>35% (High Earner)</option>
                  <option value={0.37}>37% (Top Bracket)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Filing Status (for AMT)
                </label>
                <select
                  value={taxSettings.filingStatus}
                  onChange={(e) => setTaxSettings({ ...taxSettings, filingStatus: e.target.value as any })}
                  className="w-full px-2.5 py-2 text-xs border border-slate-700 rounded-lg bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="SINGLE">Single Filer</option>
                  <option value="MARRIED_JOINT">Married Filing Jointly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                State Income Tax Rate
              </label>
              <select
                value={taxSettings.stateTaxRate}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value);
                  setTaxSettings({ ...taxSettings, stateTaxRate: rate, stateCapitalGainsRate: rate });
                }}
                className="w-full px-2.5 py-2 text-xs border border-slate-700 rounded-lg bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-2"
              >
                {statePresets.map(p => (
                  <option key={p.label} value={p.rate}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
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
                <span className="text-xs text-slate-400 block mb-1">After Exercise Costs & Estimated Taxes:</span>
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
                  <span className="text-slate-400">Gross Proceeds ({result.unitsExercised.toLocaleString()} units @ ${result.assumedExitPrice}/sh)</span>
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
                  <span>Less: Total Estimated Taxes (Federal, State & AMT)</span>
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

      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading calculator...</div>}>
      <CalculatorContent />
    </React.Suspense>
  );
}

