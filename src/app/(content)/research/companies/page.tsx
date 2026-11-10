'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader, Badge, Button, EmptyState } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { money, compactMoney } from '@/lib/format';

interface CompanyItem {
  id?: string;
  slug?: string;
  name: string;
  ticker?: string | null;
  isPublic: boolean;
  sector: string;
  description?: string;
  latestValuation?: number | null;
  latestFmvPerShare: number;
  keyLeadership?: string | null;
  foundedYear?: number;
  isUserEmployer?: boolean;
  isWatchlisted?: boolean;
  inDatabase?: boolean;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function CompaniesPage() {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveSearchActive, setLiveSearchActive] = useState(false);
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'private' | 'public'>('all');
  const [loading, setLoading] = useState(true);

  // Wait for a pause in typing before searching, so each keystroke does not hit the live search.
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchCompanies = async (query: string = '', isCancelled: () => boolean = () => false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/companies?q=${encodeURIComponent(query)}`);
      if (res.ok && !isCancelled()) {
        const data = await res.json();
        setCompanies(data.companies || []);
        setLiveSearchActive(!!data.liveSearchActive);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchCompanies(searchQuery, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const handleToggleWatchlist = async (companyId: string, companyName: string) => {
    if (!companyId) return;
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCompanies((prev) =>
          prev.map((c) => (c.id === companyId ? { ...c, isWatchlisted: data.isWatchlisted } : c))
        );
        showToast({
          title: data.isWatchlisted ? 'Watchlisted' : 'Removed',
          message: data.isWatchlisted
            ? `Added ${companyName} to your watchlist.`
            : `Removed ${companyName} from your watchlist.`,
          type: data.isWatchlisted ? 'success' : 'info',
        });
      }
    } catch {
      showToast({ title: 'Error', message: 'Could not update watchlist.', type: 'error' });
    }
  };

  const sectors = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.sector) set.add(c.sector);
    });
    return Array.from(set).sort();
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (sectorFilter !== 'ALL' && c.sector !== sectorFilter) return false;
      if (statusFilter === 'private' && c.isPublic) return false;
      if (statusFilter === 'public' && !c.isPublic) return false;
      return true;
    });
  }, [companies, sectorFilter, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Research"
        title="Companies"
        contextSentence="Browse private and public companies. Figures are samples unless marked as a live quote."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/research/compare">
              <Button variant="secondary" size="sm">
                Compare companies
              </Button>
            </Link>
            <Link href="/research/watchlist">
              <Button variant="ghost" size="sm">
                View watchlist
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter and search bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search companies by name, ticker or sector"
          placeholder="Search company, ticker, or sector..."
          className="w-full sm:w-72 px-3 py-1.5 bg-surface text-ink border border-rule rounded-sm text-xs focus:ring-1 focus:ring-accent focus:outline-none placeholder:text-muted"
        />

        <select
          aria-label="Filter companies by sector"
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-rule rounded-sm bg-surface text-ink text-xs focus:ring-1 focus:ring-accent focus:outline-none"
        >
          <option value="ALL">All sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          aria-label="Filter companies by public or private status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-2.5 py-1.5 border border-rule rounded-sm bg-surface text-ink text-xs focus:ring-1 focus:ring-accent focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>

        <span className="text-muted ml-auto font-mono text-[11px] tabular-nums">
          {filteredCompanies.length} of {companies.length} companies
        </span>
      </div>

      {searchQuery.length >= 2 && (
        <p className="text-[11px] text-muted -mt-2">
          {liveSearchActive
            ? 'Results include live matches for other listed companies. Private companies come from the built-in sample list.'
            : 'Searching the built-in sample list only. Set FINNHUB_API_KEY to also search other listed companies.'}
        </p>
      )}

      {/* Company Table */}
      <div className="border border-rule rounded-sm overflow-hidden bg-surface">
        {filteredCompanies.length === 0 ? (
          <EmptyState
            title="No companies found"
            description="Try adjusting your search terms or filter criteria."
          />
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="bg-sunk border-b border-rule">
              <tr>
                <th className="p-3 font-semibold text-muted">Company</th>
                <th className="p-3 font-semibold text-muted">Status</th>
                <th className="p-3 font-semibold text-muted">Sector</th>
                <th className="p-3 font-semibold text-muted text-right">Valuation / Cap</th>
                <th className="p-3 font-semibold text-muted text-right">409A / Share</th>
                <th className="p-3 font-semibold text-muted">Leadership</th>
                <th className="p-3 font-semibold text-muted text-right w-36"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {filteredCompanies.map((c) => {
                const slug = c.slug || slugify(c.name);
                return (
                  <tr key={c.id || c.slug || c.name} className="hover:bg-sunk/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/research/companies/${slug}`}
                          className="font-medium text-ink hover:text-accent"
                        >
                          {c.name}
                        </Link>
                        {c.ticker && (
                          <span className="font-mono text-[10px] text-muted bg-sunk px-1 py-0.2 border border-rule rounded-sm">
                            {c.ticker}
                          </span>
                        )}
                        {c.isUserEmployer && (
                          <Badge tone="accent">
                            Your grant
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge tone={c.isPublic ? 'info' : 'neutral'}>
                        {c.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted">{c.sector}</td>
                    <td className="p-3 font-mono text-right tabular-nums text-ink font-semibold">
                      {c.latestValuation ? compactMoney(c.latestValuation) : '—'}
                    </td>
                    <td className="p-3 font-mono text-right tabular-nums text-ink font-semibold">
                      {c.latestFmvPerShare > 0 ? money(c.latestFmvPerShare, { showCents: true }) : '—'}
                    </td>
                    <td className="p-3 text-muted truncate max-w-[200px]">
                      {c.keyLeadership || '—'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/research/companies/${slug}`}>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </Link>
                        {c.id && c.inDatabase && (
                          <Button
                            variant={c.isWatchlisted ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => handleToggleWatchlist(c.id as string, c.name)}
                          >
                            {c.isWatchlisted ? 'Following' : 'Follow'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
