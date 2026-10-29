'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import { date as formatDate, units as formatUnits, money } from '@/lib/format';

interface GrantsGanttViewProps {
  grants: any[];
}

export default function GrantsGanttView({ grants }: GrantsGanttViewProps) {
  const { minTime, maxTime, totalDuration, todayTime } = useMemo(() => {
    const now = Date.now();
    if (grants.length === 0) {
      return { minTime: now - 365 * 24 * 3600 * 1000, maxTime: now + 3 * 365 * 24 * 3600 * 1000, totalDuration: 4 * 365 * 24 * 3600 * 1000, todayTime: now };
    }

    let min = Infinity;
    let max = -Infinity;

    grants.forEach((g) => {
      const gDate = new Date(g.grantDate || g.vestingStartDate).getTime();
      const expDate = new Date(g.expirationDate).getTime();
      if (!isNaN(gDate) && gDate < min) min = gDate;
      if (!isNaN(expDate) && expDate > max) max = expDate;
    });

    if (min === Infinity) min = now - 365 * 24 * 3600 * 1000;
    if (max === -Infinity || max <= min) max = min + 10 * 365.25 * 24 * 3600 * 1000;

    // Pad slightly
    const padding = (max - min) * 0.05;
    const finalMin = min - padding;
    const finalMax = max + padding;

    return {
      minTime: finalMin,
      maxTime: finalMax,
      totalDuration: finalMax - finalMin,
      todayTime: now,
    };
  }, [grants]);

  const todayPercent = useMemo(() => {
    if (todayTime < minTime) return 0;
    if (todayTime > maxTime) return 100;
    return ((todayTime - minTime) / totalDuration) * 100;
  }, [todayTime, minTime, maxTime, totalDuration]);

  // Year tick markers
  const yearTicks = useMemo(() => {
    const ticks: { year: number; percent: number }[] = [];
    const startYear = new Date(minTime).getFullYear();
    const endYear = new Date(maxTime).getFullYear();

    for (let yr = startYear; yr <= endYear; yr++) {
      const t = new Date(yr, 0, 1).getTime();
      if (t >= minTime && t <= maxTime) {
        ticks.push({
          year: yr,
          percent: ((t - minTime) / totalDuration) * 100,
        });
      }
    }
    return ticks;
  }, [minTime, maxTime, totalDuration]);

  if (grants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted border-b border-rule pb-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-accent/70 rounded-xs border border-accent"></span>
            <span>Vested duration</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-sunk rounded-xs border border-rule"></span>
            <span>Unvested & remaining lifespan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-loss"></span>
            <span>Cliff milestone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-0.5 h-3 bg-accent"></span>
            <span>Today</span>
          </div>
        </div>
        <span>Time horizon: {new Date(minTime).getFullYear()} – {new Date(maxTime).getFullYear()}</span>
      </div>

      {/* Gantt Canvas */}
      <div className="relative border border-rule rounded-sm bg-surface p-4 overflow-x-auto min-w-[650px]">
        {/* Year grid columns */}
        <div className="absolute inset-0 pointer-events-none">
          {yearTicks.map((tick) => (
            <div
              key={tick.year}
              className="absolute top-0 bottom-0 border-l border-rule/50"
              style={{ left: `${tick.percent}%` }}
            >
              <span className="absolute top-1 left-1 font-mono text-[10px] text-muted select-none">
                {tick.year}
              </span>
            </div>
          ))}

          {/* Today line */}
          {todayPercent >= 0 && todayPercent <= 100 && (
            <div
              className="absolute top-0 bottom-0 border-l-2 border-accent z-10"
              style={{ left: `${todayPercent}%` }}
            >
              <span className="absolute bottom-1 -translate-x-1/2 bg-accent text-accent-contrast font-mono text-[9px] px-1 py-0.5 rounded-xs select-none">
                Today
              </span>
            </div>
          )}
        </div>

        {/* Grant Rows */}
        <div className="relative z-0 space-y-5 pt-7 pb-4">
          {grants.map((g) => {
            const vStart = new Date(g.vestingStartDate || g.grantDate).getTime();
            const exp = new Date(g.expirationDate).getTime();
            const cliffMonths = g.cliffMonths || 0;
            const cliffDate = new Date(vStart + cliffMonths * 30.44 * 24 * 3600 * 1000).getTime();

            const startPct = Math.max(0, Math.min(100, ((vStart - minTime) / totalDuration) * 100));
            const endPct = Math.max(0, Math.min(100, ((exp - minTime) / totalDuration) * 100));
            const widthPct = Math.max(1, endPct - startPct);

            const pctVested = g.percentVested || (g.unitsGranted > 0 ? (g.vestedUnits / g.unitsGranted) * 100 : 0);
            const vestedWidthPct = widthPct * (Math.min(100, pctVested) / 100);

            const cliffPct = Math.max(0, Math.min(100, ((cliffDate - minTime) / totalDuration) * 100));

            return (
              <div key={g.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/grants/${g.id}`}
                      className="font-medium text-ink hover:underline focus:outline-none"
                    >
                      {g.grantIdentifier}
                    </Link>
                    <span className="text-muted">({g.company?.name || 'Company'})</span>
                    <Badge tone="neutral">
                      {g.grantType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-muted text-[11px]">
                    <span>
                      {formatUnits(g.vestedUnits || 0)} / {formatUnits(g.unitsGranted)} units ({Math.round(pctVested)}%)
                    </span>
                    <span>Expires {formatDate(g.expirationDate)}</span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="relative h-6 bg-sunk rounded-xs border border-rule overflow-hidden">
                  {/* Full span */}
                  <div
                    className="absolute top-1 bottom-1 bg-surface border border-rule/80 rounded-xs"
                    style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                  >
                    {/* Vested segment */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-accent/30 border-r border-accent"
                      style={{ width: `${Math.min(100, (vestedWidthPct / widthPct) * 100)}%` }}
                    />
                  </div>

                  {/* Cliff marker */}
                  {cliffMonths > 0 && cliffPct >= startPct && cliffPct <= endPct && (
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-loss z-20 cursor-pointer"
                      style={{ left: `${cliffPct}%` }}
                      title={`Cliff date: ${formatDate(new Date(cliffDate))} (${cliffMonths} mo)`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
