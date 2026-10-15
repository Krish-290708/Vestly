'use client';

import React from 'react';
import { DollarSign, Calendar, Clock } from 'lucide-react';

export interface NextVestEventInfo {
  date: Date;
  units: number;
  companyName: string;
  grantIdentifier: string;
}

interface PortfolioMetricsGridProps {
  totalVestedValue: number;
  netEstimatedEquity: number;
  percentVested: number;
  totalVested: number;
  totalGranted: number;
  totalUnvested: number;
  totalExerciseCost: number;
  nextVestEvent: NextVestEventInfo | null;
}

export default function PortfolioMetricsGrid({
  totalVestedValue,
  netEstimatedEquity,
  percentVested,
  totalVested,
  totalGranted,
  totalUnvested,
  totalExerciseCost,
  nextVestEvent,
}: PortfolioMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Vested Value */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-card space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Estimated Vested Value</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            ESTIMATE
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white">
          ${totalVestedValue.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1 border-t border-slate-800">
          <span className="text-emerald-400 font-semibold">
            ${netEstimatedEquity.toLocaleString()}
          </span>
          <span>net of exercise cost</span>
        </div>
      </div>

      {/* Metric 2: Total Units & Vesting Progress */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-card space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Vested / Total Units</span>
          <span className="font-bold text-emerald-400">{percentVested}%</span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white">
          {totalVested.toLocaleString()}{' '}
          <span className="text-sm font-normal text-slate-500">
            / {totalGranted.toLocaleString()}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${percentVested}%` }}
          />
        </div>
        <div className="text-[11px] text-slate-400">
          {totalUnvested.toLocaleString()} units unvested
        </div>
      </div>

      {/* Metric 3: Cost to Exercise */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-card space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Cost to Exercise Vested</span>
          <DollarSign className="w-4 h-4 text-slate-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
          ${totalExerciseCost.toLocaleString()}
        </div>
        <div className="text-xs text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
          <span>Strike cash needed</span>
          <a href="/calculator" className="text-emerald-400 font-semibold hover:underline">
            Model taxes →
          </a>
        </div>
      </div>

      {/* Metric 4: Next Vesting Event */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-card space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Next Vesting Event</span>
          <Calendar className="w-4 h-4 text-slate-500" />
        </div>
        {nextVestEvent ? (
          <>
            <div className="text-xl sm:text-2xl font-bold text-white">
              +{nextVestEvent.units.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">shares</span>
            </div>
            <div className="text-xs text-slate-300 font-medium truncate">
              {nextVestEvent.companyName}
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {new Date(nextVestEvent.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </>
        ) : (
          <div className="py-2 text-xs text-slate-500">
            No pending vesting events scheduled
          </div>
        )}
      </div>
    </div>
  );
}

