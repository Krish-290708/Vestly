'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { modelScenarios } from '@/lib/calculations/scenarios';
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
} from '@/components/ui';
import { NextSteps } from '@/components/layout/NextSteps';
import { money, percent } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export default function ExerciseStrategyPage() {
  const searchParams = useSearchParams();
  const requestedGrantId = searchParams.get('grant') || searchParams.get('grantId');
  const { setSelectedGrantId: setContextGrantId } = useGrant();
  const { showToast } = useToast();

  const [grants, setGrants] = useState<any[]>([]);
  const [selectedGrantId, setSelectedGrantId] = useState<string>('custom');

  // Modeling inputs
  const [units, setUnits] = useState<number>(5000);
  const [strikePrice, setStrikePrice] = useState<number>(5.0);
  const [currentFmv, setCurrentFmv] = useState<number>(25.0);
  const [assumedExitPrice, setAssumedExitPrice] = useState<number>(65.0);
  const [grantType, setGrantType] = useState<GrantType>('ISO');
  const [stateCode, setStateCode] = useState<string>('CA');

  // Save Modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [scenarioName, setScenarioName] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
    (grant: any) => {
      setSelectedGrantId(grant.id);
      setContextGrantId(grant.id);
      setUnits(grant.vestedUnits || grant.unitsGranted);
      setStrikePrice(grant.strikePrice);
      const fmv = grant.company?.latestFmvPerShare || 25.0;
      setCurrentFmv(fmv);
      setAssumedExitPrice(Math.round(fmv * 2.6 * 100) / 100);
      setGrantType(grant.grantType);
    },
    [setContextGrantId]
  );

  useEffect(() => {
    fetch('/api/grants')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.grants) {
          setGrants(data.grants);
          if (requestedGrantId) {
            const found = data.grants.find((g: any) => g.id === requestedGrantId);
            if (found) selectGrant(found);
          } else if (data.grants.length > 0) {
            selectGrant(data.grants[0]);
          }
        }
      })
      .catch(() => {});
  }, [requestedGrantId, selectGrant]);

  const { scenarios } = useMemo(
    () => modelScenarios(units, strikePrice, currentFmv, assumedExitPrice, grantType, taxSettings),
    [units, strikePrice, currentFmv, assumedExitPrice, grantType, taxSettings]
  );

  const handleSave = async () => {
    if (!scenarioName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scenarioName.trim(),
          kind: 'STRATEGY',
          grantId: selectedGrantId !== 'custom' ? selectedGrantId : null,
          inputs: { units, strikePrice, currentFmv, assumedExitPrice, grantType, stateCode },
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
            <span>Strategy</span>
          </div>
        }
        title="Exercise strategy comparison"
        contextSentence="Evaluate the trade-offs between exercising early to hold for long-term capital gains vs waiting for cashless exercise at exit."
        actions={
          <Button variant="secondary" size="sm" onClick={() => setIsSaveModalOpen(true)}>
            Save scenario
          </Button>
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
                selectedGrantId === g.id
                  ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] font-semibold'
                  : 'bg-[var(--card)] text-[var(--ink-muted)] border-[var(--rule)] hover:border-[var(--ink)]'
              }`}
            >
              {g.grantIdentifier} ({g.company?.name || 'Company'} &bull; {g.grantType})
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedGrantId('custom')}
            className={`px-2.5 py-1 text-xs font-mono border whitespace-nowrap transition-colors ${
              selectedGrantId === 'custom'
                ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] font-semibold'
                : 'bg-[var(--card)] text-[var(--ink-muted)] border-[var(--rule)] hover:border-[var(--ink)]'
            }`}
          >
            Custom inputs
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-4">
        <div className="border-b border-[var(--rule)] pb-2 flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
            Inputs
          </span>
          <span className="text-xs text-[var(--ink-muted)]">
            Assumed exit: <strong className="font-mono text-[var(--ink)]">${assumedExitPrice.toFixed(2)}/sh</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          <Field label="Grant type">
            <Select value={grantType} onChange={(e) => setGrantType(e.target.value as any)}>
              <option value="ISO">ISO</option>
              <option value="NSO">NSO</option>
            </Select>
          </Field>

          <Field label="Units">
            <Input
              type="number"
              value={units}
              onChange={(e) => setUnits(parseInt(e.target.value) || 0)}
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

          <Field label="Current FMV ($/sh)">
            <Input
              type="number"
              step="0.01"
              value={currentFmv}
              onChange={(e) => setCurrentFmv(parseFloat(e.target.value) || 0)}
            />
          </Field>

          <Field label="Exit price slider ($/sh)">
            <div className="space-y-1">
              <input
                type="range"
                min={Math.max(1, Math.round(strikePrice * 0.5))}
                max={Math.round(currentFmv * 6)}
                step="0.5"
                value={assumedExitPrice}
                onChange={(e) => setAssumedExitPrice(parseFloat(e.target.value) || 0)}
                className="w-full accent-[var(--ink)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--ink-muted)]">
                <span>${Math.max(1, Math.round(strikePrice * 0.5))}</span>
                <span>${Math.round(currentFmv * 6)}</span>
              </div>
            </div>
          </Field>
        </div>
      </div>

      {/* Scenarios 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((sc) => {
          const isNetLoss = sc.netCashReceived < 0;
          return (
            <div
              key={sc.id}
              className="border border-[var(--rule)] bg-[var(--card)] p-5 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
                  <Badge tone={sc.riskLevel === 'HIGH' ? 'warn' : 'neutral'}>
                    {sc.riskLevel} risk
                  </Badge>
                  <span className="text-[11px] font-mono text-[var(--ink-muted)]">
                    {sc.taxCharacter.split('(')[0].trim()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-medium text-[var(--ink)]">{sc.name}</h3>
                  <p className="text-xs text-[var(--ink-muted)] mt-1 leading-normal">
                    {sc.strategyDescription}
                  </p>
                </div>

                {/* Key Numbers */}
                <div className="space-y-2 pt-2 border-t border-[var(--rule)] text-xs">
                  <div className="flex justify-between py-1 border-b border-[var(--rule)]">
                    <span className="text-[var(--ink-muted)]">Upfront cash required:</span>
                    <span className="font-mono font-medium text-[var(--ink)]">
                      {money(sc.upfrontCashRequired)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[var(--rule)]">
                    <span className="text-[var(--ink-muted)]">Gross exit proceeds:</span>
                    <span className="font-mono font-medium text-[var(--ink)]">
                      {money(sc.grossProceedsAtExit)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[var(--rule)] text-[var(--loss)]">
                    <span>Total estimated tax:</span>
                    <span className="font-mono font-medium">-{money(sc.totalTaxesPaid)}</span>
                  </div>

                  <div className="flex justify-between py-2 px-2.5 bg-[var(--surface-muted)] border border-[var(--rule)] font-mono font-semibold">
                    <span className="font-sans font-medium text-[var(--ink)]">Net cash received:</span>
                    <span className={isNetLoss ? 'text-[var(--loss)]' : 'text-[var(--gain)]'}>
                      {sc.netCashReceived < 0 ? `-${money(Math.abs(sc.netCashReceived))}` : money(sc.netCashReceived)}
                    </span>
                  </div>

                  {sc.roiOnInvestedCapital !== null && (
                    <div className="flex justify-between py-1 text-[11px] text-[var(--ink-muted)]">
                      <span>ROI on invested cash:</span>
                      <span className="font-mono text-[var(--ink)] font-medium">
                        {percent(sc.roiOnInvestedCapital)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pros & Cons */}
                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--gain)] block mb-1">
                      Advantages
                    </span>
                    <ul className="space-y-1 text-[11px] text-[var(--ink)]">
                      {sc.pros.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[var(--gain)] shrink-0">+</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--loss)] block mb-1">
                      Considerations
                    </span>
                    <ul className="space-y-1 text-[11px] text-[var(--ink-muted)]">
                      {sc.cons.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[var(--loss)] shrink-0">&minus;</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compliance Disclaimer */}
      <Callout variant="note">
        {COMPLIANCE_DISCLAIMER}
      </Callout>

      {/* NextSteps Wiring */}
      <NextSteps preset="J2" title="Recommended next steps" />

      {/* Save Scenario Modal */}
      <Dialog
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save strategy scenario"
      >
        <div className="space-y-4 pt-2">
          <Field label="Scenario name">
            <Input
              autoFocus
              placeholder="e.g. Exercise & Hold Target ($65/sh)"
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

