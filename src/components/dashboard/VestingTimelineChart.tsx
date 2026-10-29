'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { chartTokens, chartAxisStyle, seriesColors } from '@/components/charts/theme';
import { money, units as formatUnits } from '@/lib/format';

export interface GrantForTimeline {
  id: string;
  grantIdentifier: string;
  companyName: string;
  unitsGranted: number;
  strikePrice: number;
  currentFmv: number;
  cliffDate?: string | null;
  vestingEvents?: Array<{
    vestDate: string;
    unitsVested: number;
    cumulativeVested: number;
  }>;
}

interface VestingTimelineChartProps {
  grants: GrantForTimeline[];
  fmvMultiplier?: number;
}

export function VestingTimelineChart({
  grants,
  fmvMultiplier = 1,
}: VestingTimelineChartProps) {
  const [horizon, setHorizon] = useState<'12M' | 'ALL'>('ALL');

  const now = useMemo(() => new Date(), []);
  const todayDateStr = now.toISOString().split('T')[0];
  const twelveMonthsFromNow = useMemo(() => {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }, [now]);

  // Aggregate monthly timeline
  const { chartData, todaySummary, cliffDates } = useMemo(() => {
    // Collect all event dates
    const allDatesSet = new Set<string>();
    const cliffs: Array<{ date: string; grantName: string }> = [];

    grants.forEach((g) => {
      if (g.cliffDate) {
        cliffs.push({
          date: new Date(g.cliffDate).toISOString().split('T')[0],
          grantName: `${g.companyName} (${g.grantIdentifier})`,
        });
      }
      (g.vestingEvents || []).forEach((e) => {
        allDatesSet.add(new Date(e.vestDate).toISOString().split('T')[0]);
      });
    });

    // Also include today's date
    allDatesSet.add(todayDateStr);

    const sortedDates = Array.from(allDatesSet).sort();

    // Calculate cumulative vested by grant for each date
    const data = sortedDates.map((dateStr) => {
      const pointDate = new Date(dateStr);
      const point: Record<string, any> = {
        date: dateStr,
        formattedDate: pointDate.toLocaleDateString('en-GB', {
          month: 'short',
          year: '2-digit',
        }),
        totalVested: 0,
        totalValue: 0,
      };

      grants.forEach((g) => {
        let vestedForGrant = 0;
        (g.vestingEvents || []).forEach((e) => {
          if (new Date(e.vestDate) <= pointDate) {
            vestedForGrant = e.cumulativeVested;
          }
        });

        point[g.id] = vestedForGrant;
        point.totalVested += vestedForGrant;
        point.totalValue += vestedForGrant * (g.currentFmv * fmvMultiplier);
      });

      return point;
    });

    // Filter by horizon if 12M
    const filteredData =
      horizon === '12M'
        ? data.filter((d) => {
            const pDate = new Date(d.date);
            return pDate >= now && pDate <= twelveMonthsFromNow;
          })
        : data;

    // Summary calculation
    const currentPoint = data.find((d) => d.date >= todayDateStr) || data[data.length - 1];
    const endPoint = filteredData[filteredData.length - 1] || currentPoint;

    const unitsGained = endPoint
      ? Math.max(0, endPoint.totalVested - (currentPoint?.totalVested || 0))
      : 0;
    const valueGained = endPoint
      ? Math.max(0, endPoint.totalValue - (currentPoint?.totalValue || 0))
      : 0;

    return {
      chartData: filteredData,
      todaySummary: {
        currentVested: currentPoint?.totalVested || 0,
        unitsGained,
        valueGained,
      },
      cliffDates: cliffs,
    };
  }, [grants, horizon, now, todayDateStr, twelveMonthsFromNow, fmvMultiplier]);

  const totalGranted = grants.reduce((s, g) => s + g.unitsGranted, 0);

  return (
    <div className="border border-rule rounded-xs bg-surface p-5 space-y-4">
      {/* Chart Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-rule pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">
            Vesting accumulation
          </span>
          <h2 className="font-serif text-base font-bold text-ink">
            Cumulative vesting timeline
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-muted">
            Target: {formatUnits(totalGranted)} units
          </span>

          {/* Horizon toggle: 12 Months vs All */}
          <div
            role="group"
            aria-label="Chart time horizon"
            className="inline-flex rounded-xs border border-rule bg-sunk/40 p-0.5"
          >
            <button
              type="button"
              onClick={() => setHorizon('12M')}
              className={`px-2.5 py-0.5 text-xs font-mono rounded-xs transition-colors ${
                horizon === '12M'
                  ? 'bg-surface text-ink font-bold shadow-xs border border-rule'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Next 12 mo
            </button>
            <button
              type="button"
              onClick={() => setHorizon('ALL')}
              className={`px-2.5 py-0.5 text-xs font-mono rounded-xs transition-colors ${
                horizon === 'ALL'
                  ? 'bg-surface text-ink font-bold shadow-xs border border-rule'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Full schedule
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="var(--rule, #DDD7CB)" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                tick={chartAxisStyle.tick}
                axisLine={chartAxisStyle.axisLine}
                tickLine={chartAxisStyle.tickLine}
              />
              <YAxis
                tick={chartAxisStyle.tick}
                axisLine={chartAxisStyle.axisLine}
                tickLine={chartAxisStyle.tickLine}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface, #FFFFFF)',
                  border: '1px solid var(--rule, #DDD7CB)',
                  borderRadius: '2px',
                  color: 'var(--ink, #1A1814)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-ibm-plex-mono), monospace',
                }}
                formatter={(val: any, name: any) => {
                  const grant = grants.find((g) => g.id === name);
                  const label = grant ? `${grant.companyName} (${grant.grantIdentifier})` : 'Total Vested';
                  return [`${Number(val).toLocaleString()} units`, label];
                }}
                labelFormatter={(lbl) => `Date: ${lbl}`}
              />

              {/* Today vertical marker line */}
              <ReferenceLine
                x={new Date().toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
                stroke="var(--accent, #1F5A44)"
                strokeDasharray="3 3"
                label={{
                  value: 'Today',
                  position: 'insideTopLeft',
                  fill: 'var(--accent, #1F5A44)',
                  fontSize: 10,
                  fontFamily: 'var(--font-ibm-plex-mono), monospace',
                }}
              />

              {/* Stacked Areas for each grant */}
              {grants.map((g, idx) => (
                <Area
                  key={g.id}
                  type="monotone"
                  dataKey={g.id}
                  stackId="1"
                  stroke={seriesColors[idx % seriesColors.length]}
                  fill={seriesColors[idx % seriesColors.length]}
                  fillOpacity={0.25}
                  strokeWidth={1.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-muted">
            Add equity grants to populate the vesting timeline.
          </div>
        )}
      </div>

      {/* Accessible Plain-English Summary beneath */}
      <div className="pt-3 border-t border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans text-muted">
        <p>
          <strong className="text-ink font-medium">Trend summary:</strong>{' '}
          {horizon === '12M'
            ? `Over the next 12 months, ${formatUnits(
                todaySummary.unitsGained
              )} additional units are scheduled to vest, increasing estimated vested value by +${money(
                todaySummary.valueGained
              )}.`
            : `Total vesting schedule accumulates to ${formatUnits(
                totalGranted
              )} units across all active grants. Full schedule horizon extends to the final grant termination.`}
        </p>
        <span className="text-[11px] font-mono shrink-0">
          Cliff markers active on month 12
        </span>
      </div>
    </div>
  );
}

export default VestingTimelineChart;
