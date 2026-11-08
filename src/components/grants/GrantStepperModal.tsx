'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  Stepper,
  StepItem,
  Button,
  Field,
  Input,
  Select,
  Textarea,
  Switch,
  Callout,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { generateVestingSchedule } from '@/lib/calculations/vesting';
import { money, units as formatUnits, date as formatDate } from '@/lib/format';

interface GrantStepperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any; // If provided, modal is in Edit mode
}

const STEPS: StepItem[] = [
  { id: 'identity', label: 'Identity', description: 'Employer and grant type' },
  { id: 'pricing', label: 'Units & pricing', description: 'Volume and strike' },
  { id: 'schedule', label: 'Vesting schedule', description: 'Dates and cliff' },
  { id: 'review', label: 'Review & preview', description: 'Verify terms' },
];

export default function GrantStepperModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: GrantStepperModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = Boolean(initialData?.id);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    ticker: '',
    isPublic: false,
    sector: 'Technology',
    latestFmvPerShare: '15.00',
    grantIdentifier: '',
    grantType: 'ISO',
    unitsGranted: '10000',
    strikePrice: '2.50',
    earlyExercisable: false,
    notes: '',
    grantDate: new Date().toISOString().split('T')[0],
    vestingStartDate: new Date().toISOString().split('T')[0],
    cliffMonths: '12',
    vestingSchedule: '4_YEAR_1_YEAR_CLIFF',
    expirationDate: '',
  });

  // Initialize or reset form data when opened
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          companyName: initialData.company?.name || '',
          ticker: initialData.company?.ticker || '',
          isPublic: Boolean(initialData.company?.isPublic),
          sector: initialData.company?.sector || 'Technology',
          latestFmvPerShare: String(initialData.company?.latestFmvPerShare ?? '15.00'),
          grantIdentifier: initialData.grantIdentifier || '',
          grantType: initialData.grantType || 'ISO',
          unitsGranted: String(initialData.unitsGranted || '10000'),
          strikePrice: String(initialData.strikePrice ?? '2.50'),
          earlyExercisable: Boolean(initialData.earlyExercisable),
          notes: initialData.notes || '',
          grantDate: initialData.grantDate
            ? new Date(initialData.grantDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          vestingStartDate: initialData.vestingStartDate
            ? new Date(initialData.vestingStartDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          cliffMonths: String(initialData.cliffMonths ?? '12'),
          vestingSchedule: initialData.vestingSchedule || '4_YEAR_1_YEAR_CLIFF',
          expirationDate: initialData.expirationDate
            ? new Date(initialData.expirationDate).toISOString().split('T')[0]
            : '',
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        const defaultExpiration = new Date(Date.now() + 10 * 365.25 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        setFormData({
          companyName: '',
          ticker: '',
          isPublic: false,
          sector: 'Technology',
          latestFmvPerShare: '15.00',
          grantIdentifier: '',
          grantType: 'ISO',
          unitsGranted: '10000',
          strikePrice: '2.50',
          earlyExercisable: false,
          notes: '',
          grantDate: today,
          vestingStartDate: today,
          cliffMonths: '12',
          vestingSchedule: '4_YEAR_1_YEAR_CLIFF',
          expirationDate: defaultExpiration,
        });
      }
      setCurrentStep(0);
      setError('');
    }
  }, [isOpen, initialData]);

  // Handle RSU strike reset
  useEffect(() => {
    if (formData.grantType === 'RSU' && formData.strikePrice !== '0') {
      setFormData((prev) => ({ ...prev, strikePrice: '0' }));
    }
  }, [formData.grantType, formData.strikePrice]);

  // Derived preview data for Step 4
  const preview = useMemo(() => {
    const units = parseInt(formData.unitsGranted, 10) || 0;
    const strike = formData.grantType === 'RSU' ? 0 : parseFloat(formData.strikePrice) || 0;
    const fmv = parseFloat(formData.latestFmvPerShare) || 0;
    const cliff = parseInt(formData.cliffMonths, 10) || 0;
    const vStartDate = formData.vestingStartDate ? new Date(formData.vestingStartDate) : new Date();

    const totalCost = units * strike;
    const totalEstValue = units * fmv;
    const spread = Math.max(0, (fmv - strike) * units);

    let scheduleEvents: any[] = [];
    try {
      scheduleEvents = generateVestingSchedule(
        units,
        vStartDate,
        formData.vestingSchedule as any,
        cliff
      );
    } catch {
      scheduleEvents = [];
    }

    return {
      units,
      strike,
      fmv,
      totalCost,
      totalEstValue,
      spread,
      scheduleEvents,
      firstEvent: scheduleEvents[0] || null,
      lastEvent: scheduleEvents[scheduleEvents.length - 1] || null,
    };
  }, [formData]);

  const handleNext = () => {
    setError('');

    if (currentStep === 0) {
      if (!formData.companyName.trim()) {
        setError('Employer name is required.');
        return;
      }
      if (!formData.grantIdentifier.trim()) {
        setError('Grant identifier is required.');
        return;
      }
      if (isNaN(parseFloat(formData.latestFmvPerShare)) || parseFloat(formData.latestFmvPerShare) < 0) {
        setError('Latest FMV must be a valid positive number.');
        return;
      }
    } else if (currentStep === 1) {
      const units = parseInt(formData.unitsGranted, 10);
      if (isNaN(units) || units <= 0) {
        setError('Granted units must be greater than zero.');
        return;
      }
      const strike = parseFloat(formData.strikePrice);
      if (formData.grantType !== 'RSU' && (isNaN(strike) || strike < 0)) {
        setError('Strike price must be zero or a positive amount.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.grantDate) {
        setError('Grant date is required.');
        return;
      }
      if (!formData.vestingStartDate) {
        setError('Vesting start date is required.');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1));
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < STEPS.length - 1) {
      handleNext();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isEditMode ? `/api/grants/${initialData.id}` : '/api/grants';
      const method = isEditMode ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        unitsGranted: parseInt(formData.unitsGranted, 10),
        strikePrice: formData.grantType === 'RSU' ? 0 : parseFloat(formData.strikePrice),
        latestFmvPerShare: parseFloat(formData.latestFmvPerShare),
        cliffMonths: parseInt(formData.cliffMonths, 10) || 0,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save grant details');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit equity grant' : 'Record new equity grant'}
      description="Enter statutory terms and milestones from your option agreement or grant notice."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Stepper Navigation */}
        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(idx) => idx < currentStep && setCurrentStep(idx)}
        />

        {error && (
          <Callout variant="warn" title="Input requirement">
            {error}
          </Callout>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 0: Identity */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Employer name" required hint="Company that issued this equity grant">
                  <Input
                    required
                    placeholder="e.g. Stripe, Acme Corp"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </Field>

                <Field label="Grant identifier" required hint="Internal name or agreement reference">
                  <Input
                    required
                    placeholder="e.g. Initial Hire ISO, Grant-2024-A"
                    value={formData.grantIdentifier}
                    onChange={(e) => setFormData({ ...formData, grantIdentifier: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Grant structure" required hint="Tax and legal classification">
                  <Select
                    value={formData.grantType}
                    onChange={(e) => setFormData({ ...formData, grantType: e.target.value })}
                    options={[
                      { value: 'ISO', label: 'ISO (Incentive Stock Option)' },
                      { value: 'NSO', label: 'NSO (Non-Qualified Option)' },
                      { value: 'RSU', label: 'RSU (Restricted Stock Unit)' },
                      { value: 'ESPP', label: 'ESPP (Purchase Plan)' },
                    ]}
                  />
                </Field>

                <Field label="Current 409A / FMV ($)" required hint="Latest per-share fair market valuation">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    prefixNode="$"
                    value={formData.latestFmvPerShare}
                    onChange={(e) => setFormData({ ...formData, latestFmvPerShare: e.target.value })}
                  />
                </Field>

                <Field label="Public ticker" hint="Stock symbol if publicly traded">
                  <Input
                    placeholder="e.g. SNOW, PLTR"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                  />
                </Field>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-rule">
                <div>
                  <span className="text-xs font-medium text-ink block">Publicly traded company</span>
                  <span className="text-[11px] text-muted block">
                    Check if share prices update from market exchanges
                  </span>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                />
              </div>
            </div>
          )}

          {/* Step 1: Units & Pricing */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Total units granted" required hint="Aggregate share count allocated in agreement">
                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.unitsGranted}
                    onChange={(e) => setFormData({ ...formData, unitsGranted: e.target.value })}
                  />
                </Field>

                <Field
                  label="Strike price per share ($)"
                  required
                  hint={formData.grantType === 'RSU' ? 'Fixed at $0.00 for RSUs' : 'Agreed exercise cost per share'}
                >
                  <Input
                    type="number"
                    step="0.0001"
                    min="0"
                    prefixNode="$"
                    disabled={formData.grantType === 'RSU'}
                    value={formData.grantType === 'RSU' ? '0.00' : formData.strikePrice}
                    onChange={(e) => setFormData({ ...formData, strikePrice: e.target.value })}
                  />
                </Field>
              </div>

              <div className="p-3 bg-sunk rounded-sm border border-rule text-xs space-y-1">
                <div className="flex justify-between text-muted">
                  <span>Aggregate exercise commitment:</span>
                  <span className="font-mono text-ink font-medium">
                    {money(
                      (parseInt(formData.unitsGranted, 10) || 0) *
                        (formData.grantType === 'RSU' ? 0 : parseFloat(formData.strikePrice) || 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Gross estimated value at current FMV:</span>
                  <span className="font-mono text-ink font-medium">
                    {money((parseInt(formData.unitsGranted, 10) || 0) * (parseFloat(formData.latestFmvPerShare) || 0))}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-rule">
                <div>
                  <span className="text-xs font-medium text-ink block">Early exercise permitted</span>
                  <span className="text-[11px] text-muted block">
                    Enables exercising unvested shares immediately (triggers 30-day 83(b) election requirement)
                  </span>
                </div>
                <Switch
                  checked={formData.earlyExercisable}
                  onChange={(checked) => setFormData({ ...formData, earlyExercisable: checked })}
                />
              </div>

              <Field label="Agreement notes (optional)" hint="Contract terms, clawback clauses, or board approval dates">
                <Textarea
                  rows={2}
                  placeholder="e.g. Board approval dated March 15, subject to standard double-trigger acceleration"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Field>
            </div>
          )}

          {/* Step 2: Schedule & Dates */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Grant date" required hint="Date options or units were legally authorized">
                  <Input
                    type="date"
                    required
                    value={formData.grantDate}
                    onChange={(e) => setFormData({ ...formData, grantDate: e.target.value })}
                  />
                </Field>

                <Field label="Vesting start date" required hint="Date vesting clock begins (often start of employment)">
                  <Input
                    type="date"
                    required
                    value={formData.vestingStartDate}
                    onChange={(e) => setFormData({ ...formData, vestingStartDate: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Vesting template" required hint="Standard cadence for monthly or annual tranche releases">
                  <Select
                    value={formData.vestingSchedule}
                    onChange={(e) => setFormData({ ...formData, vestingSchedule: e.target.value })}
                    options={[
                      { value: '4_YEAR_1_YEAR_CLIFF', label: '4 years with 1-year cliff (25% at 12M, then monthly)' },
                      { value: '3_YEAR_MONTHLY', label: '3 years monthly (no cliff, 1/36th per month)' },
                      { value: '4_YEAR_MONTHLY', label: '4 years monthly (no cliff, 1/48th per month)' },
                      { value: 'CUSTOM', label: 'Custom schedule' },
                    ]}
                  />
                </Field>

                <Field label="Cliff duration (months)" hint="Months of service before first tranche releases">
                  <Input
                    type="number"
                    min="0"
                    max="48"
                    value={formData.cliffMonths}
                    onChange={(e) => setFormData({ ...formData, cliffMonths: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Option expiration date" hint="Standard ISO expiration is 10 years from grant date">
                <Input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                />
              </Field>
            </div>
          )}

          {/* Step 3: Review & Schedule Preview */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-sunk rounded-sm border border-rule">
                <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                  Grant terms summary
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted block text-[11px]">Employer</span>
                    <span className="font-semibold text-ink">{formData.companyName}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Structure</span>
                    <span className="font-semibold text-ink">{formData.grantType}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Granted units</span>
                    <span className="font-mono font-semibold text-ink">
                      {formatUnits(preview.units)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Strike price</span>
                    <span className="font-mono font-semibold text-ink">
                      {formData.grantType === 'RSU' ? '$0.00' : money(preview.strike)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Total exercise cost</span>
                    <span className="font-mono font-semibold text-ink">{money(preview.totalCost)}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Current FMV / sh</span>
                    <span className="font-mono font-semibold text-ink">{money(preview.fmv)}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Est. total value</span>
                    <span className="font-mono font-semibold text-profit">
                      {money(preview.totalEstValue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Pre-tax spread</span>
                    <span className="font-mono font-semibold text-ink">{money(preview.spread)}</span>
                  </div>
                </div>
              </div>

              {/* Schedule Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-ink">
                    Generated vesting tranches ({preview.scheduleEvents.length} events)
                  </h4>
                  <span className="text-[11px] text-muted">
                    Schedule: {formData.vestingSchedule.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto border border-rule rounded-sm bg-surface">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tranche date</TableHead>
                        <TableHead className="text-right">Units vesting</TableHead>
                        <TableHead className="text-right">Cumulative units</TableHead>
                        <TableHead className="text-right">Percent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.scheduleEvents.slice(0, 6).map((evt: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-muted">{formatDate(evt.vestDate)}</TableCell>
                          <TableCell className="font-mono text-right font-medium">
                            +{formatUnits(evt.unitsVested)}
                          </TableCell>
                          <TableCell className="font-mono text-right text-muted">
                            {formatUnits(evt.cumulativeVested)}
                          </TableCell>
                          <TableCell className="font-mono text-right text-muted">
                            {preview.units > 0
                              ? Math.round((evt.cumulativeVested / preview.units) * 100)
                              : 0}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                      {preview.scheduleEvents.length > 6 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted italic py-2">
                            ... {preview.scheduleEvents.length - 6} additional intermediate tranches ...
                          </TableCell>
                        </TableRow>
                      )}
                      {preview.lastEvent && preview.scheduleEvents.length > 6 && (
                        <TableRow>
                          <TableCell className="font-mono text-muted">
                            {formatDate(preview.lastEvent.vestDate)}
                          </TableCell>
                          <TableCell className="font-mono text-right font-medium">
                            +{formatUnits(preview.lastEvent.unitsVested)}
                          </TableCell>
                          <TableCell className="font-mono text-right text-muted">
                            {formatUnits(preview.lastEvent.cumulativeVested)}
                          </TableCell>
                          <TableCell className="font-mono text-right text-muted">100%</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-rule">
            <Button
              type="button"
              variant="secondary"
              onClick={currentStep === 0 ? onClose : handleBack}
              disabled={loading}
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < STEPS.length - 1 ? (
                <Button type="button" variant="primary" onClick={handleNext}>
                  Next step
                </Button>
              ) : (
                <Button type="submit" variant="primary" loading={loading}>
                  {isEditMode ? 'Save changes' : 'Record grant'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
