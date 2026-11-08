import { describe, it, expect } from 'vitest';
import { generateVestingSchedule, calculateVestingProgress } from '../src/lib/calculations/vesting';
import { calculateEquityOutcome, estimateAmtLiability } from '../src/lib/calculations/taxes';
import { modelScenarios, calculate83bAnalysis, calculateTenderOffer } from '../src/lib/calculations/scenarios';
import { money, compactMoney, units, percent, date, relativeDays, signedMoney } from '../src/lib/format';

describe('Vesting Calculations', () => {
  it('generates 4-year schedule with 1-year cliff having 37 event tranches', () => {
    const vestingStart = new Date('2022-01-01');
    const totalShares = 4800;
    const schedule = generateVestingSchedule(totalShares, vestingStart, '4_YEAR_1_YEAR_CLIFF', 12, new Date('2023-01-01'));

    expect(schedule.length).toBe(37);
    expect(schedule[0].unitsVested).toBe(1200);
    expect(schedule[schedule.length - 1].cumulativeVested).toBe(4800);

    const progress = calculateVestingProgress(schedule, 4800, new Date('2023-01-01'));
    expect(progress.vestedUnits).toBe(1200);
    expect(progress.percentVested).toBe(25);
  });

  it('vests 10-unit grant to total exactly 10 with no negative months', () => {
    const schedule = generateVestingSchedule(10, '2024-01-01', '4_YEAR_1_YEAR_CLIFF', 12);
    expect(schedule[schedule.length - 1].cumulativeVested).toBe(10);
    for (const evt of schedule) {
      expect(evt.unitsVested).toBeGreaterThanOrEqual(0);
      expect(evt.cumulativeVested).toBeGreaterThanOrEqual(0);
      expect(evt.cumulativeVested).toBeLessThanOrEqual(10);
    }
  });

  it('produces no empty zero-unit event when cliffMonths = 0', () => {
    const schedule = generateVestingSchedule(4800, '2024-01-01', '4_YEAR_1_YEAR_CLIFF', 0);
    expect(schedule.length).toBe(48);
    for (const evt of schedule) {
      expect(evt.unitsVested).toBeGreaterThan(0);
    }
    expect(schedule[schedule.length - 1].cumulativeVested).toBe(4800);
  });
});

describe('ISO and NSO Tax Calculations', () => {
  const taxSettings = {
    federalTaxRate: 0.32,
    stateTaxRate: 0.093,
    capitalGainsRate: 0.20,
    stateCapitalGainsRate: 0.093,
    ficaRate: 0.0235,
    filingStatus: 'SINGLE' as const,
  };

  it('computes ISO qualifying disposition and AMT spread at known input', () => {
    const isoResult = calculateEquityOutcome({
      unitsToExercise: 1000,
      assumedExitPrice: 50,
      currentFmv: 20,
      strikePrice: 5,
      grantType: 'ISO',
      holdingPeriod: 'LONG_TERM',
      taxSettings,
      yearsFromGrant: 3,
      yearsFromExercise: 2,
    });

    expect(isoResult.exerciseCost).toBe(5000);
    expect(isoResult.grossExitValue).toBe(50000);
    expect(isoResult.grossGain).toBe(45000);
    expect(isoResult.dispositionType).toBe('QUALIFYING');
    expect(isoResult.exerciseTax.amtSpread).toBe(15000);
    expect(isoResult.exerciseTax.totalTaxAtExercise).toBe(0);
  });

  it('computes NSO tax triggers at exercise at known input', () => {
    const nsoResult = calculateEquityOutcome({
      unitsToExercise: 1000,
      assumedExitPrice: 50,
      currentFmv: 20,
      strikePrice: 5,
      grantType: 'NSO',
      holdingPeriod: 'LONG_TERM',
      taxSettings,
    });

    expect(nsoResult.exerciseCost).toBe(5000);
    expect(nsoResult.grossExitValue).toBe(50000);
    expect(nsoResult.grossGain).toBe(45000);
    expect(nsoResult.exerciseTax.ordinaryIncomeTax).toBe(4800);
    expect(nsoResult.exerciseTax.stateTax).toBe(1395);
    expect(nsoResult.exerciseTax.ficaTax).toBe(353);
    expect(nsoResult.exerciseTax.totalTaxAtExercise).toBe(6548);
  });
});

