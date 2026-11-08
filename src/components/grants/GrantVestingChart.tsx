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
import { chartTokens, chartAxisStyle } from '@/components/charts/theme';
import { money, units as formatUnits, date as formatDate } from '@/lib/format';

interface GrantVestingChartProps {
  grant: any;
  fmvMultiplier?: number;
}

export default function GrantVestingChart({
  grant,
  fmvMultiplier = 1,
}: GrantVestingChartProps) {
  const [horizon, setHorizon] = useState<'12M' | 'ALL'>('ALL');

  const now = useMemo(() => new Date(), []);
  const todayStr = now.toISOString().split('T')[0];
  const oneYearFromNow = useMemo(() => {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }, [now]);

  const fmv = (grant?.company?.latestFmvPerShare || 0) * fmvMultiplier;

  const { chartData, cliffDateStr, todayVested } = useMemo(() => {
    const events = grant?.vestingEvents || [];
    if (events.length === 0) {
      return { chartData: [], cliffDateStr: null, todayVested: 0 };
    }

    // Determine cliff date
    let cliffStr: string | null = null;
    if (grant.cliffMonths > 0) {
      const vStart = new Date(grant.vestingStartDate || grant.grantDate);
      const cDate = new Date(vStart.getTime() + grant.cliffMonths * 30.44 * 24 * 3600 * 1000);
      cliffStr = cDate.toISOString().split('T')[0];
    }

    // Sort events
    const sorted = [...events].sort(
      (a, b) => new Date(a.vestDate).getTime() - new Date(b.vestDate).getTime()
    );

    let currentVested = 0;
    const points: Array<{
      date: string;
      displayDate: string;
      cumulativeUnits: number;
      cumulativeValue: number;
      isPast: boolean;
    }> = [];

    // Add start point
    const firstDate = new Date(grant.vestingStartDate || grant.grantDate);
    const startStr = firstDate.toISOString().split('T')[0];
    points.push({
      date: startStr,
      displayDate: formatDate(firstDate),
      cumulativeUnits: 0,
      cumulativeValue: 0,
      isPast: firstDate <= now,
    });

    sorted.forEach((e) => {
      const d = new Date(e.vestDate);
      const dStr = d.toISOString().split('T')[0];
      const isPast = d <= now;
      if (isPast) {
        currentVested = e.cumulativeVested;
      }

      points.push({
        date: dStr,
        displayDate: formatDate(d),
        cumulativeUnits: e.cumulativeVested,
        cumulativeValue: Math.round(e.cumulativeVested * fmv),
        isPast,
      });
    });

    // Filter by horizon if 12M
    let filtered = points;
    if (horizon === '12M') {
      filtered = points.filter((p) => {
        const pd = new Date(p.date);
        return pd <= oneYearFromNow;
      });
    }

    return {
      chartData: filtered,
      cliffDateStr: cliffStr,
      todayVested: grant.vestedUnits || currentVested,
    };
  }, [grant, fmv, horizon, now, oneYearFromNow]);

  if (chartData.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted border border-rule rounded-sm bg-surface">
        No vesting schedule available for this grant.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Chart Controls */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-muted">
            Currently vested:{' '}
            <strong className="text-ink font-semibold font-mono">
              {formatUnits(todayVested)} units
            </strong>{' '}
            ({money(todayVested * fmv)})
          </span>
        </div>

        <div className="inline-flex items-center border border-rule rounded-sm bg-sunk p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setHorizon('12M')}
            className={`px-2.5 py-0.5 rounded-xs transition-colors font-medium ${
              horizon === '12M'
                ? 'bg-surface text-ink font-semibold shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            Next 12 months
          </button>
          <button
            type="button"
            onClick={() => setHorizon('ALL')}
            className={`px-2.5 py-0.5 rounded-xs transition-colors font-medium ${
              horizon === 'ALL'
                ? 'bg-surface text-ink font-semibold shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            Full schedule
          </button>
        </div>
      </div>

      {/* Screen-reader summary */}
      <p className="sr-only">
        Vesting schedule area chart for {grant?.grantIdentifier}. {formatUnits(todayVested)} of{' '}
        {formatUnits(grant?.unitsGranted)} units vested to date. Full schedule culminates at{' '}
        {formatUnits(grant?.unitsGranted)} units with total estimated value of{' '}
        {money(grant?.unitsGranted * fmv)}.
      </p>

      {/* Area Chart */}
      <div className="h-64 border border-rule rounded-sm bg-surface p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="grantVestingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartTokens.accent} stopOpacity={0.25} />
                <stop offset="95%" stopColor={chartTokens.accent} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="var(--rule, #DDD7CB)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => {
                const d = new Date(val);
                return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
              }}
              tick={chartAxisStyle.tick}
              axisLine={chartAxisStyle.axisLine}
              tickLine={chartAxisStyle.tickLine}
            />
            <YAxis
              tickFormatter={(v) => formatUnits(v)}
              tick={chartAxisStyle.tick}
              axisLine={chartAxisStyle.axisLine}
              tickLine={chartAxisStyle.tickLine}
              width={50}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="p-2.5 bg-surface border border-rule rounded-sm shadow-md text-xs space-y-1">
                    <p className="font-semibold text-ink">{d.displayDate}</p>
                    <div className="flex justify-between gap-4 text-muted">
                      <span>Cumulative vested:</span>
                      <span className="font-mono text-ink font-medium">
                        {formatUnits(d.cumulativeUnits)} units
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 text-muted">
                      <span>Estimated value:</span>
                      <span className="font-mono text-ink font-medium">
                        {money(d.cumulativeValue)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 text-[11px] text-muted pt-1 border-t border-rule">
                      <span>Percent of grant:</span>
                      <span className="font-mono text-ink">
                        {grant?.unitsGranted > 0
                          ? Math.round((d.cumulativeUnits / grant.unitsGranted) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            {/* Cliff reference line */}
            {cliffDateStr && (
              <ReferenceLine
                x={cliffDateStr}
                stroke={chartTokens.loss}
                strokeDasharray="3 3"
                label={{
                  value: 'Cliff',
                  position: 'insideTopLeft',
                  fill: chartTokens.loss,
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
            )}

            {/* Today reference line */}
            <ReferenceLine
              x={todayStr}
              stroke={chartTokens.accent}
              strokeWidth={1.5}
              label={{
                value: 'Today',
                position: 'insideTopRight',
                fill: chartTokens.accent,
                fontSize: 10,
                fontFamily: 'monospace',
              }}
            />

            <Area
              type="stepAfter"
              dataKey="cumulativeUnits"
              stroke={chartTokens.accent}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#grantVestingGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
