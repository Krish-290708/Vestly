'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader, Badge, Button, EmptyState, Dialog, Field } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { money, compactMoney, date } from '@/lib/format';

interface WatchlistItem {
  id: string;
  note?: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    ticker?: string;
    sector: string;
    isPublic: boolean;
    description?: string;
    latestValuation?: number;
    latestFmvPerShare: number;
  };
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function WatchlistPage() {
  const { showToast } = useToast();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Note editing state
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/watchlist');
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data.watchlist || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (companyId: string, companyName: string) => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      if (res.ok) {
        setWatchlist((prev) => prev.filter((item) => item.company.id !== companyId));
        showToast({
          title: 'Removed',
          message: `Removed ${companyName} from your watchlist.`,
          type: 'info',
        });
      }
    } catch {
      showToast({ title: 'Error', message: 'Could not remove company.', type: 'error' });
    }
  };

  const handleSaveNote = async () => {
    if (!editingItem) return;
    setSavingNote(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: editingItem.company.id,
          note: noteDraft,
        }),
      });
      if (res.ok) {
        setWatchlist((prev) =>
          prev.map((item) =>
            item.id === editingItem.id ? { ...item, note: noteDraft } : item
          )
        );
        setEditingItem(null);
        showToast({ title: 'Saved', message: 'Note updated.', type: 'success' });
      } else {
        showToast({ title: 'Error', message: 'Could not save note.', type: 'error' });
      }
    } catch {
      showToast({ title: 'Error', message: 'Network error saving note.', type: 'error' });
    } finally {
      setSavingNote(false);
    }
  };

  const contextSentence =
    watchlist.length === 0
      ? 'No companies followed yet. Follow target employers to track valuation updates.'
      : `Monitoring ${watchlist.length} followed ${watchlist.length !== 1 ? 'companies' : 'company'} for 409A and secondary pricing shifts.`;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Research"
        title="Watchlist"
        contextSentence={contextSentence}
        actions={
          <Link href="/research/companies">
            <Button variant="primary" size="sm">
              + Find companies
            </Button>
          </Link>
        }
      />

      {watchlist.length === 0 && !loading ? (
        <EmptyState
          title="Your watchlist is empty"
          description="Follow target employers, competitors, or secondary market candidates to track valuation changes and maintain personal diligence notes."
          action={
            <Link href="/research/companies">
              <Button variant="primary" size="sm">
                Explore companies
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="border border-rule rounded-sm overflow-hidden bg-surface">
          <table className="w-full text-xs text-left">
            <thead className="bg-sunk border-b border-rule">
              <tr>
                <th className="p-3 font-semibold text-muted">Company</th>
                <th className="p-3 font-semibold text-muted">Status</th>
                <th className="p-3 font-semibold text-muted">Sector</th>
                <th className="p-3 font-semibold text-muted text-right">409A / Share</th>
                <th className="p-3 font-semibold text-muted text-right">Valuation / Cap</th>
                <th className="p-3 font-semibold text-muted">Personal note</th>
                <th className="p-3 font-semibold text-muted text-right w-44"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {watchlist.map((item) => {
                const { company } = item;
                const slug = slugify(company.name);

                return (
                  <tr key={item.id} className="hover:bg-sunk/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/research/companies/${slug}`}
                          className="font-medium text-ink hover:text-accent font-serif"
                        >
                          {company.name}
                        </Link>
                        {company.ticker && (
                          <span className="font-mono text-[10px] text-muted bg-sunk px-1 py-0.2 border border-rule rounded-sm">
                            {company.ticker}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <Badge tone={company.isPublic ? 'info' : 'neutral'}>
                        {company.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </td>

                    <td className="p-3 text-muted">{company.sector}</td>

                    <td className="p-3 font-mono text-right tabular-nums text-ink font-semibold">
                      {money(company.latestFmvPerShare, { showCents: true })}
                    </td>

                    <td className="p-3 font-mono text-right tabular-nums text-ink font-semibold">
                      {company.latestValuation ? compactMoney(company.latestValuation) : 'Private'}
                    </td>

                    <td className="p-3 text-muted max-w-xs">
                      {item.note ? (
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{item.note}</span>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setNoteDraft(item.note || '');
                            }}
                            className="text-[11px] text-accent hover:underline shrink-0"
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setNoteDraft('');
                          }}
                          className="text-[11px] text-muted hover:text-ink underline underline-offset-2"
                        >
                          + Add note
                        </button>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/research/companies/${slug}`}>
                          <Button variant="ghost" size="sm">
                            Profile
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(company.id, company.name)}
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Note Modal */}
      <Dialog
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={editingItem ? `Diligence note: ${editingItem.company.name}` : ''}
      >
        {editingItem && (
          <div className="space-y-4 text-xs">
            <Field label="Note content (saved with your account)">
              <textarea
                rows={3}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="e.g. Received offer for Senior Staff role; 4-year vesting; tracking Series E valuation mark."
                className="w-full px-3 py-2 bg-surface text-ink border border-rule rounded-sm text-xs focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-rule">
              <Button variant="ghost" size="sm" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveNote} disabled={savingNote}>
                {savingNote ? 'Saving...' : 'Save note'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
