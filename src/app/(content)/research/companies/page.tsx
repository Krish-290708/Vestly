'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader, Badge, Button, EmptyState } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { money, compactMoney } from '@/lib/format';

interface CompanyItem {
  id: string;
  name: string;
  ticker?: string;
  isPublic: boolean;
  sector: string;
  description?: string;
  latestValuation?: number;
  latestFmvPerShare: number;
  keyLeadership?: string;
  foundedYear?: number;
  isUserEmployer?: boolean;
  isWatchlisted?: boolean;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function CompaniesPage() {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'private' | 'public'>('all');
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async (query: string = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/companies?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
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
        contextSentence="Verified private venture valuations, 409A appraisals, and comparable public tech market caps."
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
                const slug = slugify(c.name);
                return (
                  <tr key={c.id || c.name} className="hover:bg-sunk/30 transition-colors">
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
                      {money(c.latestFmvPerShare, { showCents: true })}
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
                        {c.id && (
                          <Button
                            variant={c.isWatchlisted ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => handleToggleWatchlist(c.id, c.name)}
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
