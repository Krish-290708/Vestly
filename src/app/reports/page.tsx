'use client';

import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  Sparkles, 
  FileText, 
  Building, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { COMPLIANCE_DISCLAIMER } from '@/lib/calculations/taxes';

export default function ReportsPage() {
  const [grants, setGrants] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/grants').then(r => r.ok ? r.json() : null),
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
    ]).then(([gData, uData]) => {
      if (gData?.grants) setGrants(gData.grants);
      if (uData?.user) setUser(uData.user);
      setLoading(false);
    });
  }, []);

  const totalGranted = grants.reduce((sum, g) => sum + (g.unitsGranted || 0), 0);
  const totalVested = grants.reduce((sum, g) => sum + (g.vestedUnits || 0), 0);
  const totalVestedValue = grants.reduce((sum, g) => sum + (g.vestedValue || 0), 0);
  const totalExerciseCost = grants.reduce((sum, g) => sum + (g.vestedExerciseCost || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            CPA & Financial Advisor Summary Report
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Clean, printable audit document prepared for tax preparation and wealth planning
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print or Save to PDF</span>
        </button>
      </div>

      {/* The Printable Report Document Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-elevated p-8 sm:p-12 space-y-8 print-page">
        
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xl tracking-tight">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Vestly Equity Portfolio Statement</span>
            </div>
            <p className="text-xs text-slate-500">
              Generated for Certified Public Accountants (CPAs) & Financial Planners
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <div><strong>Client Name:</strong> {user?.name || 'Equity Holder'}</div>
            <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
            <div><strong>Report Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div><strong>Status:</strong> Active Confidential Statement</div>
          </div>
        </div>

        {/* Portfolio Summary KPI Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            1. Portfolio Aggregate Totals
          </h3>

          <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Total Units Granted</span>
              <span className="text-lg font-bold text-slate-900">{totalGranted.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Vested Units</span>
              <span className="text-lg font-bold text-emerald-700">{totalVested.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Est. Cost to Exercise</span>
              <span className="text-lg font-bold text-slate-900 font-mono">${totalExerciseCost.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Est. Current FMV Value</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">${totalVestedValue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Grant Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            2. Individual Grant Schedules & Tax Profile
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Company & ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Units Granted</th>
                  <th className="p-3">Units Vested</th>
                  <th className="p-3">Strike Price</th>
                  <th className="p-3">Current FMV</th>
                  <th className="p-3">Vested Value (EST)</th>
                  <th className="p-3">Grant Date</th>
                  <th className="p-3">Expiration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {grants.map((grant) => (
                  <tr key={grant.id}>
                    <td className="p-3 font-semibold text-slate-900">
                      {grant.company?.name}<br />
                      <span className="text-[10px] text-slate-500 font-normal">{grant.grantIdentifier}</span>
                    </td>
                    <td className="p-3 font-bold">{grant.grantType}</td>
                    <td className="p-3 font-mono">{grant.unitsGranted.toLocaleString()}</td>
                    <td className="p-3 font-mono text-emerald-700 font-bold">{(grant.vestedUnits || 0).toLocaleString()}</td>
                    <td className="p-3 font-mono">{grant.grantType === 'RSU' ? '$0.00' : `$${grant.strikePrice.toFixed(2)}`}</td>
                    <td className="p-3 font-mono">${grant.company?.latestFmvPerShare?.toFixed(2) || '0.00'}</td>
                    <td className="p-3 font-mono font-bold">${(grant.vestedValue || 0).toLocaleString()}</td>
                    <td className="p-3">{new Date(grant.grantDate).toLocaleDateString()}</td>
                    <td className="p-3">{new Date(grant.expirationDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tax Rules & Guidance Notes for the Accountant */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            3. Tax Planning Notes for Accountant
          </h3>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700 leading-relaxed">
            <p>
              • <strong>Incentive Stock Options (ISOs):</strong> The difference between current FMV and strike price on exercised options represents an Alternative Minimum Tax (AMT) preference item under IRC Section 56(b)(3). Any AMT paid may generate a Minimum Tax Credit (MTC) on IRS Form 8801.
            </p>
            <p>
              • <strong>Non-Qualified Stock Options (NSOs):</strong> The exercise spread is subject to ordinary income tax rates, including Federal, State, and FICA/Medicare supplemental withholding under IRC Section 83.
            </p>
            <p>
              • <strong>Restricted Stock Units (RSUs):</strong> 100% of fair market value at vesting date is included in W-2 compensation. Basis equals FMV on vesting date.
            </p>
          </div>
        </div>

        {/* Disclaimer Footer on Report */}
        <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
          <strong>LEGAL & REGULATORY STATEMENT:</strong>
          <p className="leading-normal">
            {COMPLIANCE_DISCLAIMER} All valuation data is based on user-provided 409A appraisals or publicly quoted prices. Vestly assumes no liability for tax filing errors or omissions.
          </p>
        </div>

      </div>
    </div>
  );
}

