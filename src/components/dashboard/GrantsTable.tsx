'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpDown, ArrowRight } from 'lucide-react';
import { money, units as formatUnits } from '@/lib/format';

export interface GrantTableRow {
  id: string;
  grantIdentifier: string;
  grantType: string;
  companyName: string;
  unitsGranted: number;
  vestedUnits: number;
  percentVested: number;
  strikePrice: number;
  currentFmv: number;
  status: string;
}

interface GrantsTableProps {
  grants: GrantTableRow[];
  fmvMultiplier?: number;
}

type SortField = 'company' | 'vested' | 'strike' | 'fmv' | 'cost' | 'net';
type SortDirection = 'asc' | 'desc';

export function GrantsTable({
  grants,
  fmvMultiplier = 1,
}: GrantsTableProps) {
  const [sortField, setSortField] = useState<SortField>('company');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedGrants = useMemo(() => {
    return [...grants].sort((a, b) => {
      const effectiveFmvA = a.currentFmv * fmvMultiplier;
      const effectiveFmvB = b.currentFmv * fmvMultiplier;
      const costA = a.grantType === 'RSU' ? 0 : a.vestedUnits * a.strikePrice;
      const costB = b.grantType === 'RSU' ? 0 : b.vestedUnits * b.strikePrice;
      const netA = a.vestedUnits * effectiveFmvA - costA;
      const netB = b.vestedUnits * effectiveFmvB - costB;

      let comp = 0;
      switch (sortField) {
        case 'company':
          comp = a.companyName.localeCompare(b.companyName);
          break;
        case 'vested':
          comp = a.vestedUnits - b.vestedUnits;
          break;
        case 'strike':
          comp = a.strikePrice - b.strikePrice;
          break;
        case 'fmv':
          comp = effectiveFmvA - effectiveFmvB;
          break;
        case 'cost':
          comp = costA - costB;
          break;
        case 'net':
          comp = netA - netB;
          break;
      }

      return sortDir === 'asc' ? comp : -comp;
    });
  }, [grants, fmvMultiplier, sortField, sortDir]);

  return (
    <div className="border border-rule rounded-xs bg-surface overflow-hidden">
      <div className="p-4 border-b border-rule flex items-center justify-between">
        <div>
          <h2 className="font-serif text-base font-bold text-ink">
            Active grants ledger
          </h2>
          <p className="text-xs text-muted">
            All registered equity grants across employers. Select any row to view grant detail.
          </p>
        </div>
        <Link
          href="/grants"
          className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-medium"
        >
          <span>All grants</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-rule bg-sunk/40 text-[11px] font-mono text-muted select-none">
              <th
                onClick={() => toggleSort('company')}
                className="py-3 px-4 font-semibold text-ink cursor-pointer hover:text-accent"
              >
                <div className="flex items-center gap-1">
                  <span>Company & Grant</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-medium">Type</th>
              <th
                onClick={() => toggleSort('vested')}
                className="py-3 px-4 font-medium text-right cursor-pointer hover:text-accent"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Vested / Total</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('strike')}
                className="py-3 px-4 font-medium text-right cursor-pointer hover:text-accent"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Strike</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('fmv')}
                className="py-3 px-4 font-medium text-right cursor-pointer hover:text-accent"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Share price</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('cost')}
                className="py-3 px-4 font-medium text-right cursor-pointer hover:text-accent"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Exercise cost</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('net')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-accent"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Net pre-tax</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule/60 text-ink">
            {sortedGrants.map((grant) => {
              const effectiveFmv = grant.currentFmv * fmvMultiplier;
              const exerciseCost =
                grant.grantType === 'RSU' ? 0 : grant.vestedUnits * grant.strikePrice;
              const grossVestedValue = grant.vestedUnits * effectiveFmv;
              // Bug 3 Fix: NEVER clamp net pre-tax equity!
              const netValue = grossVestedValue - exerciseCost;
              const isNegative = netValue < 0;

              return (
                <tr key={grant.id} className="hover:bg-sunk/20 transition-colors group">
                  <td className="py-3.5 px-4 font-medium">
                    <Link
                      href={`/grants/${grant.id}`}
                      className="block group-hover:text-accent transition-colors"
                    >
                      <span className="font-semibold text-ink group-hover:text-accent block">
                        {grant.companyName}
                      </span>
                      <span className="text-[11px] font-mono text-muted block">
                        {grant.grantIdentifier}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-sunk border border-rule">
                      {grant.grantType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                    <div>
                      <span className="font-semibold text-ink">
                        {formatUnits(grant.vestedUnits)}
                      </span>
                      <span className="text-muted"> / {formatUnits(grant.unitsGranted)}</span>
                    </div>
                    <span className="text-[10px] text-muted block">
                      {grant.percentVested}% vested
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                    {grant.grantType === 'RSU' ? '—' : `$${grant.strikePrice.toFixed(2)}`}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                    ${effectiveFmv.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                    {grant.grantType === 'RSU' ? '$0' : money(exerciseCost)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right tabular-nums font-bold">
                    <span className={isNegative ? 'text-loss' : 'text-gain'}>
                      {isNegative ? `-${money(Math.abs(netValue))}` : `+${money(netValue)}`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GrantsTable;
