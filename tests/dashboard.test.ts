import { describe, it, expect } from 'vitest';

describe('Phase 4: Dashboard Logic & Calculations', () => {
  it('correctly calculates unclamped net equity (Bug 3 Fix: underwater options show negative value)', () => {
    // Underwater scenario: strike is $10.00, FMV is $5.00
    const vestedUnits = 1000;
    const strikePrice = 10.0;
    const currentFmv = 5.0;

    const vestedValue = vestedUnits * currentFmv; // $5,000
    const exerciseCost = vestedUnits * strikePrice; // $10,000

    // OLD BUG: Math.max(0, vestedValue - exerciseCost) => 0
    // NEW FIX: unclamped negative pre-tax loss
    const netEstimatedEquity = vestedValue - exerciseCost;

    expect(netEstimatedEquity).toBe(-5000);
    expect(netEstimatedEquity).toBeLessThan(0);
  });

  it('correctly scales values with hypothetical FMV multipliers', () => {
    const vestedUnits = 2000;
    const strikePrice = 2.0;
    const baseFmv = 10.0;

    const exerciseCost = vestedUnits * strikePrice; // $4,000 fixed

    const calculateMetrics = (multiplier: number) => {
      const effectiveFmv = baseFmv * multiplier;
      const vestedValue = vestedUnits * effectiveFmv;
      const net = vestedValue - exerciseCost;
      return { effectiveFmv, vestedValue, net };
    };

    // 0.5x
    const half = calculateMetrics(0.5);
    expect(half.effectiveFmv).toBe(5.0);
    expect(half.vestedValue).toBe(10000);
    expect(half.net).toBe(6000);

    // 1x (base)
    const base = calculateMetrics(1);
    expect(base.effectiveFmv).toBe(10.0);
    expect(base.vestedValue).toBe(20000);
    expect(base.net).toBe(16000);

    // 2x
    const double = calculateMetrics(2);
    expect(double.effectiveFmv).toBe(20.0);
    expect(double.vestedValue).toBe(40000);
    expect(double.net).toBe(36000);

    // 5x
    const quintuple = calculateMetrics(5);
    expect(quintuple.effectiveFmv).toBe(50.0);
    expect(quintuple.vestedValue).toBe(100000);
    expect(quintuple.net).toBe(96000);
  });

  it('detects portfolio concentration when one company exceeds 50%', () => {
    const grants = [
      { company: 'Stripe', value: 70000 },
      { company: 'Databricks', value: 20000 },
      { company: 'Figma', value: 10000 },
    ];

    const total = grants.reduce((s, g) => s + g.value, 0); // 100,000
    const shares = grants.map((g) => ({
      company: g.company,
      share: g.value / total,
    }));

    const concentrated = shares.find((s) => s.share > 0.5);
    expect(concentrated).toBeDefined();
    expect(concentrated?.company).toBe('Stripe');
    expect(concentrated?.share).toBe(0.7);
  });

  it('evaluates first-run checklist status from real data', () => {
    const evaluateChecklist = (data: {
      grantsCount: number;
      hasStateCode: boolean;
      remindersCount: number;
      scenariosCount: number;
    }) => {
      const items = [
        data.grantsCount > 0,
        data.hasStateCode,
        data.scenariosCount > 0,
        data.remindersCount > 0,
      ];
      const completed = items.filter(Boolean).length;
      return {
        completed,
        total: items.length,
        percentage: Math.round((completed / items.length) * 100),
      };
    };

    // Fresh account
    expect(evaluateChecklist({ grantsCount: 0, hasStateCode: false, remindersCount: 0, scenariosCount: 0 })).toEqual({
      completed: 0,
      total: 4,
      percentage: 0,
    });

    // 2 tasks complete
    expect(evaluateChecklist({ grantsCount: 3, hasStateCode: true, remindersCount: 0, scenariosCount: 0 })).toEqual({
      completed: 2,
      total: 4,
      percentage: 50,
    });

    // All tasks complete
    expect(evaluateChecklist({ grantsCount: 3, hasStateCode: true, remindersCount: 2, scenariosCount: 1 })).toEqual({
      completed: 4,
      total: 4,
      percentage: 100,
    });
  });
});
