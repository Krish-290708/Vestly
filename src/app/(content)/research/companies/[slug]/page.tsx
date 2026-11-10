'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader, Badge, Button, Callout, Dialog, Field } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { money, compactMoney, units } from '@/lib/format';

interface CompanyDetailData {
  company: {
    id: string;
    slug: string;
    name: string;
    ticker?: string;
    isPublic: boolean;
    sector: string;
    description?: string;
    latestValuation?: number;
    latestFmvPerShare: number;
    priceSource?: 'live' | 'sample' | 'none';
    lastFmvUpdateDate?: string;
    foundedYear?: number;
    keyLeadership?: string;
    fundingHistory?: string;
    metrics?: Record<string, any>;
    historicalPrices?: Array<{ date: string; price: number }>;
    fundingRounds?: Array<{
      round: string;
      date: string;
      raisedFormatted: string;
      valuationFormatted: string;
      leadInvestor: string;
    }>;
    isWatchlisted: boolean;
    watchlistNote?: string | null;
  };
  userEquityOverlay?: {
    hasGrants: boolean;
    grantCount: number;
    primaryGrantId: string;
    totalUnits: number;
    vestedUnits: number;
    exerciseCost: number;
    vestedValue: number;
    netValue: number;
    grants: Array<{
      id: string;
      grantIdentifier: string;
      grantType: string;
      unitsGranted: number;
      vestedUnits: number;
      strikePrice: number;
    }>;
  } | null;
}

