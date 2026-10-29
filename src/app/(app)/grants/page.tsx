'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  PageHeader,
  Button,
  Input,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
  EmptyState,
  Dialog,
  ProgressBar,
} from '@/components/ui';
import GrantStepperModal from '@/components/grants/GrantStepperModal';
import GrantsGanttView from '@/components/grants/GrantsGanttView';
import { NextSteps } from '@/components/layout/NextSteps';
import { money, units as formatUnits, date as formatDate } from '@/lib/format';

export default function GrantsPage() {
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrant, setEditingGrant] = useState<any | null>(null);
  const [deleteConfirmGrant, setDeleteConfirmGrant] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters and views
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('VEST_DATE');
  const [activeView, setActiveView] = useState<'TABLE' | 'TIMELINE'>('TABLE');

  // Inline FMV edit
  const [editingFmvId, setEditingFmvId] = useState<string | null>(null);
  const [newFmv, setNewFmv] = useState('');

  const fetchGrants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/grants');
      if (res.ok) {
        const data = await res.json();
        setGrants(data.grants || []);
      }
    } catch (err) {
      console.error('Failed to load grants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  // Handle Quick FMV update
  const handleSaveFmv = async (grantId: string) => {
    const val = parseFloat(newFmv);
    if (isNaN(val) || val < 0) return;

    try {
      const res = await fetch(`/api/grants/${grantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latestFmvPerShare: val }),
      });
      if (res.ok) {
        setEditingFmvId(null);
        fetchGrants();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirmGrant) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/grants/${deleteConfirmGrant.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteConfirmGrant(null);
        fetchGrants();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    if (grants.length === 0) return;

    const headers = [
      'Identifier',
      'Employer',
      'Type',
      'Units Granted',
      'Strike Price',
      'Current FMV',
      'Vested Units',
      'Percent Vested',
      'Vested Value',
      'Exercise Cost',
      'Net Value',
      'Grant Date',
      'Vesting Start Date',
      'Expiration Date',
      'Status',
    ];

    const rows = grants.map((g) => {
      const netVal = (g.vestedValue || 0) - (g.vestedExerciseCost || 0);
      return [
        `"${g.grantIdentifier || ''}"`,
        `"${g.company?.name || ''}"`,
        g.grantType,
        g.unitsGranted,
        g.strikePrice,
        g.company?.latestFmvPerShare || 0,
        g.vestedUnits || 0,
        `${Math.round(g.percentVested || 0)}%`,
        g.vestedValue || 0,
        g.vestedExerciseCost || 0,
        netVal,
        g.grantDate ? new Date(g.grantDate).toISOString().split('T')[0] : '',
        g.vestingStartDate ? new Date(g.vestingStartDate).toISOString().split('T')[0] : '',
        g.expirationDate ? new Date(g.expirationDate).toISOString().split('T')[0] : '',
        g.status || 'VESTING',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vestly_grants_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered and sorted grants
  const filteredGrants = useMemo(() => {
    let result = [...grants];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.grantIdentifier?.toLowerCase().includes(q) ||
          g.company?.name?.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      result = result.filter((g) => g.grantType === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((g) => (g.status || 'VESTING') === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'VEST_DATE') {
        const da = a.nextVestingDate ? new Date(a.nextVestingDate).getTime() : Infinity;
        const db = b.nextVestingDate ? new Date(b.nextVestingDate).getTime() : Infinity;
        return da - db;
      }
      if (sortBy === 'UNITS_DESC') {
        return b.unitsGranted - a.unitsGranted;
      }
      if (sortBy === 'VALUE_DESC') {
        return (b.vestedValue || 0) - (a.vestedValue || 0);
      }
      if (sortBy === 'GRANT_DATE_DESC') {
        return new Date(b.grantDate).getTime() - new Date(a.grantDate).getTime();
      }
      return 0;
    });

    return result;
  }, [grants, searchQuery, typeFilter, statusFilter, sortBy]);

  // Derived summaries for header context sentence
  const summarySentence = useMemo(() => {
    if (grants.length === 0) {
      return 'No equity grants registered yet. Add a grant to monitor vesting schedules and model exercise scenarios.';
    }
    const compSet = new Set(grants.map((g) => g.company?.name || 'Company'));
    const totalUnits = grants.reduce((sum, g) => sum + g.unitsGranted, 0);
    const totalVested = grants.reduce((sum, g) => sum + (g.vestedUnits || 0), 0);
    const grantLabel = grants.length === 1 ? 'grant' : 'grants';
    const compLabel = compSet.size === 1 ? 'employer' : 'employers';

    return `${grants.length} ${grantLabel} across ${compSet.size} ${compLabel}. ${formatUnits(
      totalUnits
    )} units granted, ${formatUnits(totalVested)} units vested.`;
  }, [grants]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        eyebrow="App / Grants"
        title="Grants"
        contextSentence={summarySentence}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              disabled={grants.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingGrant(null);
                setIsModalOpen(true);
              }}
            >
              + Record grant
            </Button>
          </div>
        }
      />

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-surface border border-rule rounded-sm text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="w-full sm:w-60">
            <Input
              placeholder="Search identifier or employer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Type Filter */}
          <div className="w-28">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs"
              options={[
                { value: 'ALL', label: 'All types' },
                { value: 'ISO', label: 'ISO' },
                { value: 'NSO', label: 'NSO' },
                { value: 'RSU', label: 'RSU' },
                { value: 'ESPP', label: 'ESPP' },
              ]}
            />
          </div>

          {/* Status Filter */}
          <div className="w-32">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs"
              options={[
                { value: 'ALL', label: 'All statuses' },
                { value: 'VESTING', label: 'Vesting' },
                { value: 'FULLY_VESTED', label: 'Fully vested' },
                { value: 'EXERCISED', label: 'Exercised' },
                { value: 'EXPIRED', label: 'Expired' },
              ]}
            />
          </div>

          {/* Sort */}
          <div className="w-40">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs"
              options={[
                { value: 'VEST_DATE', label: 'Soonest vest date' },
                { value: 'UNITS_DESC', label: 'Units: high to low' },
                { value: 'VALUE_DESC', label: 'Vested value: high to low' },
                { value: 'GRANT_DATE_DESC', label: 'Grant date: newest' },
              ]}
            />
          </div>
        </div>

        {/* View Switcher Toggle */}
        <div className="inline-flex items-center border border-rule rounded-sm overflow-hidden bg-sunk p-0.5">
          <button
            type="button"
            onClick={() => setActiveView('TABLE')}
            className={`px-3 py-1 text-xs font-medium rounded-xs transition-colors ${
              activeView === 'TABLE'
                ? 'bg-surface text-ink font-semibold shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            Table view
          </button>
          <button
            type="button"
            onClick={() => setActiveView('TIMELINE')}
            className={`px-3 py-1 text-xs font-medium rounded-xs transition-colors ${
              activeView === 'TIMELINE'
                ? 'bg-surface text-ink font-semibold shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            Timeline view
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : grants.length === 0 ? (
        <EmptyState
          title="No equity grants recorded"
          description="Track stock options, RSUs, and purchase plans. Calculate statutory exercise costs and monitor vesting milestones."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingGrant(null);
                setIsModalOpen(true);
              }}
            >
              + Record your first grant
            </Button>
          }
        />
      ) : filteredGrants.length === 0 ? (
        <EmptyState
          title="No grants match your filter"
          description="Try clearing search query or adjusting filter parameters."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : activeView === 'TIMELINE' ? (
        <GrantsGanttView grants={filteredGrants} />
      ) : (
        /* Table View */
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>Identifier & employer</TableHead>
              <TableHead>Structure</TableHead>
              <TableHead className="text-right">Granted / vested units</TableHead>
              <TableHead className="text-right">Strike / cost</TableHead>
              <TableHead className="text-right">409A FMV</TableHead>
              <TableHead className="text-right">Vested value</TableHead>
              <TableHead className="text-right">Net pre-tax</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGrants.map((g) => {
              const netValue = (g.vestedValue || 0) - (g.vestedExerciseCost || 0);
              const isUnderwater = g.grantType !== 'RSU' && netValue < 0;
              const isEditingFmv = editingFmvId === g.id;

              return (
                <TableRow key={g.id}>
                  {/* Identifier & Employer */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <Link
                        href={`/grants/${g.id}`}
                        className="font-semibold text-ink hover:underline focus:outline-none"
                      >
                        {g.grantIdentifier}
                      </Link>
                      <div className="text-[11px] text-muted flex items-center gap-1.5">
                        <span>{g.company?.name || 'Company'}</span>
                        {g.company?.ticker && (
                          <span className="font-mono text-[10px] text-muted">
                            ({g.company.ticker})
                          </span>
                        )}
                        {g.earlyExercisable && (
                          <span className="font-mono text-[10px] text-accent">
                            • Early exercisable
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Structure */}
                  <TableCell>
                    <Badge tone="neutral">
                      {g.grantType}
                    </Badge>
                  </TableCell>

                  {/* Units */}
                  <TableCell className="text-right font-mono">
                    <div className="font-semibold text-ink">
                      {formatUnits(g.vestedUnits || 0)}
                      <span className="text-muted font-normal text-[11px]">
                        {' '}/ {formatUnits(g.unitsGranted)}
                      </span>
                    </div>
                    <div className="w-24 ml-auto mt-1">
                      <ProgressBar
                        value={
                          g.unitsGranted > 0
                            ? Math.round(((g.vestedUnits || 0) / g.unitsGranted) * 100)
                            : 0
                        }
                      />
                    </div>
                  </TableCell>

                  {/* Strike & Cost */}
                  <TableCell className="text-right font-mono">
                    <div className="text-ink">
                      {g.grantType === 'RSU' ? '$0.00' : money(g.strikePrice)}
                    </div>
                    <div className="text-[11px] text-muted">
                      cost {money(g.vestedExerciseCost || 0)}
                    </div>
                  </TableCell>

                  {/* 409A FMV (Inline edit) */}
                  <TableCell className="text-right font-mono">
                    {isEditingFmv ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={newFmv}
                          onChange={(e) => setNewFmv(e.target.value)}
                          className="w-16 px-1 py-0.5 text-xs bg-surface border border-accent rounded-xs font-mono text-ink text-right focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveFmv(g.id)}
                          className="text-[10px] px-1 py-0.5 bg-accent text-accent-contrast rounded-xs"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:underline text-ink inline-block"
                        title="Click to update 409A FMV"
                        onClick={() => {
                          setEditingFmvId(g.id);
                          setNewFmv(String(g.company?.latestFmvPerShare || '0.00'));
                        }}
                      >
                        {money(g.company?.latestFmvPerShare || 0)}
                      </div>
                    )}
                  </TableCell>

                  {/* Vested Value */}
                  <TableCell className="text-right font-mono font-medium text-ink">
                    {money(g.vestedValue || 0)}
                  </TableCell>

                  {/* Net Value (Unclamped) */}
                  <TableCell className="text-right font-mono font-semibold">
                    <span className={isUnderwater ? 'text-loss' : 'text-profit'}>
                      {netValue < 0 ? `-${money(Math.abs(netValue))}` : money(netValue)}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      tone={
                        g.status === 'FULLY_VESTED' || g.status === 'EXERCISED'
                          ? 'gain'
                          : g.status === 'EXPIRED'
                          ? 'loss'
                          : 'neutral'
                      }
                    >
                      {g.status ? g.status.replace(/_/g, ' ') : 'VESTING'}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/grants/${g.id}`}
                        className="text-xs text-accent hover:underline font-medium"
                      >
                        Details
                      </Link>
                      <span className="text-rule">•</span>
                      <Link
                        href={`/calculator?grant=${g.id}`}
                        className="text-xs text-muted hover:text-ink font-medium"
                      >
                        Tax
                      </Link>
                      <span className="text-rule">•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGrant(g);
                          setIsModalOpen(true);
                        }}
                        className="text-xs text-muted hover:text-ink"
                      >
                        Edit
                      </button>
                      <span className="text-rule">•</span>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmGrant(g)}
                        className="text-xs text-loss hover:opacity-80"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirmGrant)}
        onClose={() => setDeleteConfirmGrant(null)}
        title="Delete equity grant"
        description="This action removes the grant record and associated vesting tranches."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-ink">
            Are you sure you want to delete{' '}
            <strong className="font-semibold">{deleteConfirmGrant?.grantIdentifier}</strong> (
            {deleteConfirmGrant?.company?.name})?
          </p>
          <p className="text-muted text-[11px]">
            All historical vesting events and associated reminders for this grant will be permanently removed.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-rule">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteConfirmGrant(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={handleConfirmDelete}
            >
              Delete grant
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Stepper Modal for Add / Edit */}
      <GrantStepperModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGrant(null);
        }}
        onSuccess={fetchGrants}
        initialData={editingGrant}
      />

      {/* Next steps links */}
      <NextSteps preset="J1" />
    </div>
  );
}
