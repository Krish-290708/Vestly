'use client';

import React, { useState } from 'react';
import { X, Plus, Sparkles, Building, Calendar, DollarSign, FileText, Info } from 'lucide-react';

interface GrantIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GrantIntakeModal({ isOpen, onClose, onSuccess }: GrantIntakeModalProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    ticker: '',
    isPublic: false,
    sector: 'Technology',
    latestFmvPerShare: '15.00',
    grantIdentifier: '',
    grantType: 'ISO',
    unitsGranted: '5000',
    strikePrice: '2.50',
    grantDate: new Date().toISOString().split('T')[0],
    vestingStartDate: new Date().toISOString().split('T')[0],
    cliffMonths: '12',
    vestingSchedule: '4_YEAR_1_YEAR_CLIFF',
    expirationDate: '',
    earlyExercisable: false,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add grant');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Equity Grant</h3>
              <p className="text-xs text-slate-400">Enter details from your Stock Option Agreement or Grant Notice</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Section 1: Employer & Grant Identifier */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              1. Employer & Company Context
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Acme Corp"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Grant Identifier / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Initial Hire ISO, Grant-2023-B"
                  value={formData.grantIdentifier}
                  onChange={(e) => setFormData({ ...formData, grantIdentifier: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Latest 409A / FMV per share ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="15.00"
                  value={formData.latestFmvPerShare}
                  onChange={(e) => setFormData({ ...formData, latestFmvPerShare: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Current fair market valuation per share (can be updated over time)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ticker (if publicly traded)
                </label>
                <input
                  type="text"
                  placeholder="Optional, e.g. AAPL"
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Units, Type & Strike */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              2. Grant Units & Price
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Grant Type *
                </label>
                <select
                  value={formData.grantType}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    grantType: e.target.value,
                    strikePrice: e.target.value === 'RSU' ? '0' : formData.strikePrice 
                  })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="ISO">ISO (Incentive Stock Option)</option>
                  <option value="NSO">NSO (Non-Qualified Option)</option>
                  <option value="RSU">RSU (Restricted Stock Unit)</option>
                  <option value="ESPP">ESPP (Stock Purchase Plan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Total Units Granted *
                </label>
                <input
                  type="number"
                  required
                  placeholder="10000"
                  value={formData.unitsGranted}
                  onChange={(e) => setFormData({ ...formData, unitsGranted: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Strike Price ($) {formData.grantType === 'RSU' && '(N/A)'}
                </label>
                <input
                  type="number"
                  step="0.001"
                  disabled={formData.grantType === 'RSU'}
                  placeholder="2.50"
                  value={formData.grantType === 'RSU' ? '0.00' : formData.strikePrice}
                  onChange={(e) => setFormData({ ...formData, strikePrice: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-900 disabled:text-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="earlyExercisable"
                checked={formData.earlyExercisable}
                onChange={(e) => setFormData({ ...formData, earlyExercisable: e.target.checked })}
                className="w-4 h-4 text-emerald-500 rounded bg-slate-950 border-slate-700 focus:ring-emerald-500"
              />
              <label htmlFor="earlyExercisable" className="text-xs text-slate-300 cursor-pointer">
                <strong>Grant permits early exercise</strong> (allows buying unvested shares + enables Section 83(b) filing)
              </label>
            </div>
          </div>

          {/* Section 3: Vesting Schedule */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              3. Vesting Schedule & Dates
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Grant Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.grantDate}
                  onChange={(e) => setFormData({ ...formData, grantDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Vesting Commencement Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.vestingStartDate}
                  onChange={(e) => setFormData({ ...formData, vestingStartDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Vesting Schedule Preset
                </label>
                <select
                  value={formData.vestingSchedule}
                  onChange={(e) => {
                    const sched = e.target.value;
                    setFormData({
                      ...formData,
                      vestingSchedule: sched,
                      cliffMonths: sched === '4_YEAR_1_YEAR_CLIFF' ? '12' : '0',
                    });
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="4_YEAR_1_YEAR_CLIFF">Standard: 4-Year with 1-Year Cliff (25% at 1 yr, 1/48 monthly)</option>
                  <option value="3_YEAR_MONTHLY">3-Year Monthly (1/36th monthly, no cliff)</option>
                  <option value="4_YEAR_MONTHLY_NO_CLIFF">4-Year Monthly (1/48th monthly, no cliff)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cliff Period (months)
                </label>
                <input
                  type="number"
                  min="0"
                  max="48"
                  value={formData.cliffMonths}
                  onChange={(e) => setFormData({ ...formData, cliffMonths: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Initial engineering hire grant, approved at Q1 board meeting"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {loading ? 'Generating Schedule...' : 'Save & Calculate Grant'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
