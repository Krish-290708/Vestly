'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageHeader, Badge, Button, Select } from '@/components/ui';
import { money, compactMoney, units } from '@/lib/format';

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  ticker?: string;
  isPublic: boolean;
  sector: string;
  latestValuation?: number;
  latestFmvPerShare: number;
  foundedYear?: number;
  keyLeadership?: string;
  fundingHistory?: string;
  isUserEmployer?: boolean;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function CompanyComparisonPage() {
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected companies (up to 3)
  const [companyA, setCompanyA] = useState<string>('comp_stripe');
  const [companyB, setCompanyB] = useState<string>('comp_databricks');
  const [companyC, setCompanyC] = useState<string>('');

  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch('/api/market/companies');
        if (res.ok) {
          const data = await res.json();
          const list: CompanyData[] = (data.companies || []).map((c: any) => ({
            ...c,
            slug: slugify(c.name),
          }));
          setCompanies(list);

          // Handle initial query param
          const queryParam = searchParams.get('companies');
          if (queryParam) {
            const parts = queryParam.split(',').map((p) => p.trim().toLowerCase());
            if (parts[0]) {
              const foundA = list.find((c) => c.slug === parts[0] || c.id === parts[0]);
              if (foundA) setCompanyA(foundA.id);
            }
            if (parts[1]) {
              const foundB = list.find((c) => c.slug === parts[1] || c.id === parts[1]);
              if (foundB) setCompanyB(foundB.id);
            }
            if (parts[2]) {
              const foundC = list.find((c) => c.slug === parts[2] || c.id === parts[2]);
              if (foundC) setCompanyC(foundC.id);
            }
          } else if (list.length >= 2) {
            setCompanyA(list[0].id);
            setCompanyB(list[1].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanies();
  }, [searchParams]);

  const selectedItems = useMemo(() => {
    const a = companies.find((c) => c.id === companyA);
    const b = companies.find((c) => c.id === companyB);
    const c = companies.find((c) => c.id === companyC);
    return [a, b, c].filter(Boolean) as CompanyData[];
  }, [companies, companyA, companyB, companyC]);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Research"
        title="Company comparison"
        contextSentence="Side-by-side analysis of valuation, 409A metrics, and employee equity terms across target companies."
        actions={
          <Link href="/research/companies">
            <Button variant="ghost" size="sm">
              ← Back to companies
            </Button>
          </Link>
        }
      />

      {/* Selectors bar */}
      <div className="p-4 border border-rule rounded-sm bg-surface space-y-3">
        <span className="text-xs font-semibold text-ink uppercase tracking-wider block">
          Select companies to compare
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label htmlFor="compare-company-1" className="text-muted block text-[11px] mb-1">Company 1</label>
            <select
              id="compare-company-1"
              value={companyA}
              onChange={(e) => setCompanyA(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-rule rounded-sm bg-surface text-ink text-xs focus:ring-1 focus:ring-accent focus:outline-none"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="compare-company-2" className="text-muted block text-[11px] mb-1">Company 2</label>
            <select
              id="compare-company-2"
              value={companyB}
              onChange={(e) => setCompanyB(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-rule rounded-sm bg-surface text-ink text-xs focus:ring-1 focus:ring-accent focus:outline-none"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="compare-company-3" className="text-muted block text-[11px] mb-1">Company 3 (optional)</label>
            <select
              id="compare-company-3"
              value={companyC}
              onChange={(e) => setCompanyC(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-rule rounded-sm bg-surface text-ink text-xs focus:ring-1 focus:ring-accent focus:outline-none"
            >
              <option value="">None (compare 2)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="border border-rule rounded-sm overflow-hidden bg-surface">
        <table className="w-full text-xs text-left">
          <thead className="bg-sunk border-b border-rule">
            <tr>
              <th className="p-3 font-semibold text-muted w-1/4">Metric</th>
              {selectedItems.map((c) => (
                <th key={c.id} className="p-3 font-semibold text-ink">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/research/companies/${c.slug}`}
                      className="hover:text-accent font-serif text-sm"
                    >
                      {c.name}
                    </Link>
                    {c.ticker && (
                      <span className="font-mono text-[10px] text-muted bg-surface px-1 py-0.2 border border-rule rounded-sm">
                        {c.ticker}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            <tr>
              <td className="p-3 font-semibold text-muted">Status</td>
              {selectedItems.map((c) => (
                <td key={c.id} className="p-3">
                  <Badge tone={c.isPublic ? 'info' : 'neutral'}>
                    {c.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-muted">Sector</td>
              {selectedItems.map((c) => (
                <td key={c.id} className="p-3 text-ink">{c.sector}</td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-muted">Latest valuation / cap</td>
              {selectedItems.map((c) => (
                <td key={c.id} className="p-3 font-mono tabular-nums text-ink font-semibold">
                  {c.latestValuation ? compactMoney(c.latestValuation) : 'Private'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-muted">Latest 409A / FMV share price</td>
              {selectedItems.map((c) => (
                <td key={c.id} className="p-3 font-mono tabular-nums text-ink font-semibold">
                  {money(c.latestFmvPerShare, { showCents: true })}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-muted">Founded year</td>
              {selectedItems.map((c) => (
                <td key={c.id} className="p-3 font-mono tabular-nums text-ink">
                  {c.foundedYear || '—'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-muted">Leadership</td>
              {selectedItems.map((c) => (
                <td key={c.id} className="p-3 text-ink truncate max-w-[200px]">
                  {c.keyLeadership || '—'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-muted">Standard employee option pool</td>
              {selectedItems.map((c) => (
                <td key={c.id} className="p-3 font-mono tabular-nums text-ink">
                  {c.isPublic ? 'N/A (RSU heavy)' : '12% – 15%'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-muted">Post-termination exercise window</td>
              {selectedItems.map((c) => (
                <td key={c.id} className="p-3 text-ink">
                  {c.isPublic ? 'Not applicable' : '90 days standard (some 5–10yr)'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-muted">Common / Preferred discount</td>
              {selectedItems.map((c) => (
                <td key={c.id} className="p-3 font-mono tabular-nums text-ink">
                  {c.isPublic ? '0% (single share class)' : '25% – 35%'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-muted">Your active holdings</td>
              {selectedItems.map((c) => (
                <td key={c.id} className="p-3">
                  {c.isUserEmployer ? (
                    <Badge tone="accent">
                      Active grant recorded
                    </Badge>
                  ) : (
                    <span className="text-muted text-[11px]">No grants</span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-semibold text-muted">Actions</td>
              {selectedItems.map((c) => (
                <td key={c.id} className="p-3">
                  <Link href={`/research/companies/${c.slug}`}>
                    <Button variant="ghost" size="sm">
                      View profile →
                    </Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
