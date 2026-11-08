'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { FigureStrip } from '@/components/dashboard/FigureStrip';
import { NeedsAttention, ActionReminderItem } from '@/components/dashboard/NeedsAttention';
import { VestingTimelineChart, GrantForTimeline } from '@/components/dashboard/VestingTimelineChart';
import { ScheduleSection, GrantEventItem } from '@/components/dashboard/ScheduleSection';
import { AllocationSection, GrantAllocationItem } from '@/components/dashboard/AllocationSection';
import { GrantsTable, GrantTableRow } from '@/components/dashboard/GrantsTable';
import { WatchlistStrip } from '@/components/dashboard/WatchlistStrip';
import { ActivityAndLearn, AuditLogItem } from '@/components/dashboard/ActivityAndLearn';
import { FirstRunChecklist } from '@/components/dashboard/FirstRunChecklist';
import { NextSteps } from '@/components/layout/NextSteps';
import GrantIntakeModal from '@/components/grants/GrantIntakeModal';
import { date as formatDate, relativeDays } from '@/lib/format';

export default function DashboardPage() {
  const [grants, setGrants] = useState<any[]>([]);
  const [reminders, setReminders] = useState<ActionReminderItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [taxDefaults, setTaxDefaults] = useState<any | null>(null);
  const [hasScenarios, setHasScenarios] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fmvMultiplier, setFmvMultiplier] = useState(1);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [grantsRes, actionsRes, settingsRes] = await Promise.all([
        fetch('/api/grants'),
        fetch('/api/actions'),
        fetch('/api/settings'),
      ]);

      if (grantsRes.ok) {
        const data = await grantsRes.json();
        setGrants(data.grants || []);
      }
      if (actionsRes.ok) {
        const data = await actionsRes.json();
        setReminders(data.reminders || []);
        setAuditLogs(data.auditLogs || []);
      }
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setTaxDefaults(data.taxDefaults || null);
        if (data.savedScenarios && data.savedScenarios.length > 0) {
          setHasScenarios(true);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derived summaries for PageHeader dynamic sentence
  const { uniqueCompanies, nextVestInfo } = useMemo<{
    uniqueCompanies: string[];
    nextVestInfo: { date: Date; units: number; companyName: string } | null;
  }>(() => {
    const compSet = new Set<string>();
    let nextEvent: { date: Date; units: number; companyName: string } | null = null;
    const now = new Date();

    grants.forEach((g) => {
      const cName = g.company?.name || 'Company';
      compSet.add(cName);

      (g.vestingEvents || []).forEach((e: any) => {
        const vDate = new Date(e.vestDate);
        if (vDate > now) {
          if (!nextEvent || vDate < nextEvent.date) {
            nextEvent = {
              date: vDate,
              units: e.unitsVested,
              companyName: cName,
            };
          }
        }
      });
    });

    return {
      uniqueCompanies: Array.from(compSet),
      nextVestInfo: nextEvent,
    };
  }, [grants]);

  // Dynamic context sentence per 4.1 & C6:
  // "3 grants at 3 companies. Next vest: 250 units on 1 Nov (in 14 days)."
  const contextSentence = useMemo(() => {
    if (grants.length === 0) {
      return 'No equity grants recorded yet. Add your first grant to track vesting milestones and exercise costs.';
    }

    const grantCountStr = `${grants.length} ${grants.length === 1 ? 'grant' : 'grants'}`;
    const compCountStr = `at ${uniqueCompanies.length} ${uniqueCompanies.length === 1 ? 'company' : 'companies'}`;

    if (nextVestInfo) {
      const dateStr = formatDate(nextVestInfo.date);
      const relStr = relativeDays(nextVestInfo.date);
      return `${grantCountStr} ${compCountStr}. Next vest: ${nextVestInfo.units.toLocaleString()} units on ${dateStr} (${relStr}).`;
    }

    return `${grantCountStr} ${compCountStr}. All registered grants are fully vested.`;
  }, [grants, uniqueCompanies, nextVestInfo]);

  // Normalized data adapters for child components
  const metricGrants = useMemo(() => {
    return grants.map((g) => ({
      id: g.id,
      grantIdentifier: g.grantIdentifier,
      grantType: g.grantType,
      unitsGranted: g.unitsGranted,
      vestedUnits: g.vestedUnits || 0,
      strikePrice: g.strikePrice,
      currentFmv: g.company?.latestFmvPerShare || 0,
      companyName: g.company?.name || 'Company',
    }));
  }, [grants]);

  const timelineGrants: GrantForTimeline[] = useMemo(() => {
    return grants.map((g) => ({
      id: g.id,
      grantIdentifier: g.grantIdentifier,
      companyName: g.company?.name || 'Company',
      unitsGranted: g.unitsGranted,
      strikePrice: g.strikePrice,
      currentFmv: g.company?.latestFmvPerShare || 0,
      cliffDate: g.vestingStartDate
        ? new Date(
            new Date(g.vestingStartDate).setMonth(
              new Date(g.vestingStartDate).getMonth() + (g.cliffMonths || 12)
            )
          ).toISOString()
        : null,
      vestingEvents: g.vestingEvents,
    }));
  }, [grants]);

  const scheduleGrants: GrantEventItem[] = useMemo(() => {
    return grants.map((g) => ({
      id: g.id,
      grantIdentifier: g.grantIdentifier,
      companyName: g.company?.name || 'Company',
      grantType: g.grantType,
      strikePrice: g.strikePrice,
      currentFmv: g.company?.latestFmvPerShare || 0,
      vestingEvents: g.vestingEvents,
    }));
  }, [grants]);

  const allocationGrants: GrantAllocationItem[] = useMemo(() => {
    return grants.map((g) => ({
      id: g.id,
      companyName: g.company?.name || 'Company',
      grantType: g.grantType,
      vestedUnits: g.vestedUnits || 0,
      currentFmv: g.company?.latestFmvPerShare || 0,
    }));
  }, [grants]);

  const tableGrants: GrantTableRow[] = useMemo(() => {
    return grants.map((g) => ({
      id: g.id,
      grantIdentifier: g.grantIdentifier,
      grantType: g.grantType,
      companyName: g.company?.name || 'Company',
      unitsGranted: g.unitsGranted,
      vestedUnits: g.vestedUnits || 0,
      percentVested: g.percentVested || 0,
      strikePrice: g.strikePrice,
      currentFmv: g.company?.latestFmvPerShare || 0,
      status: g.status,
    }));
  }, [grants]);

  const grantTypes = useMemo(() => {
    return Array.from(new Set(grants.map((g) => g.grantType)));
  }, [grants]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-2 border-b border-rule pb-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16">
      {/* 4.1 PageHeader: Your equity with dynamic summary sentence */}
      <PageHeader
        eyebrow="Overview"
        title="Your equity"
        contextSentence={contextSentence}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDashboardData}
              title="Refresh dashboard metrics"
              className="p-2 border border-rule rounded-xs bg-surface hover:bg-sunk text-muted hover:text-ink transition-colors"
              aria-label="Refresh metrics"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs font-sans text-xs font-medium bg-accent text-accent-contrast hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add grant</span>
            </button>
          </div>
        }
      />

      {/* 4.11 First-run checklist (computed from real data, dismissible) */}
      <FirstRunChecklist
        hasGrants={grants.length > 0}
        hasTaxDefaults={Boolean(taxDefaults?.stateCode)}
        hasReminders={reminders.length > 0}
        hasScenarios={hasScenarios}
        onAddGrantClick={() => setIsModalOpen(true)}
      />

      {/* 4.2 Needs Attention: Plain rows or calm empty state */}
      <NeedsAttention reminders={reminders} />

      {/* 4.3 & 4.4 Figure Strip with FMV Multiple Controls (Bug 3 Fixed: unclamped negatives) */}
      <FigureStrip
        grants={metricGrants}
        fmvMultiplier={fmvMultiplier}
        onMultiplierChange={setFmvMultiplier}
      />

      {/* 4.5 Vesting Timeline Chart: stacked by grant, today/cliff markers, 12M/All toggle */}
      <VestingTimelineChart
        grants={timelineGrants}
        fmvMultiplier={fmvMultiplier}
      />

      {/* 4.6 Next 12 months rolling projection + next 10 vest events table */}
      <ScheduleSection
        grants={scheduleGrants}
        fmvMultiplier={fmvMultiplier}
      />

      {/* 4.7 Equity Allocation bars by company and grant type + neutral concentration notice */}
      <AllocationSection
        grants={allocationGrants}
        fmvMultiplier={fmvMultiplier}
      />

      {/* 4.8 Grants Table: dense 7-column sortable table linking to /grants/[id] */}
      <GrantsTable
        grants={tableGrants}
        fmvMultiplier={fmvMultiplier}
      />

      {/* 4.9 Watchlist Strip */}
      <WatchlistStrip />

      {/* 4.10 Recent Activity (AuditLog readable sentences) and Learn Next */}
      <ActivityAndLearn
        auditLogs={auditLogs}
        grantTypes={grantTypes}
      />

      {/* 4.12 NextSteps (Preset J2: Cost & Tax -> Scenarios -> Actions) */}
      <NextSteps preset="J2" title="Recommended next steps" />

      {/* Add Grant Modal */}
      <GrantIntakeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
