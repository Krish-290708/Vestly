'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  TrendingUp, 
  ExternalLink, 
  DollarSign, 
  Calendar, 
  Users, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async (query: string = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/companies?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
        if (!selectedCompany && data.companies?.length > 0) {
          setSelectedCompany(data.companies[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(searchQuery);
  }, [searchQuery]);

  const handleToggleWatchlist = async (companyId: string) => {
    if (!companyId) return;
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCompanies(prev => prev.map(c => 
          c.id === companyId ? { ...c, isWatchlisted: data.isWatchlisted } : c
        ));
        if (selectedCompany?.id === companyId) {
          setSelectedCompany((prev: any) => ({ ...prev, isWatchlisted: data.isWatchlisted }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-7 h-7 text-emerald-400" />
          Company Explorer & Valuations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Search private tech unicorns, latest 409A appraisals, public enterprise market caps, and funding rounds
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by company name, ticker or sector..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
      </div>

      {/* Main Grid: Company List (Left) & Detailed Profile (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Company Cards List (4 cols) */}
        <div className="lg:col-span-4 space-y-3 max-h-[700px] overflow-y-auto pr-1">
          {companies.map(comp => {
            const isSelected = selectedCompany?.name === comp.name;

            return (
              <div
                key={comp.id || comp.name}
                onClick={() => setSelectedCompany(comp)}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-slate-800 text-white border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-lg' 
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{comp.name}</span>
                  <div className="flex items-center gap-1.5">
                    {comp.ticker && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {comp.ticker}
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      comp.isPublic ? 'bg-blue-950 border border-blue-800 text-blue-300' : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                    }`}>
                      {comp.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                  <span>{comp.sector}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ${comp.latestFmvPerShare?.toFixed(2)} / sh
                  </span>
                </div>

                {comp.isUserEmployer && (
                  <div className="mt-2 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>You hold active grants in this company</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detailed Profile View (8 cols) */}
        <div className="lg:col-span-8">
          {selectedCompany ? (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-6 sm:p-8 space-y-6">
              
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">{selectedCompany.name}</h2>
                    {selectedCompany.ticker && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold">
                        {selectedCompany.ticker}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedCompany.isPublic ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {selectedCompany.isPublic ? 'Publicly Listed' : 'Private Venture-Backed'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Sector: <strong className="text-slate-200">{selectedCompany.sector}</strong> • Founded: {selectedCompany.foundedYear || 'N/A'}
                  </div>
                </div>

                {selectedCompany.id && (
                  <button
                    onClick={() => handleToggleWatchlist(selectedCompany.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      selectedCompany.isWatchlisted
                        ? 'bg-amber-950/60 border-amber-700 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {selectedCompany.isWatchlisted ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-amber-400" />
                        <span>Watchlisted</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>Follow Company</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Employer Grant Cross-Link Banner */}
              {selectedCompany.isUserEmployer && (
                <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-xs text-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      You have recorded stock option grants for <strong>{selectedCompany.name}</strong>.
                    </span>
                  </div>
                  <a
                    href="/dashboard"
                    className="font-bold text-emerald-300 hover:text-emerald-200 hover:underline flex items-center gap-1"
                  >
                    <span>View Your Vesting</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Business Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Company Overview
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedCompany.description}
                </p>
              </div>

              {/* Valuation & Capitalization Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Latest Valuation / Cap</span>
                  <span className="font-extrabold text-white text-sm font-mono">
                    {selectedCompany.latestValuation ? `$${(selectedCompany.latestValuation / 1000000000).toFixed(1)}B` : 'Private'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">409A / FMV per Share</span>
                  <span className="font-extrabold text-emerald-400 text-sm font-mono">
                    ${selectedCompany.latestFmvPerShare?.toFixed(2)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Key Leadership</span>
                  <span className="font-semibold text-slate-200 text-xs truncate block">
                    {selectedCompany.keyLeadership || 'Executive Team'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Funding / Status</span>
                  <span className="font-semibold text-slate-200 text-xs truncate block">
                    {selectedCompany.fundingHistory || 'Venture-backed'}
                  </span>
                </div>
              </div>

              {/* Historical Price / Valuation Chart */}
              {selectedCompany.historicalPrices && selectedCompany.historicalPrices.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Valuation History & FMV Trajectory</span>
                    <span className="text-[10px] text-slate-400 font-normal">Indexed per share</span>
                  </h4>

                  <div className="h-48 w-full border border-slate-800 rounded-xl p-2 bg-slate-950/50">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedCompany.historicalPrices} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#ffffff', fontSize: '12px' }}
                          formatter={(val: any) => [`$${val}`, 'FMV / Share']}
                        />
                        <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center text-xs text-slate-400">
              Select a company to view valuation history and profile.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
