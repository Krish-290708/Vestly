'use client';

import React, { useState } from 'react';
import { 
  PieChart as PieIcon, 
  Layers, 
  TrendingUp, 
  ShieldAlert, 
  Users, 
  Building, 
  DollarSign, 
  CheckCircle2, 
  Sparkles,
  BarChart3
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export default function PoolPage() {
  const [selectedCompany, setSelectedCompany] = useState('Stripe');

  // Realistic corporate ESOP pool aggregate data
  const poolData = {
    companyName: 'Stripe, Inc.',
    valuation: '$65 Billion',
    totalAuthorizedShares: 100000000,
    totalPoolShares: 15000000, // 15% ESOP pool
    grantedShares: 11200000,
    unallocatedReserve: 3800000,
    overhangPercent: 11.2,
    burnRatePerQuarter: 450000,
    runwayQuarters: 8.4,
  };

  const poolDistribution = [
    { name: 'Active Granted Options', value: 8500000, color: '#10b981' },
    { name: 'Active Vested RSUs', value: 2700000, color: '#6366f1' },
    { name: 'Unallocated Pool Reserve', value: 3800000, color: '#334155' },
  ];

  const departmentBreakdown = [
    { dept: 'Engineering & Infrastructure', units: 6200000, percent: '55%' },
    { dept: 'Product & UX Design', units: 2240000, percent: '20%' },
    { dept: 'Sales & Enterprise GTM', units: 1680000, percent: '15%' },
    { dept: 'Operations & General Admin', units: 1080000, percent: '10%' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Corporate Equity & HR View</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Company ESOP Pool & Cap Table Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregate option pool allocation, equity overhang ratios, and department distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Company:</span>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Stripe">Stripe (15.0% Pool)</option>
            <option value="Databricks">Databricks (12.5% Pool)</option>
            <option value="Figma">Figma (14.0% Pool)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-card space-y-2">
          <span className="text-slate-400 text-xs font-medium block">Total Authorized ESOP Pool</span>
          <div className="text-2xl font-extrabold text-white font-mono">
            {poolData.totalPoolShares.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">shares</span>
          </div>
          <div className="text-xs text-emerald-400 font-semibold pt-1 border-t border-slate-800">
            15.0% of Fully Diluted Shares
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-card space-y-2">
          <span className="text-slate-400 text-xs font-medium block">Allocated / Granted Units</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {poolData.grantedShares.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
            74.7% of authorized pool granted
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-card space-y-2">
          <span className="text-slate-400 text-xs font-medium block">Unallocated Reserve</span>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">
            {poolData.unallocatedReserve.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
            Available for new hires & refreshes
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-card space-y-2">
          <span className="text-slate-400 text-xs font-medium block">Estimated Pool Runway</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            ~8 Quarters
          </div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
            At ~450k shares/quarter burn rate
          </div>
        </div>
      </div>

      {/* Main Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visual 1: Pie Chart Distribution */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-card space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Pool Allocation Breakdown
            </h3>
            <p className="text-xs text-slate-400">Granted options vs vested RSUs vs remaining pool reserve</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={poolDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {poolDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1120', borderRadius: '8px', border: '1px solid #1e293b', color: '#ffffff', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} shares`, 'Quantity']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs text-center">
            {poolDistribution.map(item => (
              <div key={item.name} className="space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] text-slate-300 font-medium truncate">{item.name}</span>
                </div>
                <div className="font-mono font-bold text-white text-xs">{item.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual 2: Department Allocation Breakdown */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-card space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Department Allocation Distribution
            </h3>
            <p className="text-xs text-slate-400">Cumulative option grants by functional organization</p>
          </div>

          <div className="space-y-3 pt-2">
            {departmentBreakdown.map((item) => (
              <div key={item.dept} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-200">{item.dept}</span>
                  <span className="font-mono font-bold text-emerald-400">{item.percent} ({item.units.toLocaleString()} units)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all" 
                    style={{ width: item.percent }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
            <strong>HR Equity Note:</strong> Technical roles (Engineering, Product, Architecture) represent 75% of cumulative equity distributions, consistent with Tier-1 Silicon Valley tech venture benchmarks.
          </div>
        </div>

      </div>
    </div>
  );
}

