'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PageHeader,
  Button,
  Badge,
  KeyValueList,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
  EmptyState,
  Dialog,
  Figure,
  Callout,
  Textarea,
} from '@/components/ui';
import GrantVestingChart from '@/components/grants/GrantVestingChart';
import GrantStepperModal from '@/components/grants/GrantStepperModal';
import RecordExerciseModal from '@/components/grants/RecordExerciseModal';
import { NextSteps } from '@/components/layout/NextSteps';
import {
  money,
  units as formatUnits,
  date as formatDate,
  relativeDays,
} from '@/lib/format';

export default function GrantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const grantId = params.id as string;

  const [grant, setGrant] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FMV Multiple selector
  const [multiple, setMultiple] = useState<number>(1);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Notes editing
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Document upload
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [actionAddingDate, setActionAddingDate] = useState<string | null>(null);

  const fetchGrant = useCallback(async () => {
    if (!grantId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/grants/${grantId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Grant not found');
        throw new Error('Failed to load grant details');
      }
      const data = await res.json();
      setGrant(data.grant);
      setNotes(data.grant.notes || '');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [grantId]);

  useEffect(() => {
    fetchGrant();
  }, [fetchGrant]);

  // Handle Save Notes
  const handleSaveNotes = async () => {
    if (!grant) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/grants/${grant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        fetchGrant();
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Handle Document Upload
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !grant) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('grantId', grant.id);

    setUploadingDoc(true);
    try {
      const res = await fetch('/api/grants/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchGrant();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingDoc(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!grant) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/grants/${grant.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/grants');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Handle Add to Actions (Idempotent)
  const handleAddToAction = async (title: string, dueDate: Date, type: string) => {
    if (!grant) return;
    const dateKey = dueDate.toISOString().split('T')[0];
    setActionAddingDate(dateKey);

    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: `Reminder for ${grant.grantIdentifier} (${grant.company?.name})`,
          dueDate: dueDate.toISOString(),
          grantId: grant.id,
          type,
          urgency: 'MEDIUM',
        }),
      });
      if (res.ok) {
        fetchGrant();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionAddingDate(null);
    }
  };

  // Derived financial figures for Section 5.6
  const modeledFmv = (grant?.company?.latestFmvPerShare || 0) * multiple;
  const vestedUnits = grant?.vestedUnits || 0;
  const unvestedUnits = grant?.unvestedUnits || 0;
  const strike = grant?.grantType === 'RSU' ? 0 : grant?.strikePrice || 0;

  const totalVestedValue = Math.round(vestedUnits * modeledFmv);
  const vestedExerciseCost = Math.round(vestedUnits * strike);
  const netPreTaxValue = totalVestedValue - vestedExerciseCost;
  const isUnderwater = grant?.grantType !== 'RSU' && netPreTaxValue < 0;

  const spreadPerShare = Math.max(0, modeledFmv - strike);
  const totalSpread = Math.round(vestedUnits * spreadPerShare);

  // Estimated tax exposure
  const taxExposure = useMemo(() => {
    if (!grant) return { label: 'Tax exposure', amount: 0, note: '' };
    if (grant.grantType === 'ISO') {
      const amt = Math.round(totalSpread * 0.28);
      return {
        label: 'Est. AMT spread liability (28%)',
        amount: amt,
        note: 'Calculated on spread at exercise if holding shares past calendar year end.',
      };
    }
    if (grant.grantType === 'NSO') {
      const ord = Math.round(totalSpread * 0.37);
      return {
        label: 'Est. ordinary income tax (37%)',
        amount: ord,
        note: 'Recognized as compensation income at time of option exercise.',
      };
    }
    // RSU
    const rsuTax = Math.round(totalVestedValue * 0.37);
    return {
      label: 'Est. ordinary income tax (37%)',
      amount: rsuTax,
      note: 'Recognized as wages at time of each tranche vesting.',
    };
  }, [grant, totalSpread, totalVestedValue]);

  // Key Dates Timeline List (Section 5.8)
  const keyDates = useMemo(() => {
    if (!grant) return [];
    const list: Array<{
      id: string;
      title: string;
      date: Date;
      type: string;
      status: 'COMPLETED' | 'UPCOMING' | 'FUTURE';
      description: string;
    }> = [];

    const now = new Date();

    // 1. Grant date
    if (grant.grantDate) {
      const gd = new Date(grant.grantDate);
      list.push({
        id: 'grant_date',
        title: 'Grant agreement authorized',
        date: gd,
        type: 'GRANT_DATE',
        status: gd <= now ? 'COMPLETED' : 'UPCOMING',
        description: 'Board approval and formal allocation of equity units.',
      });
    }

    // 2. Cliff date
    if (grant.cliffMonths > 0) {
      const vStart = new Date(grant.vestingStartDate || grant.grantDate);
      const cd = new Date(vStart.getTime() + grant.cliffMonths * 30.44 * 24 * 3600 * 1000);
      list.push({
        id: 'cliff_date',
        title: `${grant.cliffMonths}-month vesting cliff`,
        date: cd,
        type: 'CLIFF_EVENT',
        status: cd <= now ? 'COMPLETED' : 'UPCOMING',
        description: 'First milestone tranche vests initial block of shares.',
      });
    }

    // 3. Next upcoming vest event
    if (grant.nextVestingDate) {
      const nvd = new Date(grant.nextVestingDate);
      list.push({
        id: 'next_vest',
        title: `Next monthly tranche (${formatUnits(grant.nextVestingUnits || 0)} units)`,
        date: nvd,
        type: 'VESTING_EVENT',
        status: 'UPCOMING',
        description: 'Scheduled monthly vesting distribution.',
      });
    }

    // 4. ISO holding period if exercised
    if (grant.grantType === 'ISO' && (grant.exerciseEvents || []).length > 0) {
      const latestEx = grant.exerciseEvents[0];
      const exDate = new Date(latestEx.exerciseDate);
      const oneYear = new Date(exDate.getTime() + 365.25 * 24 * 3600 * 1000);
      const twoYears = new Date(new Date(grant.grantDate).getTime() + 2 * 365.25 * 24 * 3600 * 1000);
      const qualDate = oneYear > twoYears ? oneYear : twoYears;

      list.push({
        id: 'iso_holding',
        title: 'ISO qualifying disposition milestone',
        date: qualDate,
        type: 'ISO_HOLDING_PERIOD',
        status: qualDate <= now ? 'COMPLETED' : 'UPCOMING',
        description: 'Holding until this date qualifies net profit for long-term capital gains rates.',
      });
    }

    // 5. Expiration date
    if (grant.expirationDate) {
      const ed = new Date(grant.expirationDate);
      list.push({
        id: 'expiration_date',
        title: 'Option agreement expiration',
        date: ed,
        type: 'EXPIRATION_WARNING',
        status: ed <= now ? 'COMPLETED' : 'FUTURE',
        description: 'Unexercised options expire and return to company pool.',
      });
    }

    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [grant]);

  // Check if reminder already exists
  const existingActionTypes = useMemo(() => {
    return new Set((grant?.actions || []).map((a: any) => a.type));
  }, [grant]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (error || !grant) {
    return (
      <EmptyState
        title="Grant not found"
        description={error || 'The requested equity grant record could not be found.'}
        action={
          <Link href="/grants">
            <Button variant="secondary" size="sm">
              Return to grants
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <PageHeader
        eyebrow={`App / Grants / ${grant.grantIdentifier}`}
        title={grant.grantIdentifier}
        contextSentence={`${grant.company?.name || 'Company'} • Issued ${formatDate(
          grant.grantDate
        )} • Expiration ${formatDate(grant.expirationDate)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsExerciseModalOpen(true)}
              disabled={grant.exercisableUnits <= 0}
            >
              Record exercise
            </Button>
            <Link href={`/scenarios?grant=${grant.id}`}>
              <Button variant="secondary" size="sm">
                Model scenarios
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-loss hover:text-loss"
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      {/* Sticky In-Page Navigation Bar (Section 5.3) */}
      <nav
        aria-label="Grant sections navigation"
        className="sticky top-14 z-20 -mx-4 px-4 py-2 bg-surface/95 backdrop-blur-sm border-y border-rule flex items-center gap-1 overflow-x-auto text-xs"
      >
        <a
          href="#overview"
          className="px-2.5 py-1 text-muted hover:text-ink hover:bg-sunk rounded-xs transition-colors"
        >
          Overview
        </a>
        <span className="text-rule">•</span>
        <a
          href="#vesting"
          className="px-2.5 py-1 text-muted hover:text-ink hover:bg-sunk rounded-xs transition-colors"
        >
          Vesting schedule
        </a>
        <span className="text-rule">•</span>
        <a
          href="#valuation"
          className="px-2.5 py-1 text-muted hover:text-ink hover:bg-sunk rounded-xs transition-colors"
        >
          Valuation modeling
        </a>
        <span className="text-rule">•</span>
        <a
          href="#exercise"
          className="px-2.5 py-1 text-muted hover:text-ink hover:bg-sunk rounded-xs transition-colors"
        >
          Exercise history ({grant.exerciseEvents?.length || 0})
        </a>
        <span className="text-rule">•</span>
        <a
          href="#dates"
          className="px-2.5 py-1 text-muted hover:text-ink hover:bg-sunk rounded-xs transition-colors"
        >
          Key dates
        </a>
        <span className="text-rule">•</span>
        <a
          href="#documents"
          className="px-2.5 py-1 text-muted hover:text-ink hover:bg-sunk rounded-xs transition-colors"
        >
          Agreement & notes
        </a>
        <span className="text-rule">•</span>
        <a
          href="#audit"
          className="px-2.5 py-1 text-muted hover:text-ink hover:bg-sunk rounded-xs transition-colors"
        >
          Audit trail
        </a>
      </nav>

      {/* SECTION 1: Summary Terms (Section 5.4) */}
      <section id="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink tracking-tight">Summary terms</h2>
          <div className="flex items-center gap-2">
            <Badge tone="neutral">
              {grant.grantType}
            </Badge>
            <Badge
              tone={
                grant.status === 'FULLY_VESTED' || grant.status === 'EXERCISED'
                  ? 'gain'
                  : 'neutral'
              }
            >
              {grant.status ? grant.status.replace(/_/g, ' ') : 'VESTING'}
            </Badge>
            {grant.earlyExercisable && (
              <Badge tone="accent">
                Early exercisable
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 bg-surface border border-rule rounded-sm">
          <KeyValueList
            items={[
              { key: 'employer', label: 'Employer', value: grant.company?.name || 'Company' },
              {
                key: 'ticker',
                label: 'Ticker',
                value: grant.company?.ticker || 'Private (unlisted)',
              },
              { key: 'identifier', label: 'Grant identifier', value: grant.grantIdentifier },
              { key: 'unitsGranted', label: 'Total units granted', value: `${formatUnits(grant.unitsGranted)} units` },
              {
                key: 'vestedUnits',
                label: 'Vested units',
                value: `${formatUnits(vestedUnits)} units (${Math.round(
                  grant.percentVested || 0
                )}%)`,
              },
              { key: 'unvestedUnits', label: 'Unvested units', value: `${formatUnits(unvestedUnits)} units` },
              {
                key: 'strikePrice',
                label: 'Strike price',
                value: grant.grantType === 'RSU' ? '$0.00 (RSU)' : money(grant.strikePrice),
              },
              {
                key: 'fmv',
                label: 'Current 409A FMV',
                value: money(grant.company?.latestFmvPerShare || 0),
              },
              {
                key: 'spread',
                label: 'Pre-tax spread per share',
                value: money(spreadPerShare),
              },
              {
                key: 'vestedCost',
                label: 'Vested exercise cost',
                value: money(vestedExerciseCost),
              },
              {
                key: 'totalCost',
                label: 'Total grant exercise cost',
                value: money(grant.totalExerciseCost || 0),
              },
              {
                key: 'exercisable',
                label: 'Exercisable units',
                value: `${formatUnits(grant.exercisableUnits || 0)} units`,
              },
              {
                key: 'vestingStart',
                label: 'Vesting start date',
                value: formatDate(grant.vestingStartDate),
              },
              {
                key: 'schedule',
                label: 'Vesting schedule',
                value: grant.vestingSchedule?.replace(/_/g, ' ') || '4 year 1 year cliff',
              },
              {
                key: 'ptew',
                label: 'Post-termination window',
                value: grant.grantType === 'ISO' ? '90 days (IRC § 422)' : '10 years',
              },
            ]}
          />
        </div>
      </section>

      {/* SECTION 2: Vesting Schedule & Chart (Section 5.5) */}
      <section id="vesting" className="space-y-4 pt-4 border-t border-rule">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink tracking-tight">Vesting schedule</h2>
            <p className="text-xs text-muted">
              Cumulative progression of earned tranches and upcoming milestones.
            </p>
          </div>
        </div>

        {/* Chart */}
        <GrantVestingChart grant={grant} fmvMultiplier={multiple} />

        {/* Schedule Table */}
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>Tranche date</TableHead>
              <TableHead className="text-right">Units vesting</TableHead>
              <TableHead className="text-right">Cumulative units</TableHead>
              <TableHead className="text-right">Cumulative %</TableHead>
              <TableHead className="text-right">Tranche value at FMV</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(grant.vestingEvents || []).map((evt: any) => {
              const isVested = new Date(evt.vestDate) <= new Date();
              const pct =
                grant.unitsGranted > 0
                  ? Math.round((evt.cumulativeVested / grant.unitsGranted) * 100)
                  : 0;

              return (
                <TableRow key={evt.id}>
                  <TableCell className="font-mono text-ink font-medium">
                    {formatDate(evt.vestDate)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-ink">
                    +{formatUnits(evt.unitsVested)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted">
                    {formatUnits(evt.cumulativeVested)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted">{pct}%</TableCell>
                  <TableCell className="text-right font-mono text-ink">
                    {money(evt.unitsVested * modeledFmv)}
                  </TableCell>
                  <TableCell>
                    <Badge tone={isVested ? 'gain' : 'neutral'}>
                      {isVested ? 'Vested' : 'Scheduled'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      {/* SECTION 3: Valuation Modeling (Section 5.6) */}
      <section id="valuation" className="space-y-4 pt-4 border-t border-rule">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink tracking-tight">Valuation modeling</h2>
            <p className="text-xs text-muted">
              Adjust valuation multiples to model pre-tax and tax liability scenarios.
            </p>
          </div>

          {/* Multiple Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">FMV multiple:</span>
            <div className="inline-flex items-center border border-rule rounded-sm bg-sunk p-0.5 text-xs">
              {[0.5, 1, 2, 5].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMultiple(m)}
                  className={`px-2 py-0.5 rounded-xs transition-colors font-mono font-medium ${
                    multiple === m
                      ? 'bg-surface text-ink font-semibold shadow-xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
            <span className="font-mono text-xs text-ink font-semibold ml-1">
              ({money(modeledFmv)}/sh)
            </span>
          </div>
        </div>

        {/* Figure Cards for this grant */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-rule rounded-xs bg-surface p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
              Total vested value
            </span>
            <div className="font-serif text-2xl font-bold text-ink">
              <Figure
                value={money(totalVestedValue)}
                marker="[1]"
                calculation={{
                  title: 'Total vested value calculation',
                  inputs: [
                    { name: 'Vested units', value: formatUnits(vestedUnits) },
                    { name: 'Modeled FMV', value: money(modeledFmv) },
                  ],
                  steps: [`${formatUnits(vestedUnits)} units × ${money(modeledFmv)} = ${money(totalVestedValue)}`],
                }}
              />
            </div>
            <span className="text-[11px] text-muted block">
              {formatUnits(vestedUnits)} units @ {money(modeledFmv)}
            </span>
          </div>

          <div className="border border-rule rounded-xs bg-surface p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
              Total exercise cost
            </span>
            <div className="font-serif text-2xl font-bold text-ink">
              <Figure
                value={money(vestedExerciseCost)}
                marker="[2]"
                calculation={{
                  title: 'Vested exercise cost calculation',
                  inputs: [
                    { name: 'Vested units', value: formatUnits(vestedUnits) },
                    { name: 'Strike price', value: money(strike) },
                  ],
                  steps: [`${formatUnits(vestedUnits)} units × ${money(strike)} = ${money(vestedExerciseCost)}`],
                }}
              />
            </div>
            <span className="text-[11px] text-muted block">
              {formatUnits(vestedUnits)} units @ {money(strike)}
            </span>
          </div>

          <div className="border border-rule rounded-xs bg-surface p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
              Net estimated value (pre-tax)
            </span>
            <div className={`font-serif text-2xl font-bold ${isUnderwater ? 'text-loss' : 'text-profit'}`}>
              <Figure
                value={netPreTaxValue < 0 ? `-${money(Math.abs(netPreTaxValue))}` : money(netPreTaxValue)}
                marker="[3]"
                calculation={{
                  title: 'Net pre-tax value calculation (unclamped)',
                  inputs: [
                    { name: 'Vested share value', value: money(totalVestedValue) },
                    { name: 'Vested exercise cost', value: money(vestedExerciseCost) },
                  ],
                  steps: [`${money(totalVestedValue)} - ${money(vestedExerciseCost)} = ${money(netPreTaxValue)}`],
                }}
              />
            </div>
            <span className="text-[11px] text-muted block">
              {isUnderwater ? 'Underwater options' : 'Estimated pre-tax equity'}
            </span>
          </div>

          <div className="border border-rule rounded-xs bg-surface p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
              {taxExposure.label}
            </span>
            <div className="font-serif text-2xl font-bold text-ink">
              <Figure
                value={money(taxExposure.amount)}
                marker="[4]"
                calculation={{
                  title: 'Estimated statutory tax exposure',
                  inputs: [
                    { name: 'Aggregate spread', value: money(totalSpread) },
                  ],
                  steps: [taxExposure.note],
                }}
              />
            </div>
            <span className="text-[11px] text-muted block truncate" title={taxExposure.note}>
              {taxExposure.note}
            </span>
          </div>
        </div>

        {isUnderwater && (
          <Callout variant="warn" title="Underwater options notice">
            The strike price ({money(strike)}) currently exceeds the modeled FMV ({money(
              modeledFmv
            )}). Exercising would result in an immediate paper loss of{' '}
            {money(Math.abs(netPreTaxValue))}.
          </Callout>
        )}
      </section>

      {/* SECTION 4: Exercise Recording & History (Section 5.7) */}
      <section id="exercise" className="space-y-4 pt-4 border-t border-rule">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink tracking-tight">
              Exercise history & recording
            </h2>
            <p className="text-xs text-muted">
              Historical option exercises, cash paid, and statutory disposition tracking.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExerciseModalOpen(true)}
            disabled={grant.exercisableUnits <= 0}
          >
            + Record exercise
          </Button>
        </div>

        {(grant.exerciseEvents || []).length === 0 ? (
          <div className="p-6 text-center text-xs text-muted border border-rule rounded-sm bg-surface">
            No exercise events recorded for this grant yet. Click &quot;Record exercise&quot; to log
            exercised shares and generate statutory tax reminders.
          </div>
        ) : (
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead>Exercise date</TableHead>
                <TableHead className="text-right">Units exercised</TableHead>
                <TableHead className="text-right">Strike paid</TableHead>
                <TableHead className="text-right">Total cost</TableHead>
                <TableHead className="text-right">FMV at exercise</TableHead>
                <TableHead className="text-right">Spread</TableHead>
                <TableHead>Disposition intention</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grant.exerciseEvents.map((evt: any) => (
                <TableRow key={evt.id}>
                  <TableCell className="font-mono text-ink font-medium">
                    {formatDate(evt.exerciseDate)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-ink">
                    {formatUnits(evt.unitsExercised)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted">
                    {money(evt.strikePricePaid)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-ink">
                    {money(evt.totalCostPaid)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted">
                    {money(evt.fmvAtExercise)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-profit">
                    {money(evt.spreadAtExercise)}
                  </TableCell>
                  <TableCell>
                    <Badge tone="neutral">
                      {evt.dispositionType === 'QUALIFYING'
                        ? 'Holding shares'
                        : evt.dispositionType === 'DISQUALIFYING'
                        ? 'Immediate sale'
                        : evt.dispositionType}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {/* SECTION 5: Key Dates & Actions (Section 5.8) */}
      <section id="dates" className="space-y-4 pt-4 border-t border-rule">
        <div>
          <h2 className="text-sm font-semibold text-ink tracking-tight">Key dates timeline</h2>
          <p className="text-xs text-muted">
            Statutory milestones and deadlines. Click &quot;Add to Actions&quot; to create persistent task reminders.
          </p>
        </div>

        <div className="border border-rule rounded-sm bg-surface divide-y divide-rule text-xs">
          {keyDates.map((item) => {
            const dateStr = formatDate(item.date);
            const rel = relativeDays(item.date);
            const isCompleted = item.status === 'COMPLETED';
            const alreadyAdded = existingActionTypes.has(item.type);
            const isAdding = actionAddingDate === item.date.toISOString().split('T')[0];

            return (
              <div
                key={item.id}
                className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{item.title}</span>
                    <Badge tone={isCompleted ? 'gain' : 'neutral'}>
                      {isCompleted ? 'Completed' : rel}
                    </Badge>
                  </div>
                  <p className="text-muted text-[11px]">{item.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted text-[11px]">{dateStr}</span>
                  {!isCompleted && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={alreadyAdded || isAdding}
                      loading={isAdding}
                      onClick={() => handleAddToAction(item.title, item.date, item.type)}
                    >
                      {alreadyAdded ? 'Action added' : '+ Add to Actions'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 6: Documents & Notes (Section 5.9) */}
      <section id="documents" className="space-y-4 pt-4 border-t border-rule">
        <h2 className="text-sm font-semibold text-ink tracking-tight">
          Grant agreement & notes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Document Management */}
          <div className="p-4 bg-surface border border-rule rounded-sm space-y-3">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
              Legal document attachment
            </h3>
            {grant.documentName ? (
              <div className="p-3 bg-sunk rounded-sm border border-rule space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink truncate max-w-[200px]">
                    {grant.documentName}
                  </span>
                  <a
                    href={`/api/grants/${grant.id}/document`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline font-medium text-xs"
                  >
                    Download PDF
                  </a>
                </div>
                <p className="text-[11px] text-muted">
                  Stored securely in private application storage. Available only to authenticated user.
                </p>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-rule rounded-sm text-center space-y-2">
                <p className="text-xs text-muted">
                  No agreement document attached. Upload a signed grant agreement PDF for permanent record keeping.
                </p>
                <label className="inline-block cursor-pointer">
                  <span className="text-xs font-medium px-3 py-1 bg-surface border border-rule rounded-xs hover:bg-sunk inline-block">
                    {uploadingDoc ? 'Uploading...' : 'Upload grant agreement'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                    className="hidden"
                    onChange={handleDocUpload}
                    disabled={uploadingDoc}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Notes Management */}
          <div className="p-4 bg-surface border border-rule rounded-sm space-y-3">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
              Grant notes & agreement terms
            </h3>
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record board approval details, vesting acceleration terms, or departure covenants..."
              className="text-xs"
            />
            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveNotes}
                loading={savingNotes}
                disabled={notes === (grant.notes || '')}
              >
                Save notes
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Audit Trail (Section 5.9) */}
      <section id="audit" className="space-y-4 pt-4 border-t border-rule">
        <h2 className="text-sm font-semibold text-ink tracking-tight">Audit trail</h2>
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(grant.auditLogs || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted py-4">
                  No recorded audit log events.
                </TableCell>
              </TableRow>
            ) : (
              grant.auditLogs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-muted text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="font-medium text-ink">
                    <Badge tone="neutral">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">{log.details}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Delete equity grant"
        description="This action permanently deletes the grant, its vesting tranches, and exercise records."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-ink">
            Are you sure you want to delete <strong className="font-semibold">{grant.grantIdentifier}</strong>?
          </p>
          <p className="text-muted text-[11px]">
            This cannot be undone. All related calculations, schedule entries, and reminders will be removed.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-rule">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
              Delete grant
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Stepper Modal for Editing */}
      <GrantStepperModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchGrant}
        initialData={grant}
      />

      {/* Record Exercise Modal */}
      <RecordExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSuccess={fetchGrant}
        grant={grant}
      />

      {/* NextSteps Wiring */}
      <NextSteps preset="J1" />
    </div>
  );
}
