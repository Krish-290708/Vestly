'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { money, units as formatUnits, date as formatDate } from '@/lib/format';

export interface GrantEventItem {
  id: string;
  grantIdentifier: string;
  companyName: string;
  grantType: string;
  strikePrice: number;
  currentFmv: number;
  vestingEvents?: Array<{
    vestDate: string;
    unitsVested: number;
    cumulativeVested: number;
  }>;
}

interface ScheduleSectionProps {
  grants: GrantEventItem[];
  fmvMultiplier?: number;
}

export function ScheduleSection({
  grants,
  fmvMultiplier = 1,
}: ScheduleSectionProps) {
  const now = useMemo(() => new Date(), []);

  // Compute month-by-month list for the next 12 calendar months
  const next12Months = useMemo(() => {
    const monthsList: Array<{
      key: string;
      label: string;
      yearMonth: string;
      units: number;
      value: number;
    }> = [];

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    for (let i = 1; i <= 12; i++) {
      const d = new Date(currentYear, currentMonth + i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

      monthsList.push({
        key: yearMonth,
        label,
        yearMonth,
        units: 0,
        value: 0,
      });
    }

    grants.forEach((g) => {
      (g.vestingEvents || []).forEach((e) => {
        const eDate = new Date(e.vestDate);
        const ym = `${eDate.getFullYear()}-${String(eDate.getMonth() + 1).padStart(2, '0')}`;
        const match = monthsList.find((m) => m.yearMonth === ym);
        if (match) {
          match.units += e.unitsVested;
          match.value += e.unitsVested * (g.currentFmv * fmvMultiplier);
        }
      });
    });

    return monthsList;
  }, [grants, now, fmvMultiplier]);

  // Compute the next 10 upcoming vest events
  const next10Events = useMemo(() => {
    const upcoming: Array<{
      grantId: string;
      grantIdentifier: string;
      companyName: string;
      grantType: string;
      vestDate: Date;
      unitsVested: number;
      estimatedValue: number;
      cumulativeVested: number;
    }> = [];

    grants.forEach((g) => {
      (g.vestingEvents || []).forEach((e) => {
        const vDate = new Date(e.vestDate);
        if (vDate >= now) {
          upcoming.push({
            grantId: g.id,
            grantIdentifier: g.grantIdentifier,
            companyName: g.companyName,
            grantType: g.grantType,
            vestDate: vDate,
            unitsVested: e.unitsVested,
            estimatedValue: e.unitsVested * (g.currentFmv * fmvMultiplier),
            cumulativeVested: e.cumulativeVested,
          });
        }
      });
    });

    return upcoming
      .sort((a, b) => a.vestDate.getTime() - b.vestDate.getTime())
      .slice(0, 10);
  }, [grants, now, fmvMultiplier]);

  const totalNext12Units = next12Months.reduce((s, m) => s + m.units, 0);
  const totalNext12Value = next12Months.reduce((s, m) => s + m.value, 0);

  return (
    <div className="space-y-6">
      {/* Month-by-month 12 month strip */}
      <div className="border border-rule rounded-xs bg-surface p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-rule pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">
              Rolling schedule
            </span>
            <h2 className="font-serif text-base font-bold text-ink">
              Next 12 months vesting projection
            </h2>
          </div>
          <div className="text-xs font-mono text-muted flex items-center gap-3">
            <span>
              Total scheduled: <strong className="text-ink">{formatUnits(totalNext12Units)} units</strong>
            </span>
            <span>·</span>
            <span>
              Value: <strong className="text-gain">{money(totalNext12Value)}</strong>
            </span>
          </div>
        </div>

        {/* 12-month Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {next12Months.map((m) => (
            <div
              key={m.key}
              className={`p-2.5 rounded-xs border ${
                m.units > 0
                  ? 'border-rule bg-sunk/30'
                  : 'border-rule/50 bg-paper/40 opacity-70'
              } space-y-1`}
            >
              <span className="text-[10px] font-mono text-muted uppercase block">
                {m.label}
              </span>
              <div className="font-mono text-xs font-bold text-ink tabular-nums">
                {m.units > 0 ? `${formatUnits(m.units)} units` : '0 units'}
              </div>
              <div className="text-[10px] font-mono text-muted tabular-nums">
                {m.units > 0 ? money(m.value) : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next 10 Vest Events Table */}
      <div className="border border-rule rounded-xs bg-surface overflow-hidden">
        <div className="p-4 border-b border-rule flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" aria-hidden="true" />
            <h3 className="font-serif text-base font-bold text-ink">
              Next 10 upcoming vest events
            </h3>
          </div>
          <span className="text-[11px] font-mono text-muted">
            Chronological schedule
          </span>
        </div>

        {next10Events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-rule bg-sunk/40 text-[11px] font-mono text-muted">
                  <th className="py-2.5 px-4 font-medium">Vest date</th>
                  <th className="py-2.5 px-4 font-medium">Company & Grant</th>
                  <th className="py-2.5 px-4 font-medium">Type</th>
                  <th className="py-2.5 px-4 font-medium text-right">Units vesting</th>
                  <th className="py-2.5 px-4 font-medium text-right">Estimated value</th>
                  <th className="py-2.5 px-4 font-medium text-right">Cumulative</th>
                  <th className="py-2.5 px-4 font-medium text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 text-ink">
                {next10Events.map((evt, idx) => (
                  <tr key={`${evt.grantId}-${idx}`} className="hover:bg-sunk/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      {formatDate(evt.vestDate)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <span className="font-semibold">{evt.companyName}</span>{' '}
                      <span className="text-muted text-[11px]">({evt.grantIdentifier})</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono bg-sunk border border-rule">
                        {evt.grantType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-right tabular-nums font-semibold">
                      +{formatUnits(evt.unitsVested)}
                    </td>
                    <td className="py-3 px-4 font-mono text-right tabular-nums text-gain font-medium">
                      {money(evt.estimatedValue)}
                    </td>
                    <td className="py-3 px-4 font-mono text-right tabular-nums text-muted">
                      {formatUnits(evt.cumulativeVested)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/grants/${evt.grantId}`}
                        className="text-accent hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted">
            No upcoming vest events recorded.
          </div>
        )}
      </div>
    </div>
  );
}

export default ScheduleSection;
