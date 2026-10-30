'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculateEquityOutcome, COMPLIANCE_DISCLAIMER } from '@/lib/calculations/taxes';
import { breakEvenExitPrice, amtSensitivity } from '@/lib/calculations/scenarios';
import { STATE_OPTIONS, getStateRates } from '@/lib/tax/state-rates';
import { GrantType, TaxBracketSettings } from '@/types';
import TaxBreakdownCard from '@/components/calculator/TaxBreakdownCard';
import { useGrant } from '@/contexts/GrantContext';
import {
  PageHeader,
  Button,
  Field,
  Input,
  Select,
  Tooltip,
  Badge,
  Figure,
  Dialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Callout,
} from '@/components/ui';
import { NextSteps } from '@/components/layout/NextSteps';
import { money, percent, compactMoney } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export default function CalculatorPage() {
  const searchParams = useSearchParams();
  const requestedGrantId = searchParams.get('grant') || searchParams.get('grantId');
  const { setSelectedGrantId: setContextGrantId } = useGrant();
  const { showToast } = useToast();

  const [grants, setGrants] = useState<any[]>([]);
  const [selectedGrantId, setSelectedGrantId] = useState<string>('custom');

  // Interactive Inputs (Scenario A)
  const [grantType, setGrantType] = useState<GrantType>('ISO');
  const [unitsToExercise, setUnitsToExercise] = useState<number>(5000);
  const [strikePrice, setStrikePrice] = useState<number>(5.0);
  const [currentFmv, setCurrentFmv] = useState<number>(25.0);
  const [assumedExitPrice, setAssumedExitPrice] = useState<number>(50.0);
  const [holdingPeriod, setHoldingPeriod] = useState<'LONG_TERM' | 'SHORT_TERM'>('LONG_TERM');

  // Tax Assumptions
  const [stateCode, setStateCode] = useState<string>('CA');
  const [filingStatus, setFilingStatus] = useState<'SINGLE' | 'MARRIED_JOINT' | 'HEAD_OF_HOUSEHOLD'>('SINGLE');
  const [annualIncome, setAnnualIncome] = useState<number>(180000);

  // Compare Mode State (Scenario B)
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareExitPrice, setCompareExitPrice] = useState<number>(75.0);
  const [compareHoldingPeriod, setCompareHoldingPeriod] = useState<'LONG_TERM' | 'SHORT_TERM'>('LONG_TERM');

  // Save Scenario Modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [scenarioName, setScenarioName] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Show AMT Sensitivity drawer/view
  const [showAmtSensitivity, setShowAmtSensitivity] = useState<boolean>(false);

  // Derive tax settings from state selection
  const stateRates = useMemo(() => getStateRates(stateCode), [stateCode]);

  const taxSettings: TaxBracketSettings = useMemo(
    () => ({
      federalTaxRate: annualIncome > 240000 ? 0.35 : 0.32,
      stateTaxRate: stateRates.incomeTaxRate,
      capitalGainsRate: annualIncome > 250000 ? 0.2 : 0.15,
      stateCapitalGainsRate: stateRates.capitalGainsRate,
      ficaRate: 0.0235,
      filingStatus,
    }),
    [annualIncome, stateRates, filingStatus]
  );

  const selectGrant = useCallback(
    (grant: any) => {
      setSelectedGrantId(grant.id);
      setContextGrantId(grant.id);
      setGrantType(grant.grantType);
      setUnitsToExercise(grant.vestedUnits || grant.unitsGranted);
      setStrikePrice(grant.strikePrice);
      const fmv = grant.company?.latestFmvPerShare || 25.0;
      setCurrentFmv(fmv);
      setAssumedExitPrice(Math.round(fmv * 2.5 * 100) / 100);
      setCompareExitPrice(Math.round(fmv * 4.0 * 100) / 100);
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
            if (found) {
              selectGrant(found);
            }
          } else if (data.grants.length > 0) {
            selectGrant(data.grants[0]);
          }
        }
      })
      .catch(() => {});
  }, [requestedGrantId, selectGrant]);

  // Fetch user default tax preferences from settings
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          if (data.user.stateCode) setStateCode(data.user.stateCode);
          if (data.user.filingStatus) setFilingStatus(data.user.filingStatus);
          if (data.user.annualIncome) setAnnualIncome(data.user.annualIncome);
        }
      })
      .catch(() => {});
  }, []);

  // Primary calculation (Scenario A)
  const resultA = useMemo(
    () =>
      calculateEquityOutcome({
        unitsToExercise,
        assumedExitPrice,
        currentFmv,
        strikePrice,
        grantType,
        holdingPeriod,
        taxSettings,
      }),
    [unitsToExercise, assumedExitPrice, currentFmv, strikePrice, grantType, holdingPeriod, taxSettings]
  );

  // Secondary calculation (Scenario B for Compare Mode)
  const resultB = useMemo(
    () =>
      calculateEquityOutcome({
        unitsToExercise,
        assumedExitPrice: compareExitPrice,
        currentFmv,
        strikePrice,
        grantType,
        holdingPeriod: compareHoldingPeriod,
        taxSettings,
      }),
    [unitsToExercise, compareExitPrice, currentFmv, strikePrice, grantType, compareHoldingPeriod, taxSettings]
  );

  // Break-even exit price analysis
  const breakEven = useMemo(
    () => breakEvenExitPrice(strikePrice, currentFmv, grantType, taxSettings),
    [strikePrice, currentFmv, grantType, taxSettings]
  );

  // AMT sensitivity grid
  const amtGrid = useMemo(
    () => (grantType === 'ISO' ? amtSensitivity(unitsToExercise, strikePrice, currentFmv, annualIncome, filingStatus === 'MARRIED_JOINT' ? 'MARRIED_JOINT' : 'SINGLE') : []),
    [grantType, unitsToExercise, strikePrice, currentFmv, annualIncome, filingStatus]
  );

  // Multiple sensitivity table points
  const sensitivityPoints = useMemo(() => {
    const multiples = [0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0];
    return multiples.map((mult) => {
      const exitPx = Math.round(currentFmv * mult * 100) / 100;
      const res = calculateEquityOutcome({
        unitsToExercise,
        assumedExitPrice: exitPx,
        currentFmv,
        strikePrice,
        grantType,
        holdingPeriod,
        taxSettings,
      });
      const roi = res.exerciseCost > 0 ? Math.round((res.estimatedNetProfit / res.exerciseCost) * 100) : null;
      return {
        multiple: mult,
        exitPrice: exitPx,
        grossExitValue: res.grossExitValue,
        totalTax: res.totalEstimatedTax,
        netProceeds: res.estimatedNetProfit,
        roi,
        isCurrent: Math.abs(exitPx - assumedExitPrice) < 0.01,
      };
    });
  }, [currentFmv, unitsToExercise, strikePrice, grantType, holdingPeriod, taxSettings, assumedExitPrice]);

  // Handle Save Scenario
  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) return;
    setIsSaving(true);
    try {
      const inputs = {
        grantType,
        unitsToExercise,
        strikePrice,
        currentFmv,
        assumedExitPrice,
        holdingPeriod,
        stateCode,
        filingStatus,
        annualIncome,
      };

      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scenarioName.trim(),
          kind: 'CALCULATOR',
          grantId: selectedGrantId !== 'custom' ? selectedGrantId : null,
          inputs,
        }),
      });

      if (res.ok) {
        showToast({
          title: 'Scenario saved',
          message: `"${scenarioName.trim()}" has been saved to your scenarios archive.`,
          type: 'success',
        });
        setIsSaveModalOpen(false);
        setScenarioName('');
      } else {
        showToast({
          title: 'Save failed',
          message: 'Unable to save scenario. Please try again.',
          type: 'error',
        });
      }
    } catch {
      showToast({
        title: 'Network error',
        message: 'Could not reach server to save scenario.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle CSV Export (RFC 4180 compliant)
  const handleExportCsv = () => {
    const escapeCsv = (val: any) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines: string[] = [];
    lines.push('VESTLY EQUITY CALCULATOR REPORT');
    lines.push(`Generated,${new Date().toISOString()}`);
    lines.push('');
    lines.push('ASSUMPTIONS');
    lines.push(`Grant Type,${escapeCsv(grantType)}`);
    lines.push(`Units Modeled,${unitsToExercise}`);
    lines.push(`Strike Price,${strikePrice.toFixed(2)}`);
    lines.push(`Current 409A FMV,${currentFmv.toFixed(2)}`);
    lines.push(`Assumed Exit Price,${assumedExitPrice.toFixed(2)}`);
    lines.push(`Holding Period,${escapeCsv(holdingPeriod)}`);
    lines.push(`State Tax Code,${escapeCsv(stateCode)} (${(stateRates.incomeTaxRate * 100).toFixed(1)}%)`);
    lines.push(`Filing Status,${escapeCsv(filingStatus)}`);
    lines.push(`Annual Household Income,${annualIncome}`);
    lines.push('');
    lines.push('WATERFALL BREAKDOWN');
    lines.push('Line Item,Amount');
    lines.push(`Gross Proceeds,${resultA.grossExitValue}`);
    lines.push(`Less: Strike Cost,-${resultA.exerciseCost}`);
    lines.push(`Gross Pre-Tax Gain,${resultA.grossGain}`);
    lines.push(`Less: Exercise Tax (AMT / Ordinary),-${resultA.exerciseTax.totalTaxAtExercise}`);
    lines.push(`Less: Exit Capital Gains Tax,-${resultA.exitTax.totalTaxAtExit}`);
    lines.push(`Total Estimated Taxes,-${resultA.totalEstimatedTax}`);
    lines.push(`Net Estimated Proceeds,${resultA.estimatedNetProfit}`);
    lines.push('');
    lines.push('VALUATION MULTIPLES SENSITIVITY');
    lines.push('Multiple,Exit Price,Gross Proceeds,Total Tax,Net Proceeds,ROI %');
    sensitivityPoints.forEach((pt) => {
      lines.push(`${pt.multiple}x,${pt.exitPrice.toFixed(2)},${pt.grossExitValue},${pt.totalTax},${pt.netProceeds},${pt.roi !== null ? `${pt.roi}%` : 'N/A'}`);
    });

    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vestly-calculator-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isNetLoss = resultA.estimatedNetProfit < 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <PageHeader
        eyebrow="Modeler"
        title="Calculator"
        contextSentence="Model financial outcomes, statutory tax liabilities, and net take-home across valuation multiples."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={isCompareMode ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsCompareMode(!isCompareMode)}
            >
              {isCompareMode ? 'Exit compare' : 'Compare mode'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSaveModalOpen(true)}
            >
              Save scenario
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Grant Context Pill Bar */}
      {grants.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-[var(--rule)]">
          <span className="text-[var(--ink-muted)] shrink-0 font-medium">Load grant:</span>
          {grants.map((g) => {
            const isSelected = selectedGrantId === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => selectGrant(g)}
                className={`px-2.5 py-1 text-xs font-mono border whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] font-semibold'
                    : 'bg-[var(--card)] text-[var(--ink-muted)] border-[var(--rule)] hover:border-[var(--ink)]'
                }`}
              >
                {g.grantIdentifier} ({g.company?.name || 'Company'} &bull; {g.grantType})
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setSelectedGrantId('custom');
            }}
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
        {/* Left Panel: Assumptions (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6 border border-[var(--rule)] bg-[var(--card)] p-6">
          <div className="border-b border-[var(--rule)] pb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              Parameters
            </span>
            <h2 className="text-base font-medium text-[var(--ink)]">
              Assumptions
            </h2>
          </div>

          <div className="space-y-4">
            {/* Grant Type */}
            <Field label="Grant type">
              <Select
                value={grantType}
                onChange={(e) => setGrantType(e.target.value as GrantType)}
              >
                <option value="ISO">Incentive Stock Option (ISO)</option>
                <option value="NSO">Non-Qualified Stock Option (NSO)</option>
                <option value="RSU">Restricted Stock Unit (RSU)</option>
                <option value="ESPP">Employee Stock Purchase Plan (ESPP)</option>
              </Select>
            </Field>

            {/* Units */}
            <Field
              label={
                <span className="flex items-center gap-1.5">
                  Units to model
                  <Tooltip content="The quantity of options or shares you plan to exercise or evaluate.">
                    <span className="cursor-help text-[11px] text-[var(--ink-muted)] border-b border-dotted border-[var(--rule)]">?</span>
                  </Tooltip>
                </span>
              }
            >
              <Input
                type="number"
                min="1"
                step="1"
                value={unitsToExercise}
                onChange={(e) => setUnitsToExercise(Math.max(1, parseInt(e.target.value) || 0))}
              />
            </Field>

            {/* Strike Price */}
            {grantType !== 'RSU' && (
              <Field
                label={
                  <span className="flex items-center gap-1.5">
                    Strike price ($/sh)
                    <Tooltip content="The fixed purchase price per share stated in your option grant contract.">
                      <span className="cursor-help text-[11px] text-[var(--ink-muted)] border-b border-dotted border-[var(--rule)]">?</span>
                    </Tooltip>
                  </span>
                }
              >
                <Input
                  type="number"
                  min="0.00"
                  step="0.01"
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </Field>
            )}

            {/* Current FMV */}
            <Field
              label={
                <span className="flex items-center gap-1.5">
                  Current 409A FMV ($/sh)
                  <Tooltip content="Fair Market Value per share determined by an independent 409A valuation appraisal.">
                    <span className="cursor-help text-[11px] text-[var(--ink-muted)] border-b border-dotted border-[var(--rule)]">?</span>
                  </Tooltip>
                </span>
              }
            >
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={currentFmv}
                onChange={(e) => setCurrentFmv(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
              />
            </Field>

            {/* Assumed Exit Price & Quick Multiples */}
            <Field
              label={
                <span className="flex items-center gap-1.5">
                  Assumed exit price ($/sh)
                  <Tooltip content="Projected share price at a future IPO, acquisition, or secondary liquidity event.">
                    <span className="cursor-help text-[11px] text-[var(--ink-muted)] border-b border-dotted border-[var(--rule)]">?</span>
                  </Tooltip>
                </span>
              }
            >
              <div className="space-y-2">
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={assumedExitPrice}
                  onChange={(e) => setAssumedExitPrice(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                />
                <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                  <span className="text-[var(--ink-muted)]">Multiples:</span>
                  {[0.5, 1, 2, 5, 10].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAssumedExitPrice(Math.round(currentFmv * m * 100) / 100)}
                      className="px-1.5 py-0.5 border border-[var(--rule)] hover:border-[var(--ink)] font-mono text-[var(--ink)] bg-[var(--surface-muted)]"
                    >
                      {m}x
                    </button>
                  ))}
                </div>
              </div>
            </Field>

            {/* Holding Period */}
            <Field
              label={
                <span className="flex items-center gap-1.5">
                  Holding period at exit
                  <Tooltip content="Holding stock for at least 1 year after exercise (and 2 years from grant for ISOs) qualifies gains for preferential Long-Term Capital Gains rates.">
                    <span className="cursor-help text-[11px] text-[var(--ink-muted)] border-b border-dotted border-[var(--rule)]">?</span>
                  </Tooltip>
                </span>
              }
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setHoldingPeriod('LONG_TERM')}
                  className={`p-2 border text-center font-medium transition-colors ${
                    holdingPeriod === 'LONG_TERM'
                      ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
                      : 'bg-[var(--card)] text-[var(--ink)] border-[var(--rule)] hover:border-[var(--ink)]'
                  }`}
                >
                  Long-term (&gt; 1 yr)
                </button>
                <button
                  type="button"
                  onClick={() => setHoldingPeriod('SHORT_TERM')}
                  className={`p-2 border text-center font-medium transition-colors ${
                    holdingPeriod === 'SHORT_TERM'
                      ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
                      : 'bg-[var(--card)] text-[var(--ink)] border-[var(--rule)] hover:border-[var(--ink)]'
                  }`}
                >
                  Short-term (&le; 1 yr)
                </button>
              </div>
            </Field>

            <div className="border-t border-[var(--rule)] pt-4 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block">
                Tax Profile
              </span>

              {/* State Dropdown (50 states + DC) */}
              <Field label="State of residence">
                <Select
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                >
                  {STATE_OPTIONS.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </Select>
              </Field>

              {/* Filing Status */}
              <Field label="Filing status">
                <Select
                  value={filingStatus}
                  onChange={(e) => setFilingStatus(e.target.value as any)}
                >
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED_JOINT">Married Filing Jointly</option>
                  <option value="HEAD_OF_HOUSEHOLD">Head of Household</option>
                </Select>
              </Field>

              {/* Annual Income */}
              <Field
                label={
                  <span className="flex items-center gap-1.5">
                    Annual household income ($)
                    <Tooltip content="Used to calculate regular income tax brackets and AMT exemption phaseout thresholds.">
                      <span className="cursor-help text-[11px] text-[var(--ink-muted)] border-b border-dotted border-[var(--rule)]">?</span>
                    </Tooltip>
                  </span>
                }
              >
                <Input
                  type="number"
                  min="0"
                  step="5000"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Right Panel: Results & Waterfall (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Compare Mode Banner */}
          {isCompareMode ? (
            <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                    Comparison Analysis
                  </span>
                  <h3 className="text-base font-medium text-[var(--ink)]">
                    Scenario A vs Scenario B
                  </h3>
                </div>
                <Badge tone="accent">Compare active</Badge>
              </div>

              {/* Scenario B Controls */}
              <div className="p-3 bg-[var(--surface-muted)] border border-[var(--rule)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-[var(--ink-muted)] block mb-1">
                    Scenario B Exit Price ($/sh):
                  </label>
                  <Input
                    type="number"
                    step="0.50"
                    value={compareExitPrice}
                    onChange={(e) => setCompareExitPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--ink-muted)] block mb-1">
                    Scenario B Holding Period:
                  </label>
                  <Select
                    value={compareHoldingPeriod}
                    onChange={(e) => setCompareHoldingPeriod(e.target.value as any)}
                  >
                    <option value="LONG_TERM">Long-Term (&gt; 1 yr)</option>
                    <option value="SHORT_TERM">Short-Term (&le; 1 yr)</option>
                  </Select>
                </div>
              </div>

              {/* Side-by-Side Comparison Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Scenario A (${assumedExitPrice}/sh)</TableHead>
                    <TableHead className="text-right">Scenario B (${compareExitPrice}/sh)</TableHead>
                    <TableHead className="text-right">Delta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Gross Proceeds</TableCell>
                    <TableCell className="text-right font-mono">{money(resultA.grossExitValue)}</TableCell>
                    <TableCell className="text-right font-mono">{money(resultB.grossExitValue)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {money(resultB.grossExitValue - resultA.grossExitValue)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Exercise Strike Cost</TableCell>
                    <TableCell className="text-right font-mono">{money(resultA.exerciseCost)}</TableCell>
                    <TableCell className="text-right font-mono">{money(resultB.exerciseCost)}</TableCell>
                    <TableCell className="text-right font-mono">$0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Estimated Taxes</TableCell>
                    <TableCell className="text-right font-mono">{money(resultA.totalEstimatedTax)}</TableCell>
                    <TableCell className="text-right font-mono">{money(resultB.totalEstimatedTax)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {money(resultB.totalEstimatedTax - resultA.totalEstimatedTax)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-[var(--surface-muted)]">
                    <TableCell>Net Take-Home</TableCell>
                    <TableCell className={`text-right font-mono ${resultA.estimatedNetProfit < 0 ? 'text-[var(--loss)]' : 'text-[var(--gain)]'}`}>
                      {resultA.estimatedNetProfit < 0 ? `-${money(Math.abs(resultA.estimatedNetProfit))}` : money(resultA.estimatedNetProfit)}
                    </TableCell>
                    <TableCell className={`text-right font-mono ${resultB.estimatedNetProfit < 0 ? 'text-[var(--loss)]' : 'text-[var(--gain)]'}`}>
                      {resultB.estimatedNetProfit < 0 ? `-${money(Math.abs(resultB.estimatedNetProfit))}` : money(resultB.estimatedNetProfit)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {resultB.estimatedNetProfit - resultA.estimatedNetProfit >= 0
                        ? `+${money(resultB.estimatedNetProfit - resultA.estimatedNetProfit)}`
                        : `-${money(Math.abs(resultB.estimatedNetProfit - resultA.estimatedNetProfit))}`}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <>
              {/* Hero Figure Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border border-[var(--rule)] bg-[var(--card)]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                    Gross proceeds
                  </span>
                  <div className="text-base sm:text-lg font-mono font-medium text-[var(--ink)]">
                    {compactMoney(resultA.grossExitValue)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                    Strike cost
                  </span>
                  <div className="text-base sm:text-lg font-mono font-medium text-[var(--ink)]">
                    {compactMoney(resultA.exerciseCost)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                    Estimated tax
                  </span>
                  <div className="text-base sm:text-lg font-mono font-medium text-[var(--ink)]">
                    {compactMoney(resultA.totalEstimatedTax)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                    Net take-home
                  </span>
                  <div className={`text-base sm:text-lg font-mono font-semibold ${isNetLoss ? 'text-[var(--loss)]' : 'text-[var(--gain)]'}`}>
                    {resultA.estimatedNetProfit < 0 
                      ? `-${compactMoney(Math.abs(resultA.estimatedNetProfit))}` 
                      : compactMoney(resultA.estimatedNetProfit)}
                  </div>
                </div>
              </div>

              {/* Break-Even Banner */}
              <div className="p-4 border border-[var(--rule)] bg-[var(--card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)] block">
                    Break-Even Exit Target
                  </span>
                  <span className="font-mono font-medium text-sm text-[var(--ink)]">
                    ${breakEven.breakEvenPrice.toFixed(2)} / share
                  </span>
                  <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                    {breakEven.explanation}
                  </p>
                </div>
                <Badge tone={breakEven.isUnderwater ? 'loss' : 'neutral'}>
                  {breakEven.isUnderwater ? 'Underwater' : `${breakEven.requiredGainPct >= 0 ? '+' : ''}${breakEven.requiredGainPct}% from FMV`}
                </Badge>
              </div>

              {/* Detailed Waterfall Card */}
              <TaxBreakdownCard
                result={resultA}
                grantType={grantType}
                holdingPeriod={holdingPeriod}
              />

              {/* Valuation Multiple Sensitivity Table */}
              <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                      Sensitivity Matrix
                    </span>
                    <h3 className="text-sm font-medium text-[var(--ink)]">
                      Outcomes Across Valuation Multiples
                    </h3>
                  </div>
                  <span className="text-[11px] text-[var(--ink-muted)]">Based on ${currentFmv.toFixed(2)} FMV</span>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Multiple</TableHead>
                        <TableHead className="text-right">Share Price</TableHead>
                        <TableHead className="text-right">Gross Proceeds</TableHead>
                        <TableHead className="text-right">Total Tax</TableHead>
                        <TableHead className="text-right">Net Take-Home</TableHead>
                        <TableHead className="text-right">ROI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sensitivityPoints.map((pt) => {
                        const isLossRow = pt.netProceeds < 0;
                        return (
                          <TableRow
                            key={pt.multiple}
                            className={pt.isCurrent ? 'bg-[var(--surface-muted)] font-medium' : ''}
                          >
                            <TableCell className="font-mono text-xs">
                              {pt.multiple}x {pt.isCurrent && '(current)'}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">${pt.exitPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{compactMoney(pt.grossExitValue)}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{compactMoney(pt.totalTax)}</TableCell>
                            <TableCell className={`text-right font-mono text-xs font-semibold ${isLossRow ? 'text-[var(--loss)]' : 'text-[var(--gain)]'}`}>
                              {pt.netProceeds < 0 ? `-${compactMoney(Math.abs(pt.netProceeds))}` : compactMoney(pt.netProceeds)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {pt.roi !== null ? `${pt.roi}%` : 'N/A'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* ISO AMT Sensitivity Drawer/Accordion */}
              {grantType === 'ISO' && (
                <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                        Tax Exposure
                      </span>
                      <h3 className="text-sm font-medium text-[var(--ink)]">
                        Alternative Minimum Tax (AMT) Sensitivity
                      </h3>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAmtSensitivity(!showAmtSensitivity)}
                    >
                      {showAmtSensitivity ? 'Hide AMT table' : 'View AMT grid'}
                    </Button>
                  </div>

                  {showAmtSensitivity && (
                    <div className="pt-2 overflow-x-auto space-y-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Multiple</TableHead>
                            <TableHead className="text-right">FMV at Exercise</TableHead>
                            <TableHead className="text-right">Spread / Share</TableHead>
                            <TableHead className="text-right">Total Spread</TableHead>
                            <TableHead className="text-right">Estimated AMT</TableHead>
                            <TableHead className="text-right">Effective Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {amtGrid.map((row) => (
                            <TableRow key={row.multiple}>
                              <TableCell className="font-mono text-xs">{row.multiple}x</TableCell>
                              <TableCell className="text-right font-mono text-xs">${row.fmv.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-mono text-xs">${row.spreadPerShare.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{compactMoney(row.totalSpread)}</TableCell>
                              <TableCell className="text-right font-mono text-xs font-semibold text-[var(--ink)]">
                                {money(row.amtLiability)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs">{percent(row.effectiveAmtRatePct)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <p className="text-[11px] text-[var(--ink-muted)] pt-1">
                        AMT is calculated assuming ${annualIncome.toLocaleString()} baseline annual income for {filingStatus} filing status.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* NextSteps Wiring (Preset J2: Cost & Tax -> Scenarios -> Actions) */}
          <NextSteps preset="J2" title="Recommended next steps" />
        </div>
      </div>

      {/* Save Scenario Modal */}
      <Dialog
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save calculation scenario"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[var(--ink-muted)]">
            Store this configuration to restore assumptions or compare exit valuations at any time in the Scenarios Hub.
          </p>

          <Field label="Scenario name">
            <Input
              autoFocus
              placeholder="e.g. Series B IPO Target ($50/sh)"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveScenario();
              }}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSaveModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveScenario}
              disabled={!scenarioName.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save scenario'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
