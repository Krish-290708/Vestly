'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  PlusCircle, 
  Upload, 
  FileText, 
  Download, 
  Calendar, 
  DollarSign, 
  Clock, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Building,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import GrantIntakeModal from '@/components/grants/GrantIntakeModal';

export default function GrantsPage() {
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedGrantId, setExpandedGrantId] = useState<string | null>(null);
  
  // FMV inline edit state
  const [editingFmvGrantId, setEditingFmvGrantId] = useState<string | null>(null);
  const [newFmvValue, setNewFmvValue] = useState<string>('');
  
  // Document upload state
  const [uploadingGrantId, setUploadingGrantId] = useState<string | null>(null);

  const fetchGrants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/grants');
      if (res.ok) {
        const data = await res.json();
        setGrants(data.grants || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  const handleUpdateFmv = async (grantId: string) => {
    if (!newFmvValue || isNaN(parseFloat(newFmvValue))) return;
    try {
      const res = await fetch(`/api/grants/${grantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latestFmvPerShare: newFmvValue }),
      });
      if (res.ok) {
        setEditingFmvGrantId(null);
        fetchGrants();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGrant = async (grantId: string) => {
    if (!confirm('Are you sure you want to delete this grant and its vesting history?')) return;
    try {
      const res = await fetch(`/api/grants/${grantId}`, { method: 'DELETE' });
      if (res.ok) fetchGrants();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, grantId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('grantId', grantId);

    setUploadingGrantId(grantId);
    try {
      const res = await fetch('/api/grants/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchGrants();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingGrantId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            My Equity Grants
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {grants.length} Total
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Store grant agreements, update latest 409A valuations, and inspect full tranche vesting schedules
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Add Another Grant
        </button>
      </div>

      {/* Grants Cards List */}
      <div className="space-y-4">
        {grants.map((grant) => {
          const isExpanded = expandedGrantId === grant.id;
          const isEditingFmv = editingFmvGrantId === grant.id;

          return (
            <div 
              key={grant.id} 
              className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-card overflow-hidden transition-all"
            >
              {/* Grant Header Bar */}
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">
                      {grant.company?.name || 'Company'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      grant.grantType === 'ISO' 
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' 
                        : grant.grantType === 'NSO' 
                          ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60' 
                          : 'bg-purple-950/60 text-purple-300 border border-purple-800/60'
                    }`}>
                      {grant.grantType}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {grant.grantIdentifier}
                    </span>
                    {grant.earlyExercisable && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                        Early Exercisable
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span>Granted: {new Date(grant.grantDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Vesting Start: {new Date(grant.vestingStartDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Expires: {new Date(grant.expirationDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Primary Numbers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-y sm:border-y-0 sm:border-l border-slate-800 py-3 sm:py-0 sm:pl-6">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Units</span>
                    <span className="font-bold text-white text-sm">
                      {grant.unitsGranted.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400 block">
                      {(grant.vestedUnits || 0).toLocaleString()} vested
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Strike Price</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {grant.grantType === 'RSU' ? '$0.00' : `$${grant.strikePrice.toFixed(2)}`}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ${(grant.vestedExerciseCost || 0).toLocaleString()} cost
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                      Current FMV
                      <button
                        onClick={() => {
                          setEditingFmvGrantId(grant.id);
                          setNewFmvValue(grant.company?.latestFmvPerShare?.toString() || '');
                        }}
                        title="Update 409A / FMV"
                        className="text-slate-400 hover:text-emerald-400"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </span>
                    {isEditingFmv ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <input
                          type="number"
                          step="0.1"
                          value={newFmvValue}
                          onChange={(e) => setNewFmvValue(e.target.value)}
                          className="w-16 px-1.5 py-0.5 text-xs bg-slate-950 border border-emerald-500 rounded font-mono text-white"
                        />
                        <button
                          onClick={() => handleUpdateFmv(grant.id)}
                          className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-mono font-bold text-white text-sm">
                          ${grant.company?.latestFmvPerShare?.toFixed(2) || '0.00'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          409A / share
                        </span>
                      </>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Est. Vested Value</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ${(grant.vestedValue || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 block">
                      ESTIMATE
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={`/calculator?grantId=${grant.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs"
                  >
                    Model Tax
                  </a>
                  <button
                    onClick={() => setExpandedGrantId(isExpanded ? null : grant.id)}
                    className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title={isExpanded ? 'Hide Schedule' : 'Show Schedule'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteGrant(grant.id)}
                    className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Delete Grant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Document Attachment & Notes Bar */}
              <div className="bg-slate-950/60 px-6 py-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-medium">Grant Agreement:</span>
                  {grant.documentName ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <FileText className="w-4 h-4" />
                      <span>{grant.documentName}</span>
                      {grant.documentPath && (
                        <a 
                          href={grant.documentPath} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer text-slate-400 hover:text-white flex items-center gap-1.5 font-medium">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingGrantId === grant.id ? 'Uploading...' : 'Upload PDF Agreement'}</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, grant.id)}
                      />
                    </label>
                  )}
                </div>

                {grant.notes && (
                  <div className="text-slate-400 italic max-w-md truncate">
                    &quot;{grant.notes}&quot;
                  </div>
                )}
              </div>

              {/* Expanded Vesting Schedule Table */}
              {isExpanded && (
                <div className="p-6 bg-slate-950/90 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      Tranche Vesting Schedule ({grant.vestingEvents?.length || 0} Events)
                    </h4>
                    <span className="text-xs text-slate-400">
                      Schedule: {grant.vestingSchedule.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900 shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 sticky top-0 font-semibold text-[11px] border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-2">Tranche Date</th>
                          <th className="px-4 py-2">Units Vested</th>
                          <th className="px-4 py-2">Cumulative Vested</th>
                          <th className="px-4 py-2">Vested Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                        {(grant.vestingEvents || []).map((evt: any, idx: number) => {
                          const isVested = new Date(evt.vestDate) <= new Date();
                          return (
                            <tr key={evt.id || idx} className={isVested ? 'bg-emerald-950/20' : ''}>
                              <td className="px-4 py-2 font-mono text-slate-300">
                                {new Date(evt.vestDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                              <td className="px-4 py-2 font-bold text-white">
                                +{evt.unitsVested.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-slate-300">
                                {evt.cumulativeVested.toLocaleString()}
                              </td>
                              <td className="px-4 py-2">
                                {isVested ? (
                                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> Vested
                                  </span>
                                ) : (
                                  <span className="text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> Scheduled
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {grants.length === 0 && !loading && (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center space-y-4 shadow-card">
            <Layers className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No equity grants added yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your ISO, NSO, or RSU grant details to track vesting and calculate tax liabilities.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              Add Your First Grant
            </button>
          </div>
        )}
      </div>

      <GrantIntakeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchGrants}
      />
    </div>
  );
}