export default function CompanyDetailPage({ params }: { params: { slug: string } }) {
  const { showToast } = useToast();
  const [data, setData] = useState<CompanyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Watchlist note dialog state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/companies/${params.slug}`);
      if (!res.ok) throw new Error('Company not found');
      const json = await res.json();
      setData(json);
      setNoteText(json.company.watchlistNote || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load company');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [params.slug]);

  const handleToggleWatchlist = async () => {
    if (!data?.company.id) return;
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: data.company.id }),
      });
      if (res.ok) {
        const json = await res.json();
        setData((prev) =>
          prev
            ? {
                ...prev,
                company: {
                  ...prev.company,
                  isWatchlisted: json.isWatchlisted,
                },
              }
            : null
        );
        showToast({
          title: json.isWatchlisted ? 'Watchlisted' : 'Removed',
          message: json.isWatchlisted
            ? `Added ${data.company.name} to your watchlist.`
            : `Removed ${data.company.name} from your watchlist.`,
          type: json.isWatchlisted ? 'success' : 'info',
        });
      }
    } catch {
      showToast({ title: 'Error', message: 'Could not update watchlist.', type: 'error' });
    }
  };

  const handleSaveNote = async () => {
    if (!data?.company.id) return;
    setSavingNote(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: data.company.id, note: noteText }),
      });
      if (res.ok) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                company: { ...prev.company, watchlistNote: noteText },
              }
            : null
        );
        setIsNoteModalOpen(false);
        showToast({ title: 'Saved', message: 'Watchlist note updated.', type: 'success' });
      } else {
        showToast({ title: 'Error', message: 'Could not save note.', type: 'error' });
      }
    } catch {
      showToast({ title: 'Error', message: 'Network error saving note.', type: 'error' });
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-muted">
        Loading company profile...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4 py-12">
        <Callout variant="warn">
          {error || 'Company not found.'}
        </Callout>
        <Link href="/research/companies">
          <Button variant="secondary" size="sm">
            ← Back to companies
          </Button>
        </Link>
      </div>
    );
  }

  const { company, userEquityOverlay } = data;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="Company research"
        title={company.name}
        contextSentence={company.description || `${company.name} profile and capital structure metrics.`}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/research/compare?companies=${company.slug}`}>
              <Button variant="secondary" size="sm">
                Compare
              </Button>
            </Link>
            <Button
              variant={company.isWatchlisted ? 'primary' : 'ghost'}
              size="sm"
              onClick={handleToggleWatchlist}
            >
              {company.isWatchlisted ? 'Following' : 'Follow'}
            </Button>
            {company.isWatchlisted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNoteModalOpen(true)}
              >
                {company.watchlistNote ? 'Edit note' : 'Add note'}
              </Button>
            )}
          </div>
        }
      />

      {/* Watchlist note banner if present */}
      {company.watchlistNote && (
        <div className="p-3.5 border border-rule rounded-sm bg-sunk/40 text-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-semibold text-ink text-[11px] uppercase tracking-wider block">
              Your watchlist note
            </span>
            <span className="text-muted">{company.watchlistNote}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsNoteModalOpen(true)}>
            Edit
          </Button>
        </div>
      )}

      {/* User Equity Overlay Card (if user holds equity in this company) */}
      {userEquityOverlay?.hasGrants && (
        <section className="border border-rule rounded-sm bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div className="flex items-center gap-2">
              <Badge tone="accent">Active equity holder</Badge>
              <h2 className="font-serif text-sm font-semibold text-ink">
                Your holdings in {company.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Link
                href={`/grants/${userEquityOverlay.primaryGrantId}`}
                className="font-medium text-ink hover:text-accent underline underline-offset-2"
              >
                View grant ledger
              </Link>
              <span className="text-muted">•</span>
              <Link
                href={`/calculator?grant=${userEquityOverlay.primaryGrantId}`}
                className="font-medium text-ink hover:text-accent underline underline-offset-2"
              >
                Run exit scenario
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted block text-[11px]">Total granted</span>
              <span className="font-mono text-base font-bold text-ink tabular-nums">
                {units(userEquityOverlay.totalUnits)}
              </span>
            </div>
            <div>
              <span className="text-muted block text-[11px]">Vested units</span>
              <span className="font-mono text-base font-bold text-ink tabular-nums">
                {units(userEquityOverlay.vestedUnits)}
              </span>
            </div>
            <div>
              <span className="text-muted block text-[11px]">Vested 409A value</span>
              <span className="font-mono text-base font-bold text-ink tabular-nums">
                {money(userEquityOverlay.vestedValue)}
              </span>
            </div>
            <div>
              <span className="text-muted block text-[11px]">Estimated net pre-tax</span>
              <span className={`font-mono text-base font-bold tabular-nums ${userEquityOverlay.netValue >= 0 ? 'text-gain' : 'text-loss'}`}>
                {money(userEquityOverlay.netValue)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Key Company Metrics */}
      <section className="space-y-3">
        <h2 className="font-serif text-sm font-semibold text-ink">
          Capitalization and valuation metrics
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border border-rule rounded-sm bg-surface text-xs">
          <div>
            <span className="text-muted block text-[11px]">Latest valuation / cap</span>
            <span className="font-mono text-sm font-bold text-ink tabular-nums">
              {company.latestValuation ? compactMoney(company.latestValuation) : company.isPublic ? '—' : 'Private'}
            </span>
          </div>

          <div>
            <span className="text-muted block text-[11px]">{company.isPublic ? 'Share price' : 'Latest 409A / FMV'}</span>
            <span className="font-mono text-sm font-bold text-ink tabular-nums">
              {company.latestFmvPerShare > 0 ? money(company.latestFmvPerShare, { showCents: true }) : '—'}
            </span>
            <span className="text-muted block text-[10px]">
              {company.priceSource === 'live'
                ? 'Live quote'
                : company.priceSource === 'sample'
                  ? 'Sample figure, not a live quote'
                  : company.isPublic
                    ? 'Set a market-data key for live quotes'
                    : 'Not publicly available'}
            </span>
          </div>

          <div>
            <span className="text-muted block text-[11px]">Status</span>
            <span className="font-medium text-ink">
              {company.isPublic ? 'Publicly listed' : 'Private venture-backed'}
            </span>
          </div>

          <div>
            <span className="text-muted block text-[11px]">Sector</span>
            <span className="font-medium text-ink truncate block">
              {company.sector}
            </span>
          </div>

          <div>
            <span className="text-muted block text-[11px]">Founded</span>
            <span className="font-mono tabular-nums text-ink">
              {company.foundedYear || '—'}
            </span>
          </div>

          <div>
            <span className="text-muted block text-[11px]">Key leadership</span>
            <span className="text-ink truncate block">
              {company.keyLeadership || '—'}
            </span>
          </div>

          <div>
            <span className="text-muted block text-[11px]">Common/Preferred spread</span>
            <span className="font-mono tabular-nums text-ink">
              ~30% discount
            </span>
          </div>

          <div>
            <span className="text-muted block text-[11px]">Funding summary</span>
            <span className="text-ink truncate block">
              {company.fundingHistory || 'Venture-backed'}
            </span>
          </div>
        </div>
      </section>

      {/* Funding Rounds Timeline Table */}
      {company.fundingRounds && company.fundingRounds.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-sm font-semibold text-ink">
              Funding rounds and valuation trajectory
            </h2>
            <span className="text-[11px] text-muted">
              Historical venture capital rounds
            </span>
          </div>

          <div className="border border-rule rounded-sm overflow-hidden bg-surface">
            <table className="w-full text-xs text-left">
              <thead className="bg-sunk border-b border-rule">
                <tr>
                  <th className="p-3 font-semibold text-muted">Round</th>
                  <th className="p-3 font-semibold text-muted">Date</th>
                  <th className="p-3 font-semibold text-muted text-right">Capital raised</th>
                  <th className="p-3 font-semibold text-muted text-right">Post-money valuation</th>
                  <th className="p-3 font-semibold text-muted">Lead investor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {company.fundingRounds.map((r) => (
                  <tr key={r.round} className="hover:bg-sunk/30 transition-colors">
                    <td className="p-3 font-medium text-ink">{r.round}</td>
                    <td className="p-3 font-mono text-[11px] text-muted tabular-nums">{r.date}</td>
                    <td className="p-3 font-mono text-right tabular-nums text-ink">{r.raisedFormatted}</td>
                    <td className="p-3 font-mono text-right tabular-nums text-ink font-semibold">{r.valuationFormatted}</td>
                    <td className="p-3 text-muted">{r.leadInvestor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Historical FMV trajectory table */}
      {company.historicalPrices && company.historicalPrices.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-sm font-semibold text-ink">
            Historical 409A share price progression
          </h2>

          <div className="border border-rule rounded-sm overflow-hidden bg-surface">
            <table className="w-full text-xs text-left">
              <thead className="bg-sunk border-b border-rule">
                <tr>
                  <th className="p-2.5 font-semibold text-muted">Appraisal date</th>
                  <th className="p-2.5 font-semibold text-muted text-right">409A FMV / share</th>
                  <th className="p-2.5 font-semibold text-muted text-right">Change from previous</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {company.historicalPrices.map((hp, idx) => {
                  const prev = idx > 0 ? company.historicalPrices![idx - 1].price : hp.price;
                  const diff = hp.price - prev;
                  const diffPct = prev > 0 ? (diff / prev) * 100 : 0;
                  const isUp = diff >= 0;

                  return (
                    <tr key={hp.date} className="hover:bg-sunk/30 transition-colors">
                      <td className="p-2.5 font-mono tabular-nums text-ink">{hp.date}</td>
                      <td className="p-2.5 font-mono text-right tabular-nums text-ink font-semibold">
                        {money(hp.price, { showCents: true })}
                      </td>
                      <td className="p-2.5 font-mono text-right tabular-nums">
                        {idx === 0 ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <span className={isUp ? 'text-gain' : 'text-loss'}>
                            {isUp ? '+' : ''}{money(diff, { showCents: true })} ({isUp ? '+' : ''}{diffPct.toFixed(1)}%)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Note dialog */}
      <Dialog
        open={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={`Watchlist note for ${company.name}`}
      >
        <div className="space-y-4 text-xs">
          <Field label="Personal notes (e.g. target employer, expected Series E valuation)">
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Evaluating Series D offer; 4-year vesting with 1-year cliff; 90-day PTEW"
              className="w-full px-3 py-2 bg-surface text-ink border border-rule rounded-sm text-xs focus:ring-1 focus:ring-accent focus:outline-none"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2 border-t border-rule">
            <Button variant="ghost" size="sm" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveNote} disabled={savingNote}>
              {savingNote ? 'Saving...' : 'Save note'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
