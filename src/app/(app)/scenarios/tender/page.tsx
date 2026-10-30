'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { calculateTenderOffer } from '@/lib/calculations/scenarios';
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
import { money, percent, compactMoney } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export default function TenderOfferPage() {
  const searchParams = useSearchParams();
  const requestedGrantId = searchParams.get('grant') || searchParams.get('grantId');
  const { setSelectedGrantId: setContextGrantId } = useGrant();
  const { showToast } = useToast();

  const [grants, setGrants] = useState<any[]>([]);
  const [selectedGrantId, setSelectedGrantId] = useState<string>('custom');

  // Modeling inputs
  const [vestedUnits, setVestedUnits] = useState<number>(5000);
  const [strikePrice, setStrikePrice] = useState<number>(5.0);
  const [currentFmv, setCurrentFmv] = useState<number>(25.0);
  const [tenderPricePerShare, setTenderPricePerShare] = useState<number>(35.0);
  const [tenderParticipationPct, setTenderParticipationPct] = useState<number>(30);
  const [transactionFeePct, setTransactionFeePct] = useState<number>(1.5);
  const [alreadyExercised, setAlreadyExercised] = useState<boolean>(false);
  const [holdingPeriodMonths, setHoldingPeriodMonths] = useState<number>(18);
  const [projectedIpoPrice, setProjectedIpoPrice] = useState<number>(75.0);
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
      setVestedUnits(grant.vestedUnits || grant.unitsGranted);
      setStrikePrice(grant.strikePrice);
      const fmv = grant.company?.latestFmvPerShare || 25.0;
      setCurrentFmv(fmv);
      setTenderPricePerShare(Math.round(fmv * 1.4 * 100) / 100);
      setProjectedIpoPrice(Math.round(fmv * 3.0 * 100) / 100);
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

  const tenderResult = useMemo(
    () =>
      calculateTenderOffer({
        vestedUnits,
        tenderParticipationPct,
        tenderPricePerShare,
        strikePrice,
        grantType,
        alreadyExercised,
        holdingPeriodMonths,
        transactionFeePct,
        taxSettings,
        projectedIpoPrice,
      }),
    [
      vestedUnits,
      tenderParticipationPct,
      tenderPricePerShare,
      strikePrice,
      grantType,
      alreadyExercised,
      holdingPeriodMonths,
      transactionFeePct,
      taxSettings,
      projectedIpoPrice,
    ]
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
          kind: 'TENDER',
          grantId: selectedGrantId !== 'custom' ? selectedGrantId : null,
          inputs: {
            vestedUnits,
            tenderParticipationPct,
            tenderPricePerShare,
            strikePrice,
            grantType,
            alreadyExercised,
            holdingPeriodMonths,
            transactionFeePct,
            projectedIpoPrice,
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
            <span>Tender</span>
          </div>
        }
        title="Secondary tender offer modeler"
        contextSentence="Model company-sponsored tender offer liquidity, transaction fee deductions, and compare immediate cash proceeds against future IPO opportunity cost."
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

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Tender Assumptions (5 cols) */}
        <div className="lg:col-span-5 border border-[var(--rule)] bg-[var(--card)] p-5 space-y-4">
          <div className="border-b border-[var(--rule)] pb-2 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              Parameters
            </span>
            <span className="text-xs text-[var(--ink-muted)]">{grantType} Grant</span>
          </div>

          <div className="space-y-4 text-xs">
            <Field label="Vested units available">
              <Input
                type="number"
                value={vestedUnits}
                onChange={(e) => setVestedUnits(parseInt(e.target.value) || 0)}
              />
            </Field>

            <Field label="Tender offer price ($/sh)">
              <Input
                type="number"
                step="0.10"
                value={tenderPricePerShare}
                onChange={(e) => setTenderPricePerShare(parseFloat(e.target.value) || 0)}
              />
            </Field>

            <Field
              label={
                <span className="flex justify-between items-center">
                  <span>Participation rate ({tenderParticipationPct}%)</span>
                  <span className="font-mono text-[var(--ink-muted)]">
                    {tenderResult.unitsOffered.toLocaleString()} units offered
                  </span>
                </span>
              }
            >
              <input
                type="range"
                min="1"
                max="100"
                value={tenderParticipationPct}
                onChange={(e) => setTenderParticipationPct(parseInt(e.target.value) || 0)}
                className="w-full accent-[var(--ink)] cursor-pointer"
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

            <Field label="Share ownership status">
              <Select
                value={alreadyExercised ? 'EXERCISED' : 'UNEXERCISED'}
                onChange={(e) => setAlreadyExercised(e.target.value === 'EXERCISED')}
              >
                <option value="UNEXERCISED">Unexercised Options (Cashless Tender)</option>
                <option value="EXERCISED">Already Exercised (Owned Shares)</option>
              </Select>
            </Field>

            {alreadyExercised && (
              <Field label="Holding period (months since exercise)">
                <Input
                  type="number"
                  value={holdingPeriodMonths}
                  onChange={(e) => setHoldingPeriodMonths(parseInt(e.target.value) || 0)}
                />
              </Field>
            )}

            <Field label="Transaction fee (%)">
              <Input
                type="number"
                step="0.1"
                value={transactionFeePct}
                onChange={(e) => setTransactionFeePct(parseFloat(e.target.value) || 0)}
              />
            </Field>

            <Field label="Projected future IPO price ($/sh)">
              <Input
                type="number"
                step="1.0"
                value={projectedIpoPrice}
                onChange={(e) => setProjectedIpoPrice(parseFloat(e.target.value) || 0)}
              />
            </Field>
          </div>
        </div>

        {/* Right: Tender Breakdown & Opportunity Cost (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Figures */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border border-[var(--rule)] bg-[var(--card)]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                Units sold
              </span>
              <div className="text-base sm:text-lg font-mono font-medium text-[var(--ink)]">
                {tenderResult.unitsOffered.toLocaleString()}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                Gross proceeds
              </span>
              <div className="text-base sm:text-lg font-mono font-medium text-[var(--ink)]">
                {compactMoney(tenderResult.grossTenderProceeds)}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                Total deductions
              </span>
              <div className="text-base sm:text-lg font-mono font-medium text-[var(--loss)]">
                -{compactMoney(tenderResult.exerciseStrikeOffset + tenderResult.transactionFeeAmount + tenderResult.estimatedTaxes.totalTax)}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                Net cash payout
              </span>
              <div className="text-base sm:text-lg font-mono font-semibold text-[var(--gain)]">
                {compactMoney(tenderResult.netCashPayout)}
              </div>
            </div>
          </div>

          {/* Detailed Waterfall Table */}
          <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
              <h3 className="text-sm font-medium text-[var(--ink)]">
                Tender Settlement Waterfall
              </h3>
              <Badge tone="neutral">{tenderResult.taxCharacter}</Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line Item</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Gross Tender Sale</TableCell>
                  <TableCell className="text-right text-xs text-[var(--ink-muted)]">
                    {tenderResult.unitsOffered.toLocaleString()} units @ ${tenderPricePerShare.toFixed(2)}/sh
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {money(tenderResult.grossTenderProceeds)}
                  </TableCell>
                </TableRow>

                {tenderResult.exerciseStrikeOffset > 0 && (
                  <TableRow className="text-[var(--loss)]">
                    <TableCell className="font-medium">Less: Strike Cost Offset</TableCell>
                    <TableCell className="text-right text-xs">
                      {tenderResult.unitsOffered.toLocaleString()} × ${strikePrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      -{money(tenderResult.exerciseStrikeOffset)}
                    </TableCell>
                  </TableRow>
                )}

                {tenderResult.transactionFeeAmount > 0 && (
                  <TableRow className="text-[var(--loss)]">
                    <TableCell className="font-medium">Less: Transaction Fee</TableCell>
                    <TableCell className="text-right text-xs">
                      {transactionFeePct}% fee on gross sale
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      -{money(tenderResult.transactionFeeAmount)}
                    </TableCell>
                  </TableRow>
                )}

                <TableRow className="font-medium">
                  <TableCell>Net Taxable Gain</TableCell>
                  <TableCell className="text-right text-xs text-[var(--ink-muted)]">Gain basis</TableCell>
                  <TableCell className="text-right font-mono">{money(tenderResult.netTaxableGain)}</TableCell>
                </TableRow>

                <TableRow className="text-[var(--loss)]">
                  <TableCell className="font-medium">Less: Estimated Taxes</TableCell>
                  <TableCell className="text-right text-xs">
                    Federal, State &amp; Payroll
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    -{money(tenderResult.estimatedTaxes.totalTax)}
                  </TableCell>
                </TableRow>

                <TableRow className="font-bold bg-[var(--surface-muted)] text-sm">
                  <TableCell>Net Cash Payout</TableCell>
                  <TableCell className="text-right text-xs text-[var(--ink-muted)]">Direct wire</TableCell>
                  <TableCell className="text-right font-mono text-[var(--gain)]">
                    {money(tenderResult.netCashPayout)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* IPO Opportunity Cost Box */}
          <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-3">
            <div className="border-b border-[var(--rule)] pb-2 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                  Hold vs Sell Analysis
                </span>
                <h3 className="text-sm font-medium text-[var(--ink)]">
                  Retained Ownership Opportunity Cost
                </h3>
              </div>
              <span className="text-xs font-mono text-[var(--ink-muted)]">
                {tenderResult.retainedUnits.toLocaleString()} units retained ({100 - tenderParticipationPct}%)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3 border border-[var(--rule)] bg-[var(--surface-muted)] space-y-1">
                <span className="text-[11px] text-[var(--ink-muted)] block">
                  Retained Value at Tender Price (${tenderPricePerShare.toFixed(2)}/sh)
                </span>
                <div className="text-base font-mono font-medium text-[var(--ink)]">
                  {money(tenderResult.retainedValueAtCurrentFmv)}
                </div>
              </div>

              <div className="p-3 border border-[var(--rule)] bg-[var(--surface-muted)] space-y-1">
                <span className="text-[11px] text-[var(--ink-muted)] block">
                  Projected Value at IPO (${projectedIpoPrice.toFixed(2)}/sh)
                </span>
                <div className="text-base font-mono font-semibold text-[var(--gain)]">
                  {money(tenderResult.retainedValueAtProjectedIpo)}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[var(--ink-muted)] leading-relaxed">
              By retaining {tenderResult.retainedUnits.toLocaleString()} units, you preserve {money(tenderResult.retainedValueAtProjectedIpo - tenderResult.retainedValueAtCurrentFmv)} in potential upside if the company lists at your projected ${projectedIpoPrice.toFixed(2)} target.
            </p>
          </div>

          {/* Compliance Disclaimer */}
          <Callout variant="note">
            {COMPLIANCE_DISCLAIMER}
          </Callout>

          {/* NextSteps Wiring */}
          <NextSteps preset="J2" title="Recommended next steps" />
        </div>
      </div>

      {/* Save Scenario Modal */}
      <Dialog
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save tender scenario"
      >
        <div className="space-y-4 pt-2">
          <Field label="Scenario name">
            <Input
              autoFocus
              placeholder="e.g. Q3 Tender Offer (30% at $35/sh)"
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

