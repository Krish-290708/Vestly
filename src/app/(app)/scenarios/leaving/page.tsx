'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { planDeparture } from '@/lib/calculations/scenarios';
import { COMPLIANCE_DISCLAIMER } from '@/lib/calculations/taxes';
import { getStateRates } from '@/lib/tax/state-rates';
import { GrantType, TaxBracketSettings } from '@/types';
import { useGrant } from '@/contexts/GrantContext';
import {
  PageHeader,
  Button,
  Field,
  Input,
  Select,
  Badge,
  Callout,
  Dialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { NextSteps } from '@/components/layout/NextSteps';
import { money, date, compactMoney } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export default function DeparturePlanningPage() {
  const searchParams = useSearchParams();
  const requestedGrantId = searchParams.get('grant') || searchParams.get('grantId');
  const { setSelectedGrantId: setContextGrantId } = useGrant();
  const { showToast } = useToast();

  const [grants, setGrants] = useState<any[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<any>(null);

  // Form Inputs
  const [departureDate, setDepartureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [ptewDays, setPtewDays] = useState<number>(90);
  const [cashBudget, setCashBudget] = useState<number>(15000);
  const [assumedExitPrice, setAssumedExitPrice] = useState<number>(55.0);
  const [unitsGranted, setUnitsGranted] = useState<number>(10000);
  const [vestedUnits, setVestedUnits] = useState<number>(6500);
  const [strikePrice, setStrikePrice] = useState<number>(3.5);
  const [grantType, setGrantType] = useState<GrantType>('ISO');
  const [companyFmv, setCompanyFmv] = useState<number>(20.0);
  const [stateCode, setStateCode] = useState<string>('CA');

  // Save Modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [scenarioName, setScenarioName] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isScheduling, setIsScheduling] = useState<boolean>(false);

  const stateRates = useMemo(() => getStateRates(stateCode), [stateCode]);

  const taxSettings: TaxBracketSettings = useMemo(
    () => ({
      federalTaxRate: 0.32,
      stateTaxRate: stateRates.incomeTaxRate,
      capitalGainsRate: 0.2,
      stateCapitalGainsRate: stateRates.capitalGainsRate,
      ficaRate: 0.0235,
      filingStatus: 'SINGLE',
    }),
    [stateRates]
  );

  const selectGrant = useCallback(
    (g: any) => {
      setSelectedGrant(g);
      setContextGrantId(g.id);
      setUnitsGranted(g.unitsGranted);
      setVestedUnits(g.vestedUnits || Math.round(g.unitsGranted * 0.65));
      setStrikePrice(g.strikePrice);
      setGrantType(g.grantType);
      const fmv = g.company?.latestFmvPerShare || 20.0;
      setCompanyFmv(fmv);
      setAssumedExitPrice(Math.round(fmv * 2.8 * 100) / 100);
    },
    [setContextGrantId]
  );

  useEffect(() => {
    fetch('/api/grants')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.grants && data.grants.length > 0) {
          setGrants(data.grants);
          if (requestedGrantId) {
            const found = data.grants.find((g: any) => g.id === requestedGrantId);
            if (found) selectGrant(found);
          } else {
            selectGrant(data.grants[0]);
          }
        }
      })
      .catch(() => {});
  }, [requestedGrantId, selectGrant]);

  const plan = useMemo(
    () =>
      planDeparture(
        {
          unitsGranted,
          vestedUnits,
          strikePrice,
          grantType,
          companyFmv,
        },
        departureDate,
        ptewDays,
        cashBudget,
        assumedExitPrice,
        taxSettings
      ),
    [unitsGranted, vestedUnits, strikePrice, grantType, companyFmv, departureDate, ptewDays, cashBudget, assumedExitPrice, taxSettings]
  );

  const handleAddReminders = async () => {
    setIsScheduling(true);
    try {
      let added = 0;
      for (const rem of plan.recommendedReminders) {
        const res = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grantId: selectedGrant?.id || null,
            type: 'POST_TERMINATION_WINDOW',
            title: rem.title,
            description: rem.description,
            dueDate: rem.dueDate.toISOString(),
            urgency: rem.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
          }),
        });
        if (res.ok) added++;
      }

      showToast({
        title: 'Reminders scheduled',
        message: `${added} departure deadline ${added === 1 ? 'reminder' : 'reminders'} added to your Actions centre.`,
        type: 'success',
      });
    } catch {
      showToast({ title: 'Error', message: 'Could not schedule reminders.', type: 'error' });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSave = async () => {
    if (!scenarioName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scenarioName.trim(),
          kind: 'DEPARTURE',
          grantId: selectedGrant?.id || null,
          inputs: {
            departureDate,
            ptewDays,
            cashBudget,
            assumedExitPrice,
            unitsGranted,
            vestedUnits,
            strikePrice,
            grantType,
          },
        }),
      });

      if (res.ok) {
        showToast({
          title: 'Scenario saved',
          message: `"${scenarioName.trim()}" saved to Scenarios Hub.`,
          type: 'success',
        });
        setIsSaveModalOpen(false);
        setScenarioName('');
      } else {
        showToast({ title: 'Save failed', message: 'Unable to save scenario.', type: 'error' });
      }
    } catch {
      showToast({ title: 'Error', message: 'Network error saving scenario.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2">
            <Link href="/scenarios" className="text-[var(--ink-muted)] hover:text-[var(--ink)]">
              Scenarios
            </Link>
            <span>/</span>
            <span>Leaving</span>
          </div>
        }
        title="Departure planning and PTEW runway"
        contextSentence="Model post-termination exercise windows (PTEW), optimize cash budget constraints, understand ISO statutory 90-day conversion rules, and schedule deadline reminders."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddReminders}
              disabled={isScheduling}
            >
              {isScheduling ? 'Scheduling...' : 'Add reminders to Actions'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsSaveModalOpen(true)}>
              Save scenario
            </Button>
          </div>
        }
      />

      {/* Grant Context Selector */}
      {grants.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-[var(--rule)]">
          <span className="text-[var(--ink-muted)] shrink-0 font-medium">Active grant:</span>
          {grants.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => selectGrant(g)}
              className={`px-2.5 py-1 text-xs font-mono border whitespace-nowrap transition-colors ${
                selectedGrant?.id === g.id
                  ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] font-semibold'
                  : 'bg-[var(--card)] text-[var(--ink-muted)] border-[var(--rule)] hover:border-[var(--ink)]'
              }`}
            >
              {g.grantIdentifier} ({g.company?.name || 'Company'} &bull; {g.grantType})
            </button>
          ))}
        </div>
      )}

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Departure Parameters (5 cols) */}
        <div className="lg:col-span-5 border border-[var(--rule)] bg-[var(--card)] p-5 space-y-4">
          <div className="border-b border-[var(--rule)] pb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              Parameters
            </span>
            <h3 className="text-sm font-medium text-[var(--ink)]">Departure Runway Inputs</h3>
          </div>

          <div className="space-y-4 text-xs">
            <Field label="Planned departure date">
              <Input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </Field>

            <Field label="Post-termination exercise window (PTEW days)">
              <div className="space-y-2">
                <Input
                  type="number"
                  value={ptewDays}
                  onChange={(e) => setPtewDays(parseInt(e.target.value) || 0)}
                />
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-[var(--ink-muted)]">Presets:</span>
                  {[30, 90, 180, 365, 1095, 2555].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setPtewDays(d)}
                      className="px-1.5 py-0.5 border border-[var(--rule)] hover:border-[var(--ink)] font-mono text-[var(--ink)] bg-[var(--surface-muted)]"
                    >
                      {d >= 365 ? `${Math.round(d / 365)}y` : `${d}d`}
                    </button>
                  ))}
                </div>
              </div>
            </Field>

            <Field label="Available cash budget for exercise ($)">
              <Input
                type="number"
                step="1000"
                value={cashBudget}
                onChange={(e) => setCashBudget(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </Field>

            <Field label="Vested units at departure">
              <Input
                type="number"
                value={vestedUnits}
                onChange={(e) => setVestedUnits(parseInt(e.target.value) || 0)}
              />
            </Field>

            <Field label="Total units granted">
              <Input
                type="number"
                value={unitsGranted}
                onChange={(e) => setUnitsGranted(parseInt(e.target.value) || 0)}
              />
            </Field>

            <Field label="Strike price ($/sh)">
              <Input
                type="number"
                step="0.01"
                value={strikePrice}
                onChange={(e) => setStrikePrice(parseFloat(e.target.value) || 0)}
              />
            </Field>

            <Field label="Current 409A FMV ($/sh)">
              <Input
                type="number"
                step="0.01"
                value={companyFmv}
                onChange={(e) => setCompanyFmv(parseFloat(e.target.value) || 0)}
              />
            </Field>

            <Field label="Assumed exit price ($/sh)">
              <Input
                type="number"
                step="1.0"
                value={assumedExitPrice}
                onChange={(e) => setAssumedExitPrice(parseFloat(e.target.value) || 0)}
              />
            </Field>
          </div>
        </div>

        {/* Right: Runway Breakdown, Budget Optimization & Warnings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Dates Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 border border-[var(--rule)] bg-[var(--card)] text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                Departure date
              </span>
              <div className="font-mono font-medium text-sm text-[var(--ink)]">
                {date(plan.departureDate)}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                PTEW option deadline
              </span>
              <div className="font-mono font-medium text-sm text-[var(--ink)]">
                {date(plan.deadlineDate)}
              </div>
            </div>

            {plan.isoConversionDate ? (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                  ISO 90-day conversion
                </span>
                <div className="font-mono font-medium text-sm text-[var(--warn)]">
                  {date(plan.isoConversionDate)}
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                  PTEW duration
                </span>
                <div className="font-mono font-medium text-sm text-[var(--ink)]">
                  {ptewDays} calendar days
                </div>
              </div>
            )}
          </div>

          {/* Warnings List */}
          {plan.warnings.length > 0 && (
            <div className="space-y-2">
              {plan.warnings.map((w, idx) => (
                <Callout key={idx} variant="warn">
                  {w}
                </Callout>
              ))}
            </div>
          )}

          {/* Budget Optimization Table */}
          <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                  Affordability Analysis
                </span>
                <h3 className="text-sm font-medium text-[var(--ink)]">
                  Cash Budget Allocation
                </h3>
              </div>
              <Badge tone={plan.isBudgetConstrained ? 'warn' : 'gain'}>
                {plan.isBudgetConstrained ? 'Budget constrained' : 'Fully funded'}
              </Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Upfront Cash</TableHead>
                  <TableHead className="text-right">Projected Value at Exit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Vested Options</TableCell>
                  <TableCell className="text-right font-mono">{plan.vestedUnits.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{money(plan.totalUpfrontCashRequired)}</TableCell>
                  <TableCell className="text-right font-mono">{money(plan.vestedUnits * assumedExitPrice)}</TableCell>
                </TableRow>

                <TableRow className="bg-[var(--surface-muted)]">
                  <TableCell className="font-medium text-[var(--gain)]">Affordable within Budget</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{plan.affordableUnits.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{money(plan.affordableUnits * (strikePrice + (plan.estimatedTaxAtExercise / (plan.vestedUnits || 1))))}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-[var(--gain)]">{money(plan.grossProceedsAtExit)}</TableCell>
                </TableRow>

                {plan.unfundedUnits > 0 && (
                  <TableRow className="text-[var(--loss)]">
                    <TableCell className="font-medium">Unfunded / At-Risk Options</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{plan.unfundedUnits.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">
                      {money(plan.totalUpfrontCashRequired - cashBudget)} shortage
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {money(plan.forfeitedPotentialValue)} potential upside forfeited
                    </TableCell>
                  </TableRow>
                )}

                {plan.unvestedUnits > 0 && (
                  <TableRow className="text-[var(--ink-muted)]">
                    <TableCell>Unvested (Forfeited at departure)</TableCell>
                    <TableCell className="text-right font-mono">{plan.unvestedUnits.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">$0</TableCell>
                    <TableCell className="text-right font-mono">$0</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Recommended Actions Preview */}
          <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
              <h3 className="text-sm font-medium text-[var(--ink)]">
                Recommended Departure Actions
              </h3>
              <span className="text-xs text-[var(--ink-muted)]">
                {plan.recommendedReminders.length} actionable items
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {plan.recommendedReminders.map((rem, idx) => (
                <div key={idx} className="p-3 border border-[var(--rule)] bg-[var(--surface-muted)] flex items-start justify-between gap-3">
                  <div>
                    <span className="font-medium text-[var(--ink)] block">{rem.title}</span>
                    <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">{rem.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-medium text-[var(--ink)] block">
                      {date(rem.dueDate)}
                    </span>
                    <Badge tone={rem.priority === 'HIGH' ? 'warn' : 'neutral'}>
                      {rem.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Disclaimer */}
          <Callout variant="note">
            {COMPLIANCE_DISCLAIMER}
          </Callout>

          {/* NextSteps Wiring */}
          <NextSteps preset="J3" title="Recommended next steps" />
        </div>
      </div>

      {/* Save Scenario Modal */}
      <Dialog
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save departure scenario"
      >
        <div className="space-y-4 pt-2">
          <Field label="Scenario name">
            <Input
              autoFocus
              placeholder="e.g. 90-day PTEW ($15k Budget)"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsSaveModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={!scenarioName.trim() || isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