describe('Section 83(b) Deadline Calculations', () => {
  const purchaseDate = new Date('2026-10-01T00:00:00.000Z');

  it('computes deadline strictly as purchase date + 30 days', () => {
    const analysis = calculate83bAnalysis(purchaseDate.toISOString(), 1000, 1, 1, 10, 0.32, 0.20, purchaseDate);
    const expectedDeadline = new Date('2026-10-31T00:00:00.000Z');
    expect(analysis.deadlineDate.getTime()).toBe(expectedDeadline.getTime());
    expect(analysis.taxWith83bToday).toBe(0);
  });

  it('computes days remaining correctly at Day 0', () => {
    const day0 = new Date('2026-10-01T00:00:00.000Z');
    const analysis = calculate83bAnalysis(purchaseDate.toISOString(), 1000, 1, 1, 10, 0.32, 0.20, day0);
    expect(analysis.daysRemaining).toBe(30);
    expect(analysis.isDeadlinePassed).toBe(false);
  });

  it('computes days remaining correctly at Day 29', () => {
    const day29 = new Date('2026-10-30T00:00:00.000Z');
    const analysis = calculate83bAnalysis(purchaseDate.toISOString(), 1000, 1, 1, 10, 0.32, 0.20, day29);
    expect(analysis.daysRemaining).toBe(1);
    expect(analysis.isDeadlinePassed).toBe(false);
  });

  it('computes days remaining correctly at Day 30', () => {
    const day30 = new Date('2026-10-31T00:00:00.000Z');
    const analysis = calculate83bAnalysis(purchaseDate.toISOString(), 1000, 1, 1, 10, 0.32, 0.20, day30);
    expect(analysis.daysRemaining).toBe(0);
    expect(analysis.isDeadlinePassed).toBe(false);
  });

  it('computes days remaining correctly at Day 31 (passed deadline)', () => {
    const day31 = new Date('2026-11-01T00:00:00.000Z');
    const analysis = calculate83bAnalysis(purchaseDate.toISOString(), 1000, 1, 1, 10, 0.32, 0.20, day31);
    expect(analysis.daysRemaining).toBe(0);
    expect(analysis.isDeadlinePassed).toBe(true);
  });
});

describe('Secondary Market & Tender Offer Calculations', () => {
  it('correctly models tender offer participation, fee and net taxable gain', () => {
    const result = calculateTenderOffer({
      vestedUnits: 2000,
      tenderParticipationPct: 25,
      tenderPricePerShare: 50.0,
      strikePrice: 5.0,
      grantType: 'ISO',
      alreadyExercised: false,
      transactionFeePct: 1.0,
      taxSettings: {
        federalTaxRate: 0.32,
        stateTaxRate: 0.093,
        capitalGainsRate: 0.20,
        stateCapitalGainsRate: 0.093,
        ficaRate: 0.0235,
        filingStatus: 'SINGLE',
      },
      projectedIpoPrice: 80.0,
    });

    expect(result.unitsOffered).toBe(500);
    expect(result.retainedUnits).toBe(1500);
    expect(result.grossTenderProceeds).toBe(25000);
    expect(result.exerciseStrikeOffset).toBe(2500);
    expect(result.transactionFeeAmount).toBe(250);
    expect(result.netTaxableGain).toBe(22250);
  });
});

describe('Format Library (src/lib/format.ts)', () => {
  it('formats money with decimals under $100 and no decimals at or above $100', () => {
    expect(money(0)).toBe('$0');
    expect(money(0.5)).toBe('$0.50');
    expect(money(25.5)).toBe('$25.50');
    expect(money(99)).toBe('$99.00');
    expect(money(100)).toBe('$100');
    expect(money(1200)).toBe('$1,200');
    expect(money(50000)).toBe('$50,000');
    expect(money(-1200)).toBe('-$1,200');
    expect(money(-25.5)).toBe('-$25.50');
  });

  it('formats compact money correctly', () => {
    expect(compactMoney(50)).toBe('$50.00');
    expect(compactMoney(1500)).toBe('$1.5K');
    expect(compactMoney(25000)).toBe('$25K');
    expect(compactMoney(500000)).toBe('$500K');
    expect(compactMoney(43000000)).toBe('$43M');
    expect(compactMoney(1200000000)).toBe('$1.2B');
    expect(compactMoney(-25000)).toBe('-$25K');
  });

  it('formats units with commas', () => {
    expect(units(0)).toBe('0');
    expect(units(10)).toBe('10');
    expect(units(1200)).toBe('1,200');
    expect(units(10000)).toBe('10,000');
  });

  it('formats percentages properly', () => {
    expect(percent(25)).toBe('25%');
    expect(percent(25.5)).toBe('25.5%');
    expect(percent(0.20, true)).toBe('20%');
    expect(percent(0.093, true, 2)).toBe('9.3%');
  });

  it('formats dates as "18 Oct 2026"', () => {
    const d = new Date(2026, 9, 18); // Oct is month index 9
    expect(date(d)).toBe('18 Oct 2026');
  });

  it('formats relativeDays accurately', () => {
    const base = new Date(2026, 9, 18);
    expect(relativeDays(new Date(2026, 9, 18), base)).toBe('today');
    expect(relativeDays(new Date(2026, 9, 19), base)).toBe('in 1 day');
    expect(relativeDays(new Date(2026, 10, 1), base)).toBe('in 14 days');
    expect(relativeDays(new Date(2026, 9, 17), base)).toBe('1 day ago');
    expect(relativeDays(new Date(2026, 9, 15), base)).toBe('3 days ago');
  });

  it('formats signedMoney with explicit sign', () => {
    expect(signedMoney(1200)).toBe('+$1,200');
    expect(signedMoney(-1200)).toBe('-$1,200');
    expect(signedMoney(0)).toBe('$0');
  });
});
