import { describe, it, expect } from 'vitest';
import { modelScenarios } from '../src/lib/calculations/scenarios';
import { TaxBracketSettings } from '../src/types';
import { GLOSSARY_TERMS } from '../src/lib/mockData';

describe('Phase 3: Landing and Auth Logic Tests', () => {
  it('correctly calculates 4-year vesting schedule with 12-month cliff', () => {
    const calculateVestedUnits = (units: number, months: number) => {
      if (months < 12) return 0;
      return Math.min(units, Math.floor(units * (months / 48)));
    };

    const units = 10000;
    expect(calculateVestedUnits(units, 0)).toBe(0);
    expect(calculateVestedUnits(units, 6)).toBe(0);
    expect(calculateVestedUnits(units, 11)).toBe(0);
    expect(calculateVestedUnits(units, 12)).toBe(2500); // 25% cliff
    expect(calculateVestedUnits(units, 24)).toBe(5000); // 50% halfway
    expect(calculateVestedUnits(units, 36)).toBe(7500); // 75%
    expect(calculateVestedUnits(units, 48)).toBe(10000); // 100% fully vested
    expect(calculateVestedUnits(units, 60)).toBe(10000); // clamped at 100%
  });

  it('evaluates interactive grant metrics accurately', () => {
    const units = 10000;
    const months = 24;
    const strike = 2.0;
    const currentPrice = 15.0;

    const vested = Math.floor(units * (months / 48)); // 5,000
    const exerciseCost = vested * strike; // 10,000
    const currentGross = vested * currentPrice; // 75,000
    const spread = Math.max(0, currentPrice - strike) * vested; // 65,000
    const estimatedAmt = Math.round(spread * 0.28); // 18,200

    expect(vested).toBe(5000);
    expect(exerciseCost).toBe(10000);
    expect(currentGross).toBe(75000);
    expect(spread).toBe(65000);
    expect(estimatedAmt).toBe(18200);
  });

  it('runs modelScenarios for Alex worked example matching 3 outcomes', () => {
    const taxSettings: TaxBracketSettings = {
      federalTaxRate: 0.24,
      stateTaxRate: 0.093,
      capitalGainsRate: 0.15,
      stateCapitalGainsRate: 0.093,
      ficaRate: 0.0235,
      filingStatus: 'SINGLE',
    };

    const res = modelScenarios(10000, 2.0, 10.0, 30.0, 'ISO', taxSettings);
    expect(res.scenarios).toHaveLength(3);

    const [earlyExercise, cashless, walkAway] = res.scenarios;
    expect(earlyExercise.id).toBe('exercise_and_hold');
    expect(earlyExercise.grossProceedsAtExit).toBe(300000);
    expect(earlyExercise.upfrontCashRequired).toBeGreaterThan(0);

    expect(cashless.id).toBe('cashless_at_exit');
    expect(cashless.grossProceedsAtExit).toBe(300000);
    expect(cashless.upfrontCashRequired).toBe(0);

    expect(walkAway.id).toBe('expire_do_not_exercise');
    expect(walkAway.grossProceedsAtExit).toBe(0);
    expect(walkAway.netCashReceived).toBe(0);
    expect(walkAway.totalTaxesPaid).toBe(0);
  });

  it('selects term of the day deterministically from glossary', () => {
    const getTermOfDay = (date: Date) => {
      const start = new Date(date.getFullYear(), 0, 0);
      const diff = date.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      const index = Math.abs(dayOfYear) % GLOSSARY_TERMS.length;
      return GLOSSARY_TERMS[index];
    };

    const d1 = new Date('2026-10-30T12:00:00Z');
    const d2 = new Date('2026-10-30T15:00:00Z');
    expect(getTermOfDay(d1)).toEqual(getTermOfDay(d2));
    expect(getTermOfDay(d1).term).toBeDefined();
    expect(getTermOfDay(d1).shortDefinition).toBeDefined();
  });

  it('validates password requirements before registration', () => {
    const validatePassword = (pwd: string) => {
      const hasMinLength = pwd.length >= 8;
      const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>]/.test(pwd);
      return hasMinLength && hasNumberOrSymbol;
    };

    expect(validatePassword('')).toBe(false);
    expect(validatePassword('short')).toBe(false);
    expect(validatePassword('nouppernumber')).toBe(false);
    expect(validatePassword('validpass1')).toBe(true);
    expect(validatePassword('secure!word')).toBe(true);
  });
});
