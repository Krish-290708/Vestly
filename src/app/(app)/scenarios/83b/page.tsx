'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { calculate83bAnalysis } from '@/lib/calculations/scenarios';
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
import { money, date } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export default function Section83bPage() {
  const searchParams = useSearchParams();
  const requestedGrantId = searchParams.get('grant') || searchParams.get('grantId');
  const { setSelectedGrantId: setContextGrantId } = useGrant();
  const { showToast } = useToast();

  const [grants, setGrants] = useState<any[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<any>(null);

  // Form Inputs
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [unitsPurchased, setUnitsPurchased] = useState<number>(10000);
  const [strikePrice, setStrikePrice] = useState<number>(1.0);
  const [currentFmv, setCurrentFmv] = useState<number>(1.0);
  const [projectedExitPrice, setProjectedExitPrice] = useState<number>(30.0);
  const [ordinaryTaxRate, setOrdinaryTaxRate] = useState<number>(0.32);
  const [capitalGainsRate, setCapitalGainsRate] = useState<number>(0.2);

  // Letter print dialog
  const [showLetterModal, setShowLetterModal] = useState<boolean>(false);
  const [taxpayerName, setTaxpayerName] = useState<string>('Jane Doe');
  const [taxpayerSsn, setTaxpayerSsn] = useState<string>('XXX-XX-XXXX');
  const [taxpayerAddress, setTaxpayerAddress] = useState<string>('123 Equity Way, San Francisco, CA 94107');

  const selectGrant = useCallback(
    (g: any) => {
      setSelectedGrant(g);
      setContextGrantId(g.id);
      setUnitsPurchased(g.unitsGranted);
      setStrikePrice(g.strikePrice);
      const fmv = g.company?.latestFmvPerShare || g.strikePrice;
      setCurrentFmv(fmv);
      setProjectedExitPrice(Math.round(fmv * 15 * 100) / 100);
      const pDate = g.grantDate ? new Date(g.grantDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      setPurchaseDate(pDate);
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

  // Load user name
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.name) setTaxpayerName(data.user.name);
      })
      .catch(() => {});
  }, []);

  const analysis = useMemo(
    () =>
      calculate83bAnalysis(
        purchaseDate,
        unitsPurchased,
        strikePrice,
        currentFmv,
        projectedExitPrice,
        ordinaryTaxRate,
        capitalGainsRate
      ),
    [purchaseDate, unitsPurchased, strikePrice, currentFmv, projectedExitPrice, ordinaryTaxRate, capitalGainsRate]
  );

  const handleCreateReminder = async () => {
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grantId: selectedGrant?.id || null,
          type: 'SECTION_83B_ELECTION',
          title: 'File IRS Section 83(b) election letter',
          description: `Certified mail deadline for ${unitsPurchased.toLocaleString()} early-exercised shares (${selectedGrant?.company?.name || 'Company'}).`,
          dueDate: analysis.deadlineDate.toISOString(),
          urgency: analysis.daysRemaining <= 10 ? 'CRITICAL' : 'HIGH',
        }),
      });

      if (res.ok) {
        showToast({
          title: 'Action added',
          message: `Section 83(b) reminder scheduled for ${date(analysis.deadlineDate)}.`,
          type: 'success',
        });
      } else {
        showToast({ title: 'Error', message: 'Could not create reminder.', type: 'error' });
      }
    } catch {
      showToast({ title: 'Network error', message: 'Could not reach server.', type: 'error' });
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
            <span>83(b)</span>
          </div>
        }
        title="Section 83(b) election modeler"
        contextSentence="Model potential tax savings from filing an IRS Section 83(b) election upon early exercise and track the strict 30-day statutory filing deadline."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleCreateReminder}>
              Add to Actions
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowLetterModal(true)}>
              Generate IRS letter
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

      {/* Deadline Countdown Banner */}
      <div className="border border-[var(--rule)] bg-[var(--card)] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] block">
            IRS Filing Window
          </span>
          <h2 className="text-base font-medium text-[var(--ink)] mt-0.5">
            Deadline: {date(analysis.deadlineDate)}
          </h2>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Section 83(b) elections must be postmarked by USPS within exactly 30 calendar days of share transfer or purchase date.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={analysis.isDeadlinePassed ? 'loss' : analysis.isUrgent ? 'warn' : 'gain'} dot>
            {analysis.isDeadlinePassed
              ? 'Deadline passed'
              : `${analysis.daysRemaining} ${analysis.daysRemaining === 1 ? 'day' : 'days'} remaining`}
          </Badge>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Inputs (5 cols) */}
        <div className="lg:col-span-5 border border-[var(--rule)] bg-[var(--card)] p-5 space-y-4">
          <div className="border-b border-[var(--rule)] pb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              Parameters
            </span>
            <h3 className="text-sm font-medium text-[var(--ink)]">Early Exercise Inputs</h3>
          </div>

          <div className="space-y-4 text-xs">
            <Field label="Share purchase / early exercise date">
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </Field>

            <Field label="Units early exercised">
              <Input
                type="number"
                value={unitsPurchased}
                onChange={(e) => setUnitsPurchased(parseInt(e.target.value) || 0)}
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

            <Field label="FMV at purchase date ($/sh)">
              <Input
                type="number"
                step="0.01"
                value={currentFmv}
                onChange={(e) => setCurrentFmv(parseFloat(e.target.value) || 0)}
              />
            </Field>

            <Field label="Projected exit price ($/sh)">
              <Input
                type="number"
                step="1.0"
                value={projectedExitPrice}
                onChange={(e) => setProjectedExitPrice(parseFloat(e.target.value) || 0)}
              />
            </Field>

            <Field label="Ordinary tax rate">
              <Input
                type="number"
                step="0.01"
                value={ordinaryTaxRate}
                onChange={(e) => setOrdinaryTaxRate(parseFloat(e.target.value) || 0)}
              />
            </Field>

            <Field label="Long-term capital gains rate">
              <Input
                type="number"
                step="0.01"
                value={capitalGainsRate}
                onChange={(e) => setCapitalGainsRate(parseFloat(e.target.value) || 0)}
              />
            </Field>
          </div>
        </div>

        {/* Right: Tax Savings Analysis & Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tax Comparison Hero Box */}
          <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                  Tax Savings Projection
                </span>
                <h3 className="text-base font-medium text-[var(--ink)]">
                  Filing 83(b) vs Not Filing
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[var(--ink-muted)] block uppercase">
                  Projected savings
                </span>
                <span className="text-base sm:text-lg font-mono font-semibold text-[var(--gain)]">
                  {money(analysis.estimatedTaxSavings)}
                </span>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead className="text-right">With Section 83(b)</TableHead>
                  <TableHead className="text-right">Without Section 83(b)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    At Purchase (Today)
                    <span className="block text-[11px] text-[var(--ink-muted)]">
                      Tax on spread at purchase ({money(Math.max(0, currentFmv - strikePrice))}/sh)
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {money(analysis.taxWith83bToday)}
                  </TableCell>
                  <TableCell className="text-right font-mono">$0</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">
                    At Future Vesting
                    <span className="block text-[11px] text-[var(--ink-muted)]">
                      Ordinary income tax as shares vest over 4 years
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">$0</TableCell>
                  <TableCell className="text-right font-mono text-[var(--loss)]">
                    {money(analysis.totalTaxWithout83b - analysis.totalTaxWith83b + analysis.taxWith83bToday)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">
                    At Exit / Sale
                    <span className="block text-[11px] text-[var(--ink-muted)]">
                      Capital gains tax on exit proceeds
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {money(analysis.totalTaxWith83b - analysis.taxWith83bToday)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {money(analysis.totalTaxWith83b - analysis.taxWith83bToday)}
                  </TableCell>
                </TableRow>

                <TableRow className="font-bold bg-[var(--surface-muted)]">
                  <TableCell>Total Lifetime Tax Paid</TableCell>
                  <TableCell className="text-right font-mono text-[var(--gain)]">
                    {money(analysis.totalTaxWith83b)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[var(--loss)]">
                    {money(analysis.totalTaxWithout83b)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* IRS Filing Instructions Checklist */}
          <div className="border border-[var(--rule)] bg-[var(--card)] p-5 space-y-3">
            <h3 className="text-sm font-medium text-[var(--ink)] border-b border-[var(--rule)] pb-2">
              IRS Section 83(b) Filing Protocol
            </h3>

            <ol className="space-y-2.5 text-xs text-[var(--ink)] list-decimal pl-4 leading-relaxed">
              <li>
                <strong>Print and sign three (3) physical copies</strong> of the Section 83(b) election letter (one for IRS, one for employer, one for your records).
              </li>
              <li>
                <strong>Mail to your regional IRS service center</strong> via USPS Certified Mail with Return Receipt Requested within <strong>30 calendar days</strong> of purchase.
              </li>
              <li>
                <strong>Deliver one copy to your employer</strong> (Payroll or Legal team) within the same 30-day window so they adjust W-2 reporting.
              </li>
              <li>
                <strong>Retain postmarked certified mail slip and return receipt</strong> with your permanent personal tax documents indefinitely.
              </li>
            </ol>
          </div>

          {/* Compliance Disclaimer */}
          <Callout variant="note">
            {COMPLIANCE_DISCLAIMER}
          </Callout>

          {/* NextSteps Wiring */}
          <NextSteps preset="J2" title="Recommended next steps" />
        </div>
      </div>

      {/* Printable IRS Letter Dialog */}
      <Dialog
        open={showLetterModal}
        onClose={() => setShowLetterModal(false)}
        title="Printable Section 83(b) election letter"
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-[var(--rule)]">
            <Field label="Taxpayer legal name">
              <Input value={taxpayerName} onChange={(e) => setTaxpayerName(e.target.value)} />
            </Field>
            <Field label="Social Security Number (SSN)">
              <Input value={taxpayerSsn} onChange={(e) => setTaxpayerSsn(e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Taxpayer address">
                <Input value={taxpayerAddress} onChange={(e) => setTaxpayerAddress(e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Letter Body Preview */}
          <div className="p-4 bg-[var(--paper)] border border-[var(--rule)] font-mono text-[11px] leading-relaxed text-[var(--ink)] space-y-3 max-h-80 overflow-y-auto">
            <p className="font-bold text-center uppercase tracking-wide">
              ELECTION UNDER SECTION 83(b) OF THE INTERNAL REVENUE CODE
            </p>
            <p>Date: {date(new Date())}</p>
            <p>
              Internal Revenue Service Center<br />
              [Insert Regional IRS Service Center Address]
            </p>
            <p>Dear Sir or Madam:</p>
            <p>
              The undersigned taxpayer hereby elects, pursuant to Section 83(b) of the Internal Revenue Code of 1986, as amended, to include in gross income for the taxable year the excess (if any) of the fair market value of the property described below over the amount paid for such property.
            </p>
            <ol className="list-decimal pl-4 space-y-1">
              <li><strong>Taxpayer:</strong> {taxpayerName}, SSN: {taxpayerSsn}, Address: {taxpayerAddress}</li>
              <li><strong>Property:</strong> {unitsPurchased.toLocaleString()} shares of Common Stock of {selectedGrant?.company?.name || '[Company Name]'}</li>
              <li><strong>Date of Transfer:</strong> {purchaseDate}</li>
              <li><strong>Taxable Year:</strong> {new Date(purchaseDate).getFullYear()}</li>
              <li><strong>Restrictions:</strong> Subject to repurchase option lapsing pursuant to vesting schedule</li>
              <li><strong>Fair Market Value at Transfer:</strong> ${currentFmv.toFixed(2)} per share (Total: ${money(unitsPurchased * currentFmv)})</li>
              <li><strong>Amount Paid:</strong> ${strikePrice.toFixed(2)} per share (Total: ${money(unitsPurchased * strikePrice)})</li>
              <li><strong>Gross Income Reported:</strong> ${money(Math.max(0, unitsPurchased * (currentFmv - strikePrice)))}</li>
            </ol>
            <p className="pt-2">
              Sincerely,<br /><br /><br />
              _________________________________________<br />
              {taxpayerName}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowLetterModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                window.print();
              }}
            >
              Print letter
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

