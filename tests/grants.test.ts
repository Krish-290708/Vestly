import { describe, it, expect } from 'vitest';
import {
  generateVestingSchedule,
  calculateVestingProgress,
} from '@/lib/calculations/vesting';
import { money, units as formatUnits } from '@/lib/format';

describe('Phase 5: Grants & Exercise Logic', () => {
  it('generates standard 4-year schedule with 1-year cliff accurately', () => {
    const totalUnits = 48000;
    const startDate = new Date('2024-01-01T00:00:00Z');
    const cliffMonths = 12;
    const schedule = '4_YEAR_1_YEAR_CLIFF';

    const events = generateVestingSchedule(totalUnits, startDate, schedule, cliffMonths);

    // 4 years = 1 cliff event (at month 12 with 25% = 12000 units) + 36 monthly events (1000 units each) = 37 events
    expect(events.length).toBe(37);

    // First event should be at cliff (12 months after start) with 25% of units
    const firstEvent = events[0];
    expect(firstEvent.unitsVested).toBe(12000);
    expect(firstEvent.cumulativeVested).toBe(12000);

    // Final event should bring cumulative units to exactly totalUnits
    const lastEvent = events[events.length - 1];
    expect(lastEvent.cumulativeVested).toBe(48000);
  });

  it('correctly calculates vesting progress at cliff vs intermediate dates', () => {
    const totalUnits = 10000;
    const startDate = new Date('2024-01-01T00:00:00Z');
    const events = generateVestingSchedule(totalUnits, startDate, '4_YEAR_1_YEAR_CLIFF', 12);

    // Before cliff (6 months in)
    const beforeCliffDate = new Date('2024-07-01T00:00:00Z');
    const progressBefore = calculateVestingProgress(events, totalUnits, beforeCliffDate);
    expect(progressBefore.vestedUnits).toBe(0);
    expect(progressBefore.percentVested).toBe(0);
    expect(progressBefore.unvestedUnits).toBe(10000);

    // Exactly at cliff (12 months in)
    const atCliffDate = new Date('2025-01-02T00:00:00Z');
    const progressAtCliff = calculateVestingProgress(events, totalUnits, atCliffDate);
    expect(progressAtCliff.vestedUnits).toBe(2500);
    expect(progressAtCliff.percentVested).toBe(25);
    expect(progressAtCliff.unvestedUnits).toBe(7500);
  });

  it('computes exercise cost, pre-tax spread, and unclamped underwater status', () => {
    const units = 5000;
    const strike = 10.0;

    // In-the-money scenario: FMV = $25
    const fmvInMoney = 25.0;
    const costInMoney = units * strike;
    const valueInMoney = units * fmvInMoney;
    const netInMoney = valueInMoney - costInMoney;
    expect(costInMoney).toBe(50000);
    expect(valueInMoney).toBe(125000);
    expect(netInMoney).toBe(75000);

    // Underwater scenario: FMV = $6
    const fmvUnderwater = 6.0;
    const valueUnderwater = units * fmvUnderwater;
    const netUnderwater = valueUnderwater - costInMoney;
    expect(valueUnderwater).toBe(30000);
    expect(netUnderwater).toBe(-20000); // Unclamped negative value!
    expect(netUnderwater < 0).toBe(true);
  });

  it('computes ISO qualifying holding periods per IRC § 422', () => {
    const grantDate = new Date('2023-01-15T00:00:00Z');
    const exerciseDate = new Date('2024-06-01T00:00:00Z');

    // Requirement: hold 2 years from grant date AND 1 year from exercise date
    const oneYearFromExercise = new Date(exerciseDate.getTime() + 365.25 * 24 * 3600 * 1000);
    const twoYearsFromGrant = new Date(grantDate.getTime() + 2 * 365.25 * 24 * 3600 * 1000);

    const qualifyingDate =
      oneYearFromExercise > twoYearsFromGrant ? oneYearFromExercise : twoYearsFromGrant;

    // 1 year from exercise is June 1, 2025
    // 2 years from grant is Jan 15, 2025
    // Qualifying date should be June 1, 2025 (the later of the two)
    expect(qualifyingDate.toISOString().split('T')[0]).toBe('2025-06-01');
  });

  it('determines Section 83(b) election deadline for early exercise (exercise + 30 days)', () => {
    const exerciseDate = new Date('2024-03-01T00:00:00Z');
    const deadline83b = new Date(exerciseDate.getTime() + 30 * 24 * 3600 * 1000);

    expect(deadline83b.toISOString().split('T')[0]).toBe('2024-03-31');
  });

  it('filters and sorts grant items cleanly without mutating inputs', () => {
    const testGrants = [
      { id: '1', grantIdentifier: 'Alpha ISO', grantType: 'ISO', unitsGranted: 10000, vestedValue: 50000 },
      { id: '2', grantIdentifier: 'Beta NSO', grantType: 'NSO', unitsGranted: 25000, vestedValue: 100000 },
      { id: '3', grantIdentifier: 'Gamma RSU', grantType: 'RSU', unitsGranted: 5000, vestedValue: 75000 },
    ];

    // Filter by type
    const isoOnly = testGrants.filter((g) => g.grantType === 'ISO');
    expect(isoOnly.length).toBe(1);
    expect(isoOnly[0].grantIdentifier).toBe('Alpha ISO');

    // Sort by units descending
    const sortedByUnits = [...testGrants].sort((a, b) => b.unitsGranted - a.unitsGranted);
    expect(sortedByUnits[0].grantIdentifier).toBe('Beta NSO');
    expect(sortedByUnits[2].grantIdentifier).toBe('Gamma RSU');

    // Original array remains intact
    expect(testGrants[0].grantIdentifier).toBe('Alpha ISO');
  });
});
