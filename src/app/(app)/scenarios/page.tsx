'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PageHeader,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  EmptyState,
  Dialog,
} from '@/components/ui';
import { NextSteps } from '@/components/layout/NextSteps';
import { useGrant } from '@/contexts/GrantContext';
import { date } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

interface SavedScenarioItem {
  id: string;
  name: string;
  kind: string;
  grantId?: string | null;
  grant?: {
    id: string;
    grantIdentifier: string;
    company?: { name: string };
  } | null;
  inputs: string;
  parsedInputs?: any;
  createdAt: string;
}

export default function ScenariosHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedGrantId = searchParams.get('grant') || searchParams.get('grantId');
  const { selectedGrantId, setSelectedGrantId } = useGrant();
  const { showToast } = useToast();

  const [savedScenarios, setSavedScenarios] = useState<SavedScenarioItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deleteTarget, setDeleteTarget] = useState<SavedScenarioItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const activeGrantParam = requestedGrantId || selectedGrantId;
  const grantQuery = activeGrantParam ? `?grant=${activeGrantParam}` : '';

  const fetchScenarios = () => {
    setIsLoading(true);
    fetch('/api/scenarios')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.scenarios) {
          setSavedScenarios(data.scenarios);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleDeleteScenario = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/scenarios/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast({
          title: 'Scenario deleted',
          message: `"${deleteTarget.name}" has been removed.`,
          type: 'info',
        });
        setSavedScenarios((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        showToast({
          title: 'Delete failed',
          message: 'Could not delete scenario. Please try again.',
          type: 'error',
        });
      }
    } catch {
      showToast({
        title: 'Error',
        message: 'Network error deleting scenario.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreScenario = (item: SavedScenarioItem) => {
    if (item.grantId) {
      setSelectedGrantId(item.grantId);
    }

    if (item.kind === 'STRATEGY') {
      router.push(`/scenarios/strategy${item.grantId ? `?grant=${item.grantId}` : ''}`);
    } else if (item.kind === 'TENDER') {
      router.push(`/scenarios/tender${item.grantId ? `?grant=${item.grantId}` : ''}`);
    } else if (item.kind === '83B') {
      router.push(`/scenarios/83b${item.grantId ? `?grant=${item.grantId}` : ''}`);
    } else if (item.kind === 'DEPARTURE') {
      router.push(`/scenarios/leaving${item.grantId ? `?grant=${item.grantId}` : ''}`);
    } else if (item.kind === 'DILUTION') {
      router.push(`/scenarios/dilution${item.grantId ? `?grant=${item.grantId}` : ''}`);
    } else {
      router.push(`/calculator${item.grantId ? `?grant=${item.grantId}` : ''}`);
    }
  };

  const modelers = [
    {
      title: 'Exercise Strategy',
      href: `/scenarios/strategy${grantQuery}`,
      badge: 'Strategy',
      description:
        'Compare exercise & hold today vs waiting for cashless exercise at exit vs letting options expire. Model long-term capital gains tax rates and risk profiles.',
    },
    {
      title: 'Secondary Tender Offer',
      href: `/scenarios/tender${grantQuery}`,
      badge: 'Liquidity',
      description:
        'Model participation in company-sponsored tender offers and secondary market share buybacks. Compare immediate cash payout against future IPO value.',
    },
    {
      title: 'Section 83(b) Election',
      href: `/scenarios/83b${grantQuery}`,
      badge: 'Tax filing',
      description:
        'Strict 30-day deadline countdown from purchase date, tax savings calculator, IRS filing instructions checklist, and certified print-ready election letter.',
    },
    {
      title: 'Departure Planning',
      href: `/scenarios/leaving${grantQuery}`,
      badge: 'PTEW & Runway',
      description:
        'Plan post-termination exercise windows (PTEW). Model cash budget constraints, statutory ISO 90-day conversion warnings, and set calendar reminders.',
    },
    {
      title: 'Equity Dilution',
      href: `/scenarios/dilution${grantQuery}`,
      badge: 'Capitalization',
      description:
        'Simulate future financing rounds (Seed, Series A, B, C) and new unallocated option pool expansions to project ownership percentage and share value.',
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Scenarios"
        title="Scenario modelers"
        contextSentence="Compare long-term exercise strategies, secondary tender offers, 83(b) tax savings, departure runway, and equity dilution."
        actions={
          <Link href={`/calculator${grantQuery}`}>
            <Button variant="secondary" size="sm">
              Open interactive calculator
            </Button>
          </Link>
        }
      />

      {/* Modelers Grid */}
      <div className="space-y-4">
        <div className="border-b border-[var(--rule)] pb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--ink)]">Specialized Modelers</h2>
          <span className="text-xs text-[var(--ink-muted)]">5 analytical frameworks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modelers.map((m) => (
            <Link
              key={m.title}
              href={m.href}
              className="block border border-[var(--rule)] bg-[var(--card)] p-5 hover:border-[var(--ink)] transition-colors group space-y-3"
            >
              <div className="flex items-center justify-between">
                <Badge tone="neutral">{m.badge}</Badge>
                <span className="text-xs font-mono text-[var(--ink-muted)] group-hover:text-[var(--ink)] group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </div>
              <h3 className="text-base font-medium text-[var(--ink)]">{m.title}</h3>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                {m.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Saved Scenarios Archive */}
      <div className="space-y-4 border-t border-[var(--rule)] pt-8">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
          <div>
            <h2 className="text-sm font-medium text-[var(--ink)]">Saved Scenarios</h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Historical modeling snapshots and saved assumption sets
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--ink-muted)]">
            {savedScenarios.length} {savedScenarios.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {savedScenarios.length === 0 ? (
          <EmptyState
            title="No saved scenarios"
            description="Use the 'Save scenario' action in the Calculator or any scenario modeler to archive assumptions for quick reference."
          />
        ) : (
          <div className="border border-[var(--rule)] bg-[var(--card)] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Associated Grant</TableHead>
                  <TableHead>Saved Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedScenarios.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-[var(--ink)]">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <Badge tone="neutral">{item.kind}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[var(--ink-muted)]">
                      {item.grant ? `${item.grant.grantIdentifier} (${item.grant.company?.name || 'Company'})` : 'Custom parameters'}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[var(--ink-muted)]">
                      {date(new Date(item.createdAt))}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRestoreScenario(item)}
                      >
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(item)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Recommended Next Steps */}
      <NextSteps preset="J2" title="Recommended next steps" />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete saved scenario"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[var(--ink-muted)]">
            Are you sure you want to delete <strong className="text-[var(--ink)]">{deleteTarget?.name}</strong>? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDeleteScenario}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete scenario'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
