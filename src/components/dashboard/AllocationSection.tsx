'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { PieChart, ArrowRight, Info } from 'lucide-react';
import { money, percent } from '@/lib/format';

export interface GrantAllocationItem {
  id: string;
  companyName: string;
  grantType: string;
  vestedUnits: number;
  currentFmv: number;
}

interface AllocationSectionProps {
  grants: GrantAllocationItem[];
  fmvMultiplier?: number;
}

export function AllocationSection({
  grants,
  fmvMultiplier = 1,
}: AllocationSectionProps) {
  const { byCompany, byType, totalValue, concentratedCompany } = useMemo(() => {
    const compMap = new Map<string, number>();
    const typeMap = new Map<string, number>();
    let total = 0;

    grants.forEach((g) => {
      const val = g.vestedUnits * (g.currentFmv * fmvMultiplier);
      total += val;

      compMap.set(g.companyName, (compMap.get(g.companyName) || 0) + val);
      typeMap.set(g.grantType, (typeMap.get(g.grantType) || 0) + val);
    });

    const compList = Array.from(compMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        share: total > 0 ? value / total : 0,
      }))
      .sort((a, b) => b.value - a.value);

    const typeList = Array.from(typeMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        share: total > 0 ? value / total : 0,
      }))
      .sort((a, b) => b.value - a.value);

    // Check if one company exceeds 50%
    const topComp = compList.find((c) => c.share > 0.5);

    return {
      byCompany: compList,
      byType: typeList,
      totalValue: total,
      concentratedCompany: topComp,
    };
  }, [grants, fmvMultiplier]);

  return (
    <div className="border border-rule rounded-xs bg-surface p-5 space-y-6">
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-accent" aria-hidden="true" />
          <h2 className="font-serif text-base font-bold text-ink">
            Equity allocation
          </h2>
        </div>
        <span className="text-[11px] font-mono text-muted">
          Based on estimated vested value ({money(totalValue)})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* By Company */}
        <div className="space-y-3">
          <h3 className="font-serif text-xs font-bold text-ink uppercase tracking-wider text-muted">
            Allocation by employer
          </h3>
          <div className="space-y-2.5">
            {byCompany.map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="font-semibold text-ink">{c.name}</span>
                  <span className="font-mono text-muted tabular-nums">
                    {money(c.value)} ({percent(c.share)})
                  </span>
                </div>
                <div className="w-full h-1.5 bg-sunk rounded-xs overflow-hidden">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${Math.round(c.share * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Grant Type */}
        <div className="space-y-3">
          <h3 className="font-serif text-xs font-bold text-ink uppercase tracking-wider text-muted">
            Allocation by equity structure
          </h3>
          <div className="space-y-2.5">
            {byType.map((t) => (
              <div key={t.name} className="space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="font-semibold text-ink">{t.name}</span>
                  <span className="font-mono text-muted tabular-nums">
                    {money(t.value)} ({percent(t.share)})
                  </span>
                </div>
                <div className="w-full h-1.5 bg-sunk rounded-xs overflow-hidden">
                  <div
                    className="h-full bg-info"
                    style={{ width: `${Math.round(t.share * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Neutral Concentration Notice (rendered only when one company > 50%) */}
      {concentratedCompany && (
        <div className="pt-3 border-t border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted font-sans bg-sunk/20 p-3 rounded-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-info shrink-0" aria-hidden="true" />
            <span>
              <strong className="text-ink font-semibold">{concentratedCompany.name}</strong>{' '}
              represents {Math.round(concentratedCompany.share * 100)}% of your total estimated
              equity value. Concentration dynamics vary based on individual financial circumstances.
            </span>
          </div>
          <Link
            href="/learn#concentration-risk"
            className="text-accent hover:underline inline-flex items-center gap-1 font-medium shrink-0"
          >
            <span>Read concentration guide</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default AllocationSection;

