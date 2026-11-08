'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader, Badge, Button, Callout, Field } from '@/components/ui';
import { units, percent } from '@/lib/format';
import {
  projectPoolRunway,
  COMPANY_POOL_PRESETS,
  CompanyPoolPreset,
} from '@/lib/calculations/pool';

export default function PoolPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('stripe');

  // Input states initialized from Stripe preset
  const defaultPreset = COMPANY_POOL_PRESETS[0];
  const [authorizedShares, setAuthorizedShares] = useState<number>(defaultPreset.totalAuthorizedShares);
  const [poolShares, setPoolShares] = useState<number>(defaultPreset.totalPoolShares);
  const [grantedShares, setGrantedShares] = useState<number>(defaultPreset.grantedShares);
  const [burnRate, setBurnRate] = useState<number>(defaultPreset.burnRatePerQuarter);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') return;
    const found = COMPANY_POOL_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setAuthorizedShares(found.totalAuthorizedShares);
      setPoolShares(found.totalPoolShares);
      setGrantedShares(found.grantedShares);
      setBurnRate(found.burnRatePerQuarter);
    }
  };

  const activePreset = useMemo(() => {
    return COMPANY_POOL_PRESETS.find((p) => p.id === selectedPresetId);
  }, [selectedPresetId]);

  const runwayResult = useMemo(() => {
    return projectPoolRunway({
      totalAuthorizedShares: authorizedShares,
      totalPoolShares: poolShares,
      grantedShares,
      burnRatePerQuarter: burnRate,
    });
  }, [authorizedShares, poolShares, grantedShares, burnRate]);

  const departments = activePreset?.departments || [
    { dept: 'Engineering and research', units: Math.round(grantedShares * 0.55), percent: 55 },
    { dept: 'Product and design', units: Math.round(grantedShares * 0.20), percent: 20 },
    { dept: 'Sales and marketing', units: Math.round(grantedShares * 0.15), percent: 15 },
    { dept: 'Operations and administrative', units: Math.round(grantedShares * 0.10), percent: 10 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="Model"
        title="Option pool"
        contextSentence="Option pool sizing, equity overhang, department allocation, and burn runway modeling."
        actions={
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted">Preset:</span>
            <select
              aria-label="Select company preset"
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="px-2.5 py-1.5 border border-rule rounded-sm bg-surface text-ink text-xs focus:ring-1 focus:ring-accent focus:outline-none"
            >
              {COMPANY_POOL_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.valuationFormatted})
                </option>
              ))}
              <option value="custom">Custom parameters</option>
            </select>
          </div>
        }
      />

      {/* Runway warning callout if critical */}
      {runwayResult.isRunwayCritical && (
        <Callout variant="warn">
          Pool runway is below 4 quarters (~{runwayResult.runwayMonths} months). At current quarterly grant velocity, the pool will require Board expansion of approximately {units(runwayResult.recommendedExpansionShares)} shares to maintain an 8-quarter buffer.
        </Callout>
      )}

      {/* Hero Figure Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 border border-rule rounded-sm bg-surface text-xs">
        <div>
          <span className="text-muted block text-[11px]">Authorized ESOP pool</span>
          <div className="font-mono text-xl font-bold text-ink tabular-nums mt-0.5">
            {units(runwayResult.totalPoolShares)}
          </div>
          <span className="text-[11px] text-muted block mt-1">
            {runwayResult.poolPercent}% of fully diluted shares
          </span>
        </div>

        <div>
          <span className="text-muted block text-[11px]">Granted / allocated shares</span>
          <div className="font-mono text-xl font-bold text-ink tabular-nums mt-0.5">
            {units(runwayResult.grantedShares)}
          </div>
          <span className="text-[11px] text-muted block mt-1">
            {runwayResult.grantedPercentOfPool}% of pool granted ({runwayResult.overhangPercent}% overhang)
          </span>
        </div>

        <div>
          <span className="text-muted block text-[11px]">Unallocated reserve</span>
          <div className="font-mono text-xl font-bold text-ink tabular-nums mt-0.5">
            {units(runwayResult.unallocatedReserve)}
          </div>
          <span className="text-[11px] text-muted block mt-1">
            {runwayResult.unallocatedPercentOfPool}% of pool available for new grants
          </span>
        </div>

        <div>
          <span className="text-muted block text-[11px]">Projected pool runway</span>
          <div className="font-mono text-xl font-bold tabular-nums mt-0.5 flex items-center gap-2">
            <span className={runwayResult.isRunwayCritical ? 'text-loss' : 'text-gain'}>
              ~{runwayResult.runwayQuarters} Qtrs
            </span>
            <Badge tone={runwayResult.isRunwayCritical ? 'loss' : 'gain'}>
              {runwayResult.isRunwayCritical ? 'Low reserve' : 'Healthy buffer'}
            </Badge>
          </div>
          <span className="text-[11px] text-muted block mt-1">
            At {units(runwayResult.burnRatePerQuarter)} shares/quarter burn
          </span>
        </div>
      </div>

      {/* Main Two-Panel: Parameters (Left) & Allocation breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parameters (5 cols) */}
        <section className="lg:col-span-5 border border-rule rounded-sm bg-surface p-5 space-y-4">
          <div className="border-b border-rule pb-2">
            <h2 className="font-serif text-sm font-semibold text-ink">
              Cap table parameters
            </h2>
            <p className="text-[11px] text-muted">
              Adjust parameters to model hiring expansion or refreshed pool sizing.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <Field label="Total authorized company shares">
              <input
                type="number"
                value={authorizedShares}
                onChange={(e) => {
                  setAuthorizedShares(Number(e.target.value) || 0);
                  setSelectedPresetId('custom');
                }}
                className="w-full px-3 py-1.5 bg-surface text-ink border border-rule rounded-sm text-xs font-mono tabular-nums focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </Field>

            <Field label="Total authorized option pool shares">
              <input
                type="number"
                value={poolShares}
                onChange={(e) => {
                  setPoolShares(Number(e.target.value) || 0);
                  setSelectedPresetId('custom');
                }}
                className="w-full px-3 py-1.5 bg-surface text-ink border border-rule rounded-sm text-xs font-mono tabular-nums focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </Field>

            <Field label="Already granted / committed shares">
              <input
                type="number"
                value={grantedShares}
                onChange={(e) => {
                  setGrantedShares(Number(e.target.value) || 0);
                  setSelectedPresetId('custom');
                }}
                className="w-full px-3 py-1.5 bg-surface text-ink border border-rule rounded-sm text-xs font-mono tabular-nums focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </Field>

            <Field label="Quarterly hiring burn rate (shares/quarter)">
              <input
                type="number"
                value={burnRate}
                onChange={(e) => {
                  setBurnRate(Number(e.target.value) || 0);
                  setSelectedPresetId('custom');
                }}
                className="w-full px-3 py-1.5 bg-surface text-ink border border-rule rounded-sm text-xs font-mono tabular-nums focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </Field>
          </div>

          <div className="p-3 border border-rule/60 rounded-sm bg-sunk/40 text-[11px] text-muted space-y-1">
            <strong>Venture benchmark:</strong> Seed/Series A pools typically range from 15% to 20%; Series B/C pools compress to 10% to 15% through unallocated reserve dilution.
          </div>
        </section>

        {/* Allocation breakdown (7 cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="border border-rule rounded-sm bg-surface p-5 space-y-4">
            <h2 className="font-serif text-sm font-semibold text-ink">
              Pool allocation distribution
            </h2>

            {/* Proportion Bar */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-muted text-[11px]">
                <span>Allocated: {runwayResult.grantedPercentOfPool}%</span>
                <span>Unallocated reserve: {runwayResult.unallocatedPercentOfPool}%</span>
              </div>
              <div className="w-full h-3 bg-sunk rounded-sm overflow-hidden flex border border-rule">
                <div
                  className="bg-accent h-full transition-all"
                  style={{ width: `${Math.min(100, runwayResult.grantedPercentOfPool)}%` }}
                  title="Granted"
                />
                <div
                  className="bg-rule h-full transition-all"
                  style={{ width: `${Math.max(0, 100 - runwayResult.grantedPercentOfPool)}%` }}
                  title="Reserve"
                />
              </div>
            </div>

            {/* Department breakdown table */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-2">
                Departmental allocation
              </span>
              <div className="border border-rule rounded-sm overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-sunk border-b border-rule">
                    <tr>
                      <th className="p-2.5 font-semibold text-muted">Department</th>
                      <th className="p-2.5 font-semibold text-muted text-right">Shares granted</th>
                      <th className="p-2.5 font-semibold text-muted text-right">Share of grants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule">
                    {departments.map((dept) => (
                      <tr key={dept.dept} className="hover:bg-sunk/30 transition-colors">
                        <td className="p-2.5 font-medium text-ink">{dept.dept}</td>
                        <td className="p-2.5 font-mono text-right tabular-nums text-ink">
                          {units(dept.units)}
                        </td>
                        <td className="p-2.5 font-mono text-right tabular-nums text-muted font-semibold">
                          {dept.percent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 8-Quarter Runway Depletion Trajectory Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-sm font-semibold text-ink">
            8-quarter pool depletion trajectory
          </h2>
          <span className="text-[11px] text-muted">
            Projected reserve drawdown at {units(runwayResult.burnRatePerQuarter)} shares/quarter
          </span>
        </div>

        <div className="border border-rule rounded-sm overflow-hidden bg-surface">
          <table className="w-full text-xs text-left">
            <thead className="bg-sunk border-b border-rule">
              <tr>
                <th className="p-3 font-semibold text-muted">Quarter</th>
                <th className="p-3 font-semibold text-muted text-right">Starting reserve</th>
                <th className="p-3 font-semibold text-muted text-right">Quarterly burn</th>
                <th className="p-3 font-semibold text-muted text-right">Ending reserve</th>
                <th className="p-3 font-semibold text-muted text-right">Cumulative burn</th>
                <th className="p-3 font-semibold text-muted text-right">Pool remaining %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {runwayResult.projections.map((p) => {
                const isZero = p.endingReserve === 0;
                return (
                  <tr
                    key={p.quarter}
                    className={`hover:bg-sunk/30 transition-colors ${isZero ? 'bg-loss/5' : ''}`}
                  >
                    <td className="p-3 font-medium text-ink">{p.quarterLabel}</td>
                    <td className="p-3 font-mono text-right tabular-nums text-ink">{units(p.startingReserve)}</td>
                    <td className="p-3 font-mono text-right tabular-nums text-muted">{units(p.sharesBurned)}</td>
                    <td className={`p-3 font-mono text-right tabular-nums font-semibold ${isZero ? 'text-loss' : 'text-ink'}`}>
                      {units(p.endingReserve)}
                    </td>
                    <td className="p-3 font-mono text-right tabular-nums text-muted">{units(p.cumulativeBurn)}</td>
                    <td className="p-3 font-mono text-right tabular-nums">
                      {isZero ? (
                        <span className="text-loss font-semibold">Exhausted</span>
                      ) : (
                        <span className="text-ink">{p.percentRemaining}%</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
