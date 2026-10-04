'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Info, 
  RefreshCw, 
  BarChart3, 
  Activity, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';

export default function MarketOverviewPage() {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarket = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/market/indices');
      if (res.ok) {
        const data = await res.json();
        setMarketData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
  }, []);

  const sectors = [
    { name: 'Technology (XLK)', performance: '+1.42%', positive: true },
    { name: 'Financials (XLF)', performance: '+0.65%', positive: true },
    { name: 'Communication Services (XLC)', performance: '+1.18%', positive: true },
    { name: 'Consumer Discretionary (XLY)', performance: '+0.34%', positive: true },
    { name: 'Healthcare (XLV)', performance: '-0.28%', positive: false },
    { name: 'Energy (XLE)', performance: '-1.12%', positive: false },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            Market Overview & Macro Trends
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global market benchmark indices, technology sector performance, and macroeconomic indicators
          </p>
        </div>

        <div className="flex items-center gap-3">
          {marketData && (
            <div className="text-right text-[11px] text-slate-400 hidden sm:block">
              <span>Data Source: <strong>{marketData.source}</strong></span><br />
              <span>Updated: {new Date(marketData.lastUpdated).toLocaleTimeString()}</span>
            </div>
          )}
          <button
            onClick={fetchMarket}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition-colors"
            title="Refresh Quotes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notice / Rate Limit Info */}
      {marketData?.notice && (
        <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{marketData.notice}</span>
        </div>
      )}

      {/* Major Index Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketData?.indices?.map((idx: any) => {
          const isUp = (idx.change || 0) >= 0;
          return (
            <div key={idx.symbol} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>{idx.name}</span>
                <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                  {idx.symbol}
                </span>
              </div>

              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {idx.price ? `$${Number(idx.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
              </div>

              <div className="flex items-center gap-2 text-xs pt-1 border-t border-slate-100">
                <span className={`font-semibold flex items-center gap-0.5 ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isUp ? '+' : ''}{idx.change?.toFixed(2)} ({isUp ? '+' : ''}{idx.changePercent?.toFixed(2)}%)
                </span>
                <span className="text-[10px] text-slate-400">Today</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sector Performance & Macro Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sector Heatmap (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Sector Performance Snapshot
              </h3>
              <p className="text-xs text-slate-500">Relative 1-day momentum across key industry ETFs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {sectors.map(sec => (
              <div key={sec.name} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{sec.name}</span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                  sec.positive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {sec.performance}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Why Market Data Matters Callout (1 col) */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold">Why Macro Data Matters for Your ESOP</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Private company 409A valuations and IPO multiples are directly linked to public software multiples (e.g. BVP Cloud Index, Nasdaq). When public multiples compress, private 409A valuations frequently experience down-rounds or flat marks.
            </p>
          </div>

          <div className="pt-2">
            <a
              href="/research/companies"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 block text-center transition-colors"
            >
              Explore Company Valuations & 409As
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

