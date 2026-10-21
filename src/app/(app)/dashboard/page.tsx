'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Layers, 
  PlusCircle, 
  ArrowUpRight, 
  AlertTriangle,
  ChevronRight,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import GrantIntakeModal from '@/components/grants/GrantIntakeModal';
import PortfolioMetricsGrid from '@/components/dashboard/PortfolioMetricsGrid';
import { buildCombinedTimeline } from '@/lib/calculations/vesting';

export default function DashboardPage() {
  const [grants, setGrants] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [grantsRes, actionsRes] = await Promise.all([
        fetch('/api/grants'),
        fetch('/api/actions')
      ]);

      if (grantsRes.ok) {
        const data = await grantsRes.json();
        setGrants(data.grants || []);
      }
      if (actionsRes.ok) {
        const actData = await actionsRes.json();
        setReminders(actData.reminders || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Aggregated calculations
  const totalGranted = grants.reduce((sum, g) => sum + (g.unitsGranted || 0), 0);
  const totalVested = grants.reduce((sum, g) => sum + (g.vestedUnits || 0), 0);
  const totalUnvested = Math.max(0, totalGranted - totalVested);
  const percentVested = totalGranted > 0 ? Math.round((totalVested / totalGranted) * 100) : 0;

  const totalVestedValue = grants.reduce((sum, g) => sum + (g.vestedValue || 0), 0);
  const totalExerciseCost = grants.reduce((sum, g) => sum + (g.vestedExerciseCost || 0), 0);
  const netEstimatedEquity = Math.max(0, totalVestedValue - totalExerciseCost);

  // Find next upcoming vest event across all grants
  const nextVestEvent = React.useMemo(() => {
    let next: { date: Date; units: number; companyName: string; grantIdentifier: string } | null = null;
    const now = new Date();

    for (const g of grants) {
      if (g.vestingEvents) {
        for (const evt of g.vestingEvents) {
          const d = new Date(evt.vestDate);
          if (d > now) {
            if (!next || d < next.date) {
              next = {
                date: d,
                units: evt.unitsVested,
                companyName: g.company?.name || 'Company',
                grantIdentifier: g.grantIdentifier,
              };
            }
          }
        }
      }
    }
    return next;
  }, [grants]);

  // Recharts timeline
  const timelineData = buildCombinedTimeline(
    grants.map(g => ({
      id: g.id,
      grantIdentifier: g.grantIdentifier,
      companyName: g.company?.name || '',
      unitsGranted: g.unitsGranted,
      vestingEvents: g.vestingEvents || [],
    }))
  );

  const urgentTasks = reminders.filter(r => r.status === 'PENDING' && (r.urgency === 'CRITICAL' || r.urgency === 'HIGH')).slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Equity Portfolio Dashboard
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {grants.length} Active {grants.length === 1 ? 'Grant' : 'Grants'}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time vesting progression, exercise costs, and FMV valuation models
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            title="Refresh metrics"
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Grant
          </button>
        </div>
      </div>

      {/* Urgent Alert Banner (if any critical tasks like 83(b) or PTEW) */}
      {urgentTasks.length > 0 && (
        <div className="bg-amber-950/40 border-l-4 border-amber-500 p-4 rounded-r-xl border-y border-r border-amber-800/40 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Action Required: Urgent Equity Milestones</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {urgentTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/30 text-xs">
                <div>
                  <div className="font-semibold text-white">{task.title}</div>
                  <div className="text-[11px] text-slate-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()} • {task.grant?.company?.name || 'General'}
                  </div>
                </div>
                <a
                  href="/actions"
                  className="px-2.5 py-1 text-[11px] font-bold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shrink-0"
                >
                  Review
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <PortfolioMetricsGrid
        totalVestedValue={totalVestedValue}
        netEstimatedEquity={netEstimatedEquity}
        percentVested={percentVested}
        totalVested={totalVested}
        totalGranted={totalGranted}
        totalUnvested={totalUnvested}
        totalExerciseCost={totalExerciseCost}
        nextVestEvent={nextVestEvent}
      />

      {/* Main Content Area: Timeline Chart + Quick Calculator Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vesting Timeline Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Cumulative Vesting Timeline
              </h3>
              <p className="text-xs text-slate-400">
                Projected accumulation of vested shares over the 48-month horizon
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              Target: {totalGranted.toLocaleString()} units
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vestGradientDark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 11, fill: '#94a3b8' }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#94a3b8' }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0b1120', 
                      borderRadius: '8px', 
                      border: '1px solid #1e293b', 
                      color: '#ffffff',
                      fontSize: '12px' 
                    }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()} units`, 'Vested']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulativeVested" 
                    stroke="#10b981" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#vestGradientDark)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Add grants to render the portfolio vesting progression chart.
              </div>
            )}
          </div>
        </div>

        {/* Action & Strategy Quick Card (1 col) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 text-white rounded-2xl p-6 border border-slate-800 shadow-card flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Interactive Tax Modeling</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Calculate ISO Alternative Minimum Tax (AMT) and compare side-by-side scenarios: <em>Exercise & Hold</em> vs <em>Cashless at Exit</em>.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Hold Period Strategy:</span>
                <span className="font-semibold text-emerald-400">Long-Term Cap Gains</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Modeled Exit Valuation:</span>
                <span className="font-semibold text-white">2.5× to 5× multiple</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <a
              href="/calculator"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Launch Equity Calculator</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href="/scenarios"
              className="w-full py-2 px-4 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Explore 83(b) & Scenarios</span>
            </a>
          </div>
        </div>

      </div>

      {/* Active Grants List */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Your Equity Grants</h3>
            <p className="text-xs text-slate-400">All registered grants across employers</p>
          </div>
          <a href="/grants" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            <span>Manage & Upload Agreements</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {grants.length > 0 ? (
          <div className="divide-y divide-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-6 py-3">Company & Grant</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Units & Vested</th>
                  <th className="px-4 py-3">Strike Price</th>
                  <th className="px-4 py-3">Current FMV</th>
                  <th className="px-4 py-3">Estimated Vested Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
                {grants.map((grant) => (
                  <tr key={grant.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">
                        {grant.company?.name || 'Company'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {grant.grantIdentifier}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        grant.grantType === 'ISO' 
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' 
                          : grant.grantType === 'NSO' 
                            ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60' 
                            : 'bg-purple-950/60 text-purple-300 border border-purple-800/60'
                      }`}>
                        {grant.grantType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">
                        {(grant.vestedUnits || 0).toLocaleString()} / {grant.unitsGranted.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {grant.percentVested}% vested
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono">
                      {grant.grantType === 'RSU' ? '$0.00' : `$${grant.strikePrice.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-4 font-mono">
                      ${grant.company?.latestFmvPerShare?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-4 font-semibold text-emerald-400">
                      ${(grant.vestedValue || 0).toLocaleString()}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">EST.</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                        {grant.status === 'FULLY_VESTED' ? 'Fully Vested' : 'Vesting'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <a
                        href={`/calculator?grantId=${grant.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
                      >
                        Model Tax
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h4 className="text-base font-bold text-white">No equity grants added yet</h4>
              <p className="text-xs text-slate-400">
                Add your first stock option grant to unlock vesting projections, AMT calculation, and deadline tracking.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Add Your First Grant
            </button>
          </div>
        )}
      </div>

      {/* Grant Intake Modal */}
      <GrantIntakeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
