'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface EquityTypeRow {
  code: string;
  name: string;
  whoGetsIt: string;
  strikePrice: string;
  whenTaxed: string;
  amtExposure: string;
  whereCommon: string;
  learnHref: string;
}

const EQUITY_TYPES: EquityTypeRow[] = [
  {
    code: 'ISO',
    name: 'Incentive Stock Options',
    whoGetsIt: 'US full-time employees only',
    strikePrice: 'Fair market value at grant (409A)',
    whenTaxed: 'At sale (AMT may apply at exercise)',
    amtExposure: 'Yes (spread at exercise is an AMT preference item)',
    whereCommon: 'Early-stage and venture-backed startups',
    learnHref: '/learn#iso',
  },
  {
    code: 'NSO',
    name: 'Non-Qualified Stock Options',
    whoGetsIt: 'Employees, contractors, advisors, directors',
    strikePrice: 'Fair market value at grant (409A)',
    whenTaxed: 'At exercise (spread taxed as ordinary wage income)',
    amtExposure: 'No (subject to regular income tax + FICA)',
    whereCommon: 'Late-stage startups, international hires, advisors',
    learnHref: '/learn#nso',
  },
  {
    code: 'RSU',
    name: 'Restricted Stock Units',
    whoGetsIt: 'Employees at mature or public companies',
    strikePrice: '$0 (outright award of company shares)',
    whenTaxed: 'At vesting (full value taxed as ordinary income)',
    amtExposure: 'No (treated as supplemental wage compensation)',
    whereCommon: 'Public tech companies and late-stage unicorns',
    learnHref: '/learn#rsu',
  },
  {
    code: 'ESPP',
    name: 'Employee Stock Purchase Plan',
    whoGetsIt: 'All eligible full-time staff',
    strikePrice: 'Discounted price (typically 15% discount)',
    whenTaxed: 'At sale (discount as income, spread as capital gains)',
    amtExposure: 'No (qualified plans follow Section 423 rules)',
    whereCommon: 'Publicly traded corporations',
    learnHref: '/learn#espp',
  },
];

export function EquityComparisonTable() {
  return (
    <section className="py-12 border-b border-rule">
      <div className="space-y-3 mb-8">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted block">
          Equity structures
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Four kinds of equity
        </h2>
        <p className="text-sm text-muted max-w-2xl leading-relaxed">
          Different equity agreements carry fundamentally different tax liabilities,
          purchase costs, and statutory deadlines under the US Internal Revenue Code.
        </p>
      </div>

      <div className="border border-rule rounded-xs bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-rule bg-sunk/40 text-[11px] font-mono text-muted">
                <th className="py-3 px-4 font-semibold text-ink">Type</th>
                <th className="py-3 px-4 font-medium">Who receives it</th>
                <th className="py-3 px-4 font-medium">Strike price / Cost</th>
                <th className="py-3 px-4 font-medium">When it is taxed</th>
                <th className="py-3 px-4 font-medium">AMT exposure</th>
                <th className="py-3 px-4 font-medium">Typical usage</th>
                <th className="py-3 px-4 font-medium text-right">Guide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60 text-ink">
              {EQUITY_TYPES.map((row) => (
                <tr key={row.code} className="hover:bg-sunk/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-sunk border border-rule text-ink">
                        {row.code}
                      </span>
                      <span className="font-semibold">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-muted">{row.whoGetsIt}</td>
                  <td className="py-3.5 px-4 text-ink font-mono text-[11px]">{row.strikePrice}</td>
                  <td className="py-3.5 px-4 text-muted">{row.whenTaxed}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block text-[11px] font-medium ${
                        row.amtExposure.startsWith('Yes') ? 'text-warn font-semibold' : 'text-muted'
                      }`}
                    >
                      {row.amtExposure}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-muted">{row.whereCommon}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={row.learnHref}
                      className="inline-flex items-center gap-1 text-accent hover:underline font-medium text-xs"
                    >
                      <span>Read guide</span>
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-rule bg-sunk/20 text-[11px] font-mono text-muted flex items-center justify-between">
          <span>Detailed statutory guides available in the Learn Hub</span>
          <span>IRS Sections 421, 422, 423, and 83</span>
        </div>
      </div>
    </section>
  );
}

export default EquityComparisonTable;

