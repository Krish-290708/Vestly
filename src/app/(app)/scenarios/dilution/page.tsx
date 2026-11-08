'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { modelDilution, DilutionRoundInput } from '@/lib/calculations/scenarios';
import { COMPLIANCE_DISCLAIMER } from '@/lib/calculations/taxes';
import { useGrant } from '@/contexts/GrantContext';
import {
  PageHeader,
  Button,
  Field,
  Input,
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
import { money, percent, compactMoney } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export default function DilutionModelerPage() {
  const searchParams = useSearchParams();
  const requestedGrantId = searchParams.get('grant') || searchParams.get('grantId');
  const { setSelectedGrantId: setContextGrantId } = useGrant();
  const { showToast } = useToast();

  const [grants, setGrants] = useState<any[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<any>(null);

  // Initial Capitalization Inputs
  const [currentUnits, setCurrentUnits] = useState<number>(25000);
  const [totalCompanyShares, setTotalCompanyShares] = useState<number>(5000000);
  const [currentValuation, setCurrentValuation] = useState<number>(20000000);

  // Configurable Financing Rounds
  const [rounds, setRounds] = useState<DilutionRoundInput[]>([
    {
      name: 'Series A',
      investmentAmount: 8000000,
      preMoneyValuation: 32000000,
      poolExpansionPct: 0.1,
    },
    {
      name: 'Series B',
      investmentAmount: 25000000,
      preMoneyValuation: 100000000,
      poolExpansionPct: 0.05,
    },
    {
      name: 'Series C (Pre-IPO)',
      investmentAmount: 60000000,
      preMoneyValuation: 300000000,
      poolExpansionPct: 0.0,
    },
  ]);

  // Save Modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [scenarioName, setScenarioName] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const selectGrant = useCallback(
    (g: any) => {
      setSelectedGrant(g);
      setContextGrantId(g.id);
      setCurrentUnits(g.unitsGranted);
      if (g.company?.latestValuation) {
        setCurrentValuation(g.company.latestValuation);
        if (g.company.latestFmvPerShare > 0) {
          setTotalCompanyShares(Math.round(g.company.latestValuation / g.company.latestFmvPerShare));
        }
      }
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

  const dilutionResult = useMemo(
    () => modelDilution(currentUnits, totalCompanyShares, currentValuation, rounds),
    [currentUnits, totalCompanyShares, currentValuation, rounds]
  );

  const handleUpdateRound = (index: number, field: keyof DilutionRoundInput, value: any) => {
    setRounds((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddRound = () => {
    const lastRound = rounds[rounds.length - 1];
    const nextPre = lastRound ? (lastRound.preMoneyValuation + lastRound.investmentAmount) * 2 : 500000000;
    const nextInvest = lastRound ? lastRound.investmentAmount * 2 : 50000000;
    setRounds((prev) => [
      ...prev,
      {
        name: `Round ${prev.length + 1}`,
        investmentAmount: nextInvest,
        preMoneyValuation: nextPre,
        poolExpansionPct: 0.05,
      },
    ]);
  };

  const handleRemoveRound = (index: number) => {
    setRounds((prev) => prev.filter((_, i) => i !== index));
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
          kind: 'DILUTION',
          grantId: selectedGrant?.id || null,
          inputs: {
            currentUnits,
            totalCompanyShares,
            currentValuation,
            rounds,
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
            <span>Dilution</span>
          </div>
        }
        title="Equity dilution modeler"
        contextSentence="Simulate multi-round venture financing, new option pool expansions, and model how share value grows even as ownership percentage dilutes."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleAddRound}>
              + Add round
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
              {g.grantIdentifier} ({g.company?.name || 'Company'})
            </button>
          ))}
        </div>
      )}

      {/* Summary Figure Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border border-[var(--rule)] bg-[var(--card)] text-xs">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
            Starting ownership
          </span>
          <div className="text-base sm:text-lg font-mono font-medium text-[var(--ink)]">
            {percent(dilutionResult.startingOwnershipPct, false, 3)}
          </div>
          <span className="text-[10px] font-mono text-[var(--ink-muted)]">
            Value: {compactMoney(dilutionResult.startingValue)}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
            Final ownership
          </span>
          <div className="text-base sm:text-lg font-mono font-medium text-[var(--ink)]">
            {percent(dilutionResult.finalOwnershipPct, false, 3)}
          </div>
          <span className="text-[10px] font-mono text-[var(--ink-muted)]">
            Value: {compactMoney(dilutionResult.finalValue)}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
            Value growth
          </span>
          <div className="text-base sm:text-lg font-mono font-semibold text-[var(--gain)]">
            +{compactMoney(dilutionResult.finalValue - dilutionResult.startingValue)}
          </div>
          <span className="text-[10px] font-mono text-[var(--gain)]">
            {dilutionResult.startingValue > 0 ? `${Math.round(((dilutionResult.finalValue - dilutionResult.startingValue) / dilutionResult.startingValue) * 100)}% gain` : 'N/A'}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
            Cumulative dilution
          </span>
          <div className="text-base sm:text-lg font-mono font-medium text-[var(--loss)]">
            -{percent(dilutionResult.cumulativeDilutionPct)}
          </div>
          <span className="text-[10px] font-mono text-[var(--ink-muted)]">
            Over {rounds.length} {rounds.length === 1 ? 'round' : 'rounds'}
          </span>
        </div>
      </div>

      {/* Baseline Capitalization Inputs */}
      <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-4">
        <div className="border-b border-[var(--rule)] pb-2 flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
            Current Baseline Capitalization
          </span>
          <span className="text-xs text-[var(--ink-muted)] font-mono">
            Initial Share Price: ${dilutionResult.startingSharePrice.toFixed(2)}/sh
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <Field label="Your equity units">
            <Input
              type="number"
              value={currentUnits}
              onChange={(e) => setCurrentUnits(parseInt(e.target.value) || 0)}
            />
          </Field>

          <Field label="Total fully-diluted company shares">
            <Input
              type="number"
              value={totalCompanyShares}
              onChange={(e) => setTotalCompanyShares(parseInt(e.target.value) || 0)}
            />
          </Field>

          <Field label="Current company valuation ($)">
            <Input
              type="number"
              step="1000000"
              value={currentValuation}
              onChange={(e) => setCurrentValuation(parseInt(e.target.value) || 0)}
            />
          </Field>
        </div>
      </div>

      {/* Multi-Round Configuration Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
          <h2 className="text-sm font-medium text-[var(--ink)]">Financing Rounds Progression</h2>
          <span className="text-xs text-[var(--ink-muted)]">
            Edit investment cheques and pre-money valuations below
          </span>
        </div>

        <div className="space-y-3">
          {rounds.map((round, idx) => {
            const res = dilutionResult.rounds[idx];
            return (
              <div
                key={idx}
                className="border border-[var(--rule)] bg-[var(--card)] p-4 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[var(--ink-muted)]">Round #{idx + 1}:</span>
                    <Input
                      aria-label={`Round ${idx + 1} name`}
                      value={round.name}
                      onChange={(e) => handleUpdateRound(idx, 'name', e.target.value)}
                      className="w-40 font-medium"
                    />
                  </div>
                  {rounds.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRound(idx)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <Field label="Investment raised ($)">
                    <Input
                      type="number"
                      step="500000"
                      value={round.investmentAmount}
                      onChange={(e) => handleUpdateRound(idx, 'investmentAmount', parseFloat(e.target.value) || 0)}
                    />
                  </Field>

                  <Field label="Pre-money valuation ($)">
                    <Input
                      type="number"
                      step="1000000"
                      value={round.preMoneyValuation}
                      onChange={(e) => handleUpdateRound(idx, 'preMoneyValuation', parseFloat(e.target.value) || 0)}
                    />
                  </Field>

                  <Field label="Option pool expansion (%)">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="0.30"
                      value={round.poolExpansionPct ?? 0}
                      onChange={(e) => handleUpdateRound(idx, 'poolExpansionPct', parseFloat(e.target.value) || 0)}
                    />
                  </Field>

                  <div className="p-2.5 bg-[var(--surface-muted)] border border-[var(--rule)] space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block">
                      Post-round status
                    </span>
                    <div className="font-mono font-medium text-[var(--ink)]">
                      {res ? `${percent(res.employeeOwnershipPct, false, 3)} (${money(res.employeeValue)})` : 'Calculating...'}
                    </div>
                    <span className="text-[10px] font-mono text-[var(--ink-muted)] block">
                      Share price: ${res?.sharePrice.toFixed(2)}/sh
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progression Summary Table */}
      <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-3">
        <h3 className="text-sm font-medium text-[var(--ink)] border-b border-[var(--rule)] pb-2">
          Ownership vs Value Progression Summary
        </h3>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Post-Money Valuation</TableHead>
                <TableHead className="text-right">Share Price</TableHead>
                <TableHead className="text-right">Total Company Shares</TableHead>
                <TableHead className="text-right">Ownership %</TableHead>
                <TableHead className="text-right">Your Equity Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Baseline (Initial)</TableCell>
                <TableCell className="text-right font-mono text-xs">{compactMoney(dilutionResult.startingValuation)}</TableCell>
                <TableCell className="text-right font-mono text-xs">${dilutionResult.startingSharePrice.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono text-xs">{dilutionResult.startingShares.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-xs font-semibold">
                  {percent(dilutionResult.startingOwnershipPct, false, 3)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs font-semibold text-[var(--ink)]">
                  {money(dilutionResult.startingValue)}
                </TableCell>
              </TableRow>

              {dilutionResult.rounds.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{r.roundName}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{compactMoney(r.postMoneyValuation)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">${r.sharePrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{r.totalCompanyShares.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {percent(r.employeeOwnershipPct, false, 3)}
                    <span className="text-[10px] text-[var(--loss)] block">
                      -{percent(r.cumulativeDilutionPct)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-[var(--gain)]">
                    {money(r.employeeValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Compliance Disclaimer */}
      <Callout variant="note">
        {COMPLIANCE_DISCLAIMER}
      </Callout>

      {/* NextSteps Wiring */}
      <NextSteps preset="J4" title="Recommended next steps" />

      {/* Save Scenario Modal */}
      <Dialog
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save dilution scenario"
      >
        <div className="space-y-4 pt-2">
          <Field label="Scenario name">
            <Input
              autoFocus
              placeholder="e.g. Series A & B Progression"
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

