'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader, Tabs, Badge, Button, EmptyState, Callout } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { money, date, units, percent } from '@/lib/format';
import { COMPLIANCE_DISCLAIMER } from '@/lib/calculations/taxes';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface GrantData {
  id: string;
  grantIdentifier: string;
  grantType: string;
  unitsGranted: number;
  strikePrice: number;
  grantDate: string;
  vestingStartDate: string;
  expirationDate: string;
  cliffMonths: number;
  vestingMonths: number;
  vestedUnits?: number;
  vestedValue?: number;
  vestedExerciseCost?: number;
  exercisedUnits?: number;
  company: {
    name: string;
    latestFmvPerShare: number;
  };
}

interface UserData {
  name: string;
  email: string;
  filingStatus?: string;
  stateCode?: string;
  annualIncome?: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function csvEscape(val: string | number): string {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const csv = [header.join(','), ...rows.map((r) => r.map(csvEscape).join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function ReportsPage() {
  const { showToast } = useToast();

  const [grants, setGrants] = useState<GrantData[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('portfolio');

  useEffect(() => {
    Promise.all([
      fetch('/api/grants').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
    ]).then(([gData, uData]) => {
      if (gData?.grants) setGrants(gData.grants);
      if (uData?.user) setUser(uData.user);
      setLoading(false);
    });
  }, []);

  /* ---- Computed ---- */
  const totals = useMemo(() => {
    const granted = grants.reduce((s, g) => s + (g.unitsGranted || 0), 0);
    const vested = grants.reduce((s, g) => s + (g.vestedUnits || 0), 0);
    const vestedValue = grants.reduce((s, g) => s + (g.vestedValue || 0), 0);
    const exerciseCost = grants.reduce((s, g) => s + (g.vestedExerciseCost || 0), 0);
    const exercised = grants.reduce((s, g) => s + (g.exercisedUnits || 0), 0);
    const netValue = vestedValue - exerciseCost;
    return { granted, vested, vestedValue, exerciseCost, exercised, netValue };
  }, [grants]);

  const reportDate = date(new Date());

  /* ---- CSV exports ---- */
  const exportPortfolioCsv = () => {
    downloadCsv('portfolio-summary.csv',
      ['Company', 'Grant ID', 'Type', 'Units granted', 'Units vested', 'Strike price', 'Current FMV', 'Vested value', 'Exercise cost', 'Net value'],
      grants.map((g) => [
        g.company.name, g.grantIdentifier, g.grantType,
        g.unitsGranted, g.vestedUnits || 0,
        g.grantType === 'RSU' ? 0 : g.strikePrice,
        g.company.latestFmvPerShare,
        g.vestedValue || 0, g.vestedExerciseCost || 0,
        (g.vestedValue || 0) - (g.vestedExerciseCost || 0),
      ]),
    );
    showToast({ title: 'Exported', message: 'Portfolio summary saved as CSV.', type: 'success' });
  };

  const exportGrantLedgerCsv = () => {
    downloadCsv('grant-ledger.csv',
      ['Grant ID', 'Company', 'Type', 'Grant date', 'Vesting start', 'Cliff months', 'Vesting months', 'Expiration', 'Units granted', 'Strike price', 'FMV'],
      grants.map((g) => [
        g.grantIdentifier, g.company.name, g.grantType,
        date(g.grantDate), date(g.vestingStartDate),
        g.cliffMonths, g.vestingMonths, date(g.expirationDate),
        g.unitsGranted, g.strikePrice, g.company.latestFmvPerShare,
      ]),
    );
    showToast({ title: 'Exported', message: 'Grant ledger saved as CSV.', type: 'success' });
  };

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */
  return (
    <div className="space-y-6 pb-12">
      {/* Header — hidden when printing */}
      <div className="no-print">
        <PageHeader
          eyebrow="Analyse"
          title="Reports"
          contextSentence={`${grants.length} grant${grants.length !== 1 ? 's' : ''} across ${new Set(grants.map((g) => g.company.name)).size} ${new Set(grants.map((g) => g.company.name)).size !== 1 ? 'companies' : 'company'}. Report generated ${reportDate}.`}
          actions={
            <Button variant="primary" size="sm" onClick={() => window.print()}>
              Print or save to PDF
            </Button>
          }
        />

        <Tabs
          tabs={[
            { id: 'portfolio', label: 'Portfolio summary' },
            { id: 'ledger', label: 'Grant ledger' },
            { id: 'tax', label: 'Tax-year report' },
            { id: 'advisor', label: 'Advisor pack' },
          ]}
          activeTab={activeReport}
          onChange={setActiveReport}
          size="sm"
          className="mt-4"
        />
      </div>

      {/* ================================================================ */}
      {/*  Report sheet — always light theme for print                     */}
      {/* ================================================================ */}
      <div className="bg-white text-gray-900 border border-rule rounded-sm p-6 sm:p-10 space-y-8 print-page print:border-0 print:rounded-none print:p-0 print:shadow-none">

        {/* Document header */}
        <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4">
          <div className="space-y-1">
            <div className="font-serif text-lg font-bold text-gray-900 tracking-tight">
              Vestly equity {activeReport === 'portfolio' ? 'portfolio summary' : activeReport === 'ledger' ? 'grant ledger' : activeReport === 'tax' ? 'tax-year report' : 'advisor pack'}
            </div>
            <p className="text-xs text-gray-500">
              Confidential statement prepared for financial planning
            </p>
          </div>
          <div className="text-right text-xs text-gray-500 space-y-0.5">
            <div><strong>Client:</strong> {user?.name || 'Equity holder'}</div>
            <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
            <div><strong>Report date:</strong> {reportDate}</div>
          </div>
        </div>

        {/* ---- Portfolio summary ---- */}
        {activeReport === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                1. Aggregate totals
              </h3>
              <Button variant="ghost" size="sm" onClick={exportPortfolioCsv}>
                Download CSV
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-sm bg-gray-50 border border-gray-200 text-xs">
              <div>
                <span className="text-gray-500 block">Total granted</span>
                <span className="text-base font-bold text-gray-900 font-mono tabular-nums">{units(totals.granted)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Total vested</span>
                <span className="text-base font-bold text-gray-900 font-mono tabular-nums">{units(totals.vested)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Exercise cost</span>
                <span className="text-base font-bold text-gray-900 font-mono tabular-nums">{money(totals.exerciseCost)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Estimated value</span>
                <span className={`text-base font-bold font-mono tabular-nums ${totals.netValue >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {money(totals.netValue)}
                </span>
              </div>
            </div>

            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider print:mt-4">
              2. Grant breakdown
            </h3>

            <div className="border border-gray-200 rounded-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Company</th>
                    <th className="p-2.5">Grant ID</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5 text-right">Granted</th>
                    <th className="p-2.5 text-right">Vested</th>
                    <th className="p-2.5 text-right">Strike</th>
                    <th className="p-2.5 text-right">FMV</th>
                    <th className="p-2.5 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {grants.map((g) => (
                    <tr key={g.id}>
                      <td className="p-2.5 font-medium">{g.company.name}</td>
                      <td className="p-2.5 font-mono text-[11px]">{g.grantIdentifier}</td>
                      <td className="p-2.5">{g.grantType}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums">{units(g.unitsGranted)}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums">{units(g.vestedUnits || 0)}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums">{g.grantType === 'RSU' ? '—' : money(g.strikePrice, { showCents: true })}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums">{money(g.company.latestFmvPerShare, { showCents: true })}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums font-medium">{money(g.vestedValue || 0)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300 font-bold text-gray-900">
                  <tr>
                    <td colSpan={3} className="p-2.5">Total</td>
                    <td className="p-2.5 text-right font-mono tabular-nums">{units(totals.granted)}</td>
                    <td className="p-2.5 text-right font-mono tabular-nums">{units(totals.vested)}</td>
                    <td colSpan={2} className="p-2.5"></td>
                    <td className="p-2.5 text-right font-mono tabular-nums">{money(totals.vestedValue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ---- Grant ledger ---- */}
        {activeReport === 'ledger' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Grant schedule ledger
              </h3>
              <Button variant="ghost" size="sm" onClick={exportGrantLedgerCsv}>
                Download CSV
              </Button>
            </div>

            <div className="border border-gray-200 rounded-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Grant ID</th>
                    <th className="p-2.5">Company</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Grant date</th>
                    <th className="p-2.5">Vesting start</th>
                    <th className="p-2.5 text-right">Cliff</th>
                    <th className="p-2.5 text-right">Schedule</th>
                    <th className="p-2.5">Expiration</th>
                    <th className="p-2.5 text-right">Units</th>
                    <th className="p-2.5 text-right">Strike</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {grants.map((g) => (
                    <tr key={g.id}>
                      <td className="p-2.5 font-mono text-[11px] font-medium">{g.grantIdentifier}</td>
                      <td className="p-2.5">{g.company.name}</td>
                      <td className="p-2.5">{g.grantType}</td>
                      <td className="p-2.5 font-mono tabular-nums">{date(g.grantDate)}</td>
                      <td className="p-2.5 font-mono tabular-nums">{date(g.vestingStartDate)}</td>
                      <td className="p-2.5 text-right">{g.cliffMonths}m</td>
                      <td className="p-2.5 text-right">{g.vestingMonths}m</td>
                      <td className="p-2.5 font-mono tabular-nums">{date(g.expirationDate)}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums">{units(g.unitsGranted)}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums">{g.grantType === 'RSU' ? '—' : money(g.strikePrice, { showCents: true })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- Tax-year report ---- */}
        {activeReport === 'tax' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Tax-year report ({new Date().getFullYear()})
            </h3>

            <Callout variant="note">
              This report summarises estimated tax exposure based on your current holdings and the assumptions you entered. It is not tax advice. Consult a qualified tax professional before making decisions.
            </Callout>

            <div className="space-y-4">
              {grants.map((g) => {
                const spread = g.company.latestFmvPerShare - g.strikePrice;
                const vestedSpread = spread * (g.vestedUnits || 0);
                const isISO = g.grantType === 'ISO';
                const isRSU = g.grantType === 'RSU';

                return (
                  <div key={g.id} className="border border-gray-200 rounded-sm p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{g.company.name}</span>
                        <span className="text-gray-500 ml-2 text-[11px]">{g.grantIdentifier} ({g.grantType})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 block">Spread per share</span>
                        <span className={`font-mono tabular-nums font-medium ${spread >= 0 ? 'text-gray-900' : 'text-red-700'}`}>
                          {isRSU ? '—' : money(spread, { showCents: true })}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Total vested spread</span>
                        <span className={`font-mono tabular-nums font-medium ${vestedSpread >= 0 ? 'text-gray-900' : 'text-red-700'}`}>
                          {isRSU ? money(g.vestedValue || 0) : money(vestedSpread)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Tax treatment</span>
                        <span className="text-gray-900">
                          {isISO ? 'AMT preference item (IRC 56(b)(3))' : isRSU ? 'W-2 compensation at vest' : 'Ordinary income at exercise (IRC 83)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Exercised</span>
                        <span className="font-mono tabular-nums">{units(g.exercisedUnits || 0)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-sm bg-gray-50 border border-gray-200 text-xs space-y-2 text-gray-700 leading-relaxed">
              <p>
                <strong>ISO holders:</strong> The difference between current FMV and strike price on exercised options represents an Alternative Minimum Tax (AMT) preference item under IRC Section 56(b)(3). Any AMT paid may generate a Minimum Tax Credit (MTC) on IRS Form 8801.
              </p>
              <p>
                <strong>NSO holders:</strong> The exercise spread is subject to ordinary income tax rates, including federal, state, and FICA/Medicare supplemental withholding under IRC Section 83.
              </p>
              <p>
                <strong>RSU holders:</strong> 100% of fair market value at vesting date is included in W-2 compensation. Basis equals FMV on vesting date.
              </p>
            </div>
          </div>
        )}

        {/* ---- Advisor pack ---- */}
        {activeReport === 'advisor' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              CPA and financial advisor summary
            </h3>
            <p className="text-xs text-gray-500">
              This document is prepared for your certified public accountant or financial planner.
            </p>

            {/* Aggregate KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-sm bg-gray-50 border border-gray-200 text-xs">
              <div>
                <span className="text-gray-500 block">Total units granted</span>
                <span className="text-base font-bold text-gray-900 font-mono tabular-nums">{units(totals.granted)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Total vested</span>
                <span className="text-base font-bold text-gray-900 font-mono tabular-nums">{units(totals.vested)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Cost to exercise</span>
                <span className="text-base font-bold text-gray-900 font-mono tabular-nums">{money(totals.exerciseCost)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Estimated FMV value</span>
                <span className="text-base font-bold text-green-700 font-mono tabular-nums">{money(totals.vestedValue)}</span>
              </div>
            </div>

            {/* Full grant table */}
            <div className="border border-gray-200 rounded-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Company and ID</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5 text-right">Granted</th>
                    <th className="p-2.5 text-right">Vested</th>
                    <th className="p-2.5 text-right">Strike</th>
                    <th className="p-2.5 text-right">FMV</th>
                    <th className="p-2.5 text-right">Value (est.)</th>
                    <th className="p-2.5">Grant date</th>
                    <th className="p-2.5">Expiration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {grants.map((g) => (
                    <tr key={g.id}>
                      <td className="p-2.5">
                        <span className="font-medium text-gray-900">{g.company.name}</span>
                        <br />
                        <span className="text-[10px] text-gray-500 font-mono">{g.grantIdentifier}</span>
                      </td>
                      <td className="p-2.5 font-medium">{g.grantType}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums">{units(g.unitsGranted)}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums font-medium">{units(g.vestedUnits || 0)}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums">{g.grantType === 'RSU' ? '—' : money(g.strikePrice, { showCents: true })}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums">{money(g.company.latestFmvPerShare, { showCents: true })}</td>
                      <td className="p-2.5 text-right font-mono tabular-nums font-medium">{money(g.vestedValue || 0)}</td>
                      <td className="p-2.5 font-mono tabular-nums text-[11px]">{date(g.grantDate)}</td>
                      <td className="p-2.5 font-mono tabular-nums text-[11px]">{date(g.expirationDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tax planning notes */}
            <div className="p-4 rounded-sm bg-gray-50 border border-gray-200 text-xs space-y-2 text-gray-700 leading-relaxed">
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px]">
                Tax planning notes for accountant
              </h4>
              <p>
                <strong>Incentive Stock Options (ISOs):</strong> The difference between current FMV and strike price on exercised options represents an Alternative Minimum Tax (AMT) preference item under IRC Section 56(b)(3). Any AMT paid may generate a Minimum Tax Credit (MTC) on IRS Form 8801.
              </p>
              <p>
                <strong>Non-Qualified Stock Options (NSOs):</strong> The exercise spread is subject to ordinary income tax rates, including federal, state, and FICA/Medicare supplemental withholding under IRC Section 83.
              </p>
              <p>
                <strong>Restricted Stock Units (RSUs):</strong> 100% of fair market value at vesting date is included in W-2 compensation. Basis equals FMV on vesting date.
              </p>
            </div>
          </div>
        )}

        {/* Disclaimer footer */}
        <div className="pt-6 border-t border-gray-200 text-[10px] text-gray-500 space-y-1">
          <strong>LEGAL AND REGULATORY STATEMENT:</strong>
          <p className="leading-normal">
            {COMPLIANCE_DISCLAIMER} All valuation data is based on user-provided 409A appraisals or publicly quoted prices. Vestly assumes no liability for tax filing errors or omissions.
          </p>
        </div>
      </div>
    </div>
  );
}
