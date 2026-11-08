'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  Button,
  Field,
  Input,
  Select,
  Callout,
} from '@/components/ui';
import { money, units as formatUnits } from '@/lib/format';

interface RecordExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grant: any;
}

export default function RecordExerciseModal({
  isOpen,
  onClose,
  onSuccess,
  grant,
}: RecordExerciseModalProps) {
  const [units, setUnits] = useState('');
  const [exerciseDate, setExerciseDate] = useState('');
  const [fmvAtExercise, setFmvAtExercise] = useState('');
  const [dispositionType, setDispositionType] = useState('N_A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strikePrice = grant?.strikePrice ?? 0;
  const currentFmv = grant?.company?.latestFmvPerShare ?? 0;
  const vestedUnits = grant?.vestedUnits ?? 0;
  const totalExercised = grant?.totalExercised ?? 0;
  const earlyExercisable = Boolean(grant?.earlyExercisable);

  const maxExercisable = earlyExercisable
    ? Math.max(0, (grant?.unitsGranted ?? 0) - totalExercised)
    : Math.max(0, vestedUnits - totalExercised);

  useEffect(() => {
    if (isOpen && grant) {
      const today = new Date().toISOString().split('T')[0];
      setExerciseDate(today);
      setUnits(maxExercisable > 0 ? String(maxExercisable) : '0');
      setFmvAtExercise(String(currentFmv || strikePrice || 10));
      setDispositionType(grant.grantType === 'ISO' ? 'QUALIFYING' : 'N_A');
      setError('');
    }
  }, [isOpen, grant, maxExercisable, currentFmv, strikePrice]);

  const calculations = useMemo(() => {
    const u = parseInt(units, 10) || 0;
    const fmv = parseFloat(fmvAtExercise) || 0;
    const totalCost = u * strikePrice;
    const spread = Math.max(0, (fmv - strikePrice) * u);

    // Check if early exercising unvested units
    const isEarly = earlyExercisable && totalExercised + u > vestedUnits;
    const unvestedExercisedCount = isEarly
      ? Math.min(u, totalExercised + u - vestedUnits)
      : 0;

    let taxEstimate = 0;
    if (grant?.grantType === 'ISO') {
      taxEstimate = spread * 0.28; // AMT estimate
    } else if (grant?.grantType === 'NSO') {
      taxEstimate = spread * 0.37; // Ordinary income estimate
    }

    return {
      units: u,
      fmv,
      totalCost,
      spread,
      taxEstimate,
      isEarly,
      unvestedExercisedCount,
    };
  }, [units, fmvAtExercise, strikePrice, earlyExercisable, totalExercised, vestedUnits, grant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const u = parseInt(units, 10);
    if (isNaN(u) || u <= 0) {
      setError('Please enter a valid number of units to exercise.');
      return;
    }

    if (u > maxExercisable) {
      setError(`Cannot exercise more than ${maxExercisable.toLocaleString()} available units.`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/grants/${grant.id}/exercise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitsExercised: u,
          exerciseDate,
          fmvAtExercise: parseFloat(fmvAtExercise),
          dispositionType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record exercise event');
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
      title="Record option exercise"
      description={`Exercise options for ${grant?.grantIdentifier || 'grant'} (${grant?.company?.name || 'Company'}).`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Callout variant="warn" title="Exercise restriction">
            {error}
          </Callout>
        )}

        <div className="p-3 bg-sunk rounded-sm border border-rule text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <span className="text-muted block text-[11px]">Grant structure</span>
            <span className="font-semibold text-ink">{grant?.grantType}</span>
          </div>
          <div>
            <span className="text-muted block text-[11px]">Strike price</span>
            <span className="font-mono font-semibold text-ink">{money(strikePrice)}</span>
          </div>
          <div>
            <span className="text-muted block text-[11px]">Exercisable units</span>
            <span className="font-mono font-semibold text-ink">
              {formatUnits(maxExercisable)}
            </span>
          </div>
          <div>
            <span className="text-muted block text-[11px]">Current FMV / share</span>
            <span className="font-mono font-semibold text-ink">{money(currentFmv)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Units to exercise"
            required
            hint={`Maximum available: ${formatUnits(maxExercisable)} units`}
          >
            <Input
              type="number"
              min="1"
              max={maxExercisable}
              required
              value={units}
              onChange={(e) => setUnits(e.target.value)}
            />
          </Field>

          <Field label="Exercise execution date" required hint="Date exercise notice was delivered">
            <Input
              type="date"
              required
              value={exerciseDate}
              onChange={(e) => setExerciseDate(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="FMV at exercise ($ / share)"
            required
            hint="Fair market value on the date of exercise"
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              required
              prefixNode="$"
              value={fmvAtExercise}
              onChange={(e) => setFmvAtExercise(e.target.value)}
            />
          </Field>

          {grant?.grantType === 'ISO' ? (
            <Field
              label="Disposition intention"
              hint="Holding shares qualifies for LTCG treatment"
            >
              <Select
                value={dispositionType}
                onChange={(e) => setDispositionType(e.target.value)}
                options={[
                  { value: 'QUALIFYING', label: 'Hold shares (aim for LTCG holding period)' },
                  { value: 'DISQUALIFYING', label: 'Disqualifying disposition (immediate sale)' },
                ]}
              />
            </Field>
          ) : (
            <Field label="Settlement method" hint="Payment and tax withholding structure">
              <Select
                value={dispositionType}
                onChange={(e) => setDispositionType(e.target.value)}
                options={[
                  { value: 'N_A', label: 'Standard cash exercise & share delivery' },
                  { value: 'CASHLESS', label: 'Cashless exercise / sell to cover' },
                ]}
              />
            </Field>
          )}
        </div>

        {/* Live Calculation Preview */}
        <div className="p-3 bg-sunk rounded-sm border border-rule text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted">Total exercise strike cost (cash outlay):</span>
            <span className="font-mono font-semibold text-ink">
              {money(calculations.totalCost)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Aggregate value at exercise FMV:</span>
            <span className="font-mono font-medium text-ink">
              {money(calculations.units * calculations.fmv)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Total pre-tax spread at exercise:</span>
            <span className="font-mono font-medium text-ink">
              {money(calculations.spread)}
            </span>
          </div>
          {grant?.grantType === 'ISO' && (
            <div className="flex justify-between pt-1 border-t border-rule text-[11px]">
              <span className="text-muted">Estimated AMT spread exposure (28% bracket):</span>
              <span className="font-mono font-semibold text-ink">
                {money(calculations.taxEstimate)}
              </span>
            </div>
          )}
          {grant?.grantType === 'NSO' && (
            <div className="flex justify-between pt-1 border-t border-rule text-[11px]">
              <span className="text-muted">Estimated ordinary income tax (37% bracket):</span>
              <span className="font-mono font-semibold text-loss">
                {money(calculations.taxEstimate)}
              </span>
            </div>
          )}
        </div>

        {/* Statutory warnings */}
        {calculations.isEarly && (
          <Callout variant="warn" title="Section 83(b) deadline">
            You are exercising {formatUnits(calculations.unvestedExercisedCount)} unvested shares.
            To avoid ordinary income tax on future vesting gains, you must file an IRC Section 83(b) election with the IRS within 30 days of this exercise date.
          </Callout>
        )}

        {grant?.grantType === 'ISO' && dispositionType === 'QUALIFYING' && (
          <Callout variant="info" title="Holding period tracking">
            Vestly will automatically add a holding reminder for 1 year from this exercise date and 2 years from the grant date to ensure eligibility for long-term capital gains rates.
          </Callout>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-rule">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={maxExercisable <= 0}
          >
            Record exercise
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
