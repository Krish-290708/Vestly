import { describe, it, expect } from 'vitest';
import {
  breakEvenExitPrice,
  amtSensitivity,
  planDeparture,
  modelDilution,
  modelScenarios,
  calculate83bAnalysis,
  calculateTenderOffer,
} from '../src/lib/calculations/scenarios';
import { calculateEquityOutcome } from '../src/lib/calculations/taxes';

describe('Break-Even Exit Price Calculation', () => {
  it('calculates break-even price for in-the-money ISO grant', () => {
    const strike = 5.0;
    const fmv = 20.0;
    const result = breakEvenExitPrice(strike, fmv, 'ISO', {
      capitalGainsRate: 0.2,
      stateCapitalGainsRate: 0.093,
    });

    expect(result.strikePrice).toBe(strike);
    expect(result.currentFmv).toBe(fmv);
    expect(result.isUnderwater).toBe(false);
    expect(result.cashlessBreakEven).toBe(strike);
    expect(result.breakEvenPrice).toBeGreaterThanOrEqual(strike);
    expect(result.requiredGainPct).toBeDefined();
    expect(result.explanation).toContain('exit price must reach');
  });

  it('detects underwater status when strike exceeds FMV', () => {
    const strike = 30.0;
    const fmv = 10.0;
    const result = breakEvenExitPrice(strike, fmv, 'ISO');

    expect(result.isUnderwater).toBe(true);
    expect(result.breakEvenPrice).toBe(30.0);
    expect(result.requiredGainPct).toBe(200); // (30 - 10)/10 * 100 = 200%
    expect(result.explanation).toContain('underwater');
  });
});

describe('AMT Sensitivity Grid', () => {
  it('generates 8 sensitivity points with progressive valuation multiples', () => {
    const units = 5000;
    const strike = 5.0;
    const baseFmv = 25.0;
    const grid = amtSensitivity(units, strike, baseFmv, 180000, 'SINGLE');

    expect(grid.length).toBe(8);
    expect(grid[0].multiple).toBe(0.5);
    expect(grid[grid.length - 1].multiple).toBe(5.0);

    // Multiples above 1.0 should have progressive spread
    const point1x = grid.find((p) => p.multiple === 1.0);
    const point2x = grid.find((p) => p.multiple === 2.0);

    expect(point1x?.spreadPerShare).toBe(20.0); // 25 - 5
    expect(point2x?.spreadPerShare).toBe(45.0); // 50 - 5
    expect(point2x?.totalSpread).toBeGreaterThan(point1x?.totalSpread || 0);
  });
});

describe('Departure Planning and PTEW Runway', () => {
  it('calculates deadline strictly as departure date + PTEW days', () => {
    const depDate = '2026-11-01T00:00:00.000Z';
    const plan = planDeparture(
      {
        unitsGranted: 10000,
        vestedUnits: 7500,
        strikePrice: 2.0,
        grantType: 'ISO',
        companyFmv: 15.0,
      },
      depDate,
      90,
      50000,
      40.0
    );

    const expectedDeadline = new Date(new Date(depDate).getTime() + 90 * 24 * 60 * 60 * 1000);
    expect(plan.deadlineDate.getTime()).toBe(expectedDeadline.getTime());
    expect(plan.vestedUnits).toBe(7500);
    expect(plan.unvestedUnits).toBe(2500);
    expect(plan.isBudgetConstrained).toBe(false);
    expect(plan.recommendedReminders.length).toBeGreaterThan(0);
  });

  it('triggers ISO conversion warning when PTEW exceeds 90 days', () => {
    const depDate = '2026-11-01T00:00:00.000Z';
    const plan = planDeparture(
      {
        unitsGranted: 10000,
        vestedUnits: 10000,
        strikePrice: 2.0,
        grantType: 'ISO',
        companyFmv: 10.0,
      },
      depDate,
      365,
      50000,
      30.0
    );

    expect(plan.isoConversionDate).not.toBeNull();
    const isoWarning = plan.warnings.find((w) => w.includes('ISO'));
    expect(isoWarning).toBeDefined();
    expect(isoWarning).toContain('90 days');
    expect(plan.recommendedReminders.length).toBe(2); // PTEW + ISO conversion
  });

  it('optimizes cash budget and identifies unfunded options', () => {
    const plan = planDeparture(
      {
        unitsGranted: 10000,
        vestedUnits: 10000,
        strikePrice: 10.0,
        grantType: 'NSO',
        companyFmv: 20.0,
      },
      '2026-11-01',
      90,
      15000, // Budget is $15k; cost per share is strike $10 + tax > $10
      50.0
    );

    expect(plan.isBudgetConstrained).toBe(true);
    expect(plan.affordableUnits).toBeLessThan(10000);
    expect(plan.unfundedUnits).toBeGreaterThan(0);
    expect(plan.forfeitedPotentialValue).toBeGreaterThan(0);
  });
});

describe('Equity Dilution Modeler', () => {
  it('models multi-round dilution and expands total shares while increasing share price', () => {
    const result = modelDilution(25000, 5000000, 20000000, [
      {
        name: 'Series A',
        investmentAmount: 10000000,
        preMoneyValuation: 40000000,
        poolExpansionPct: 0.1,
      },
      {
        name: 'Series B',
        investmentAmount: 30000000,
        preMoneyValuation: 120000000,
        poolExpansionPct: 0.05,
      },
    ]);

    expect(result.startingOwnershipPct).toBe(0.5); // 25,000 / 5,000,000 = 0.5%
    expect(result.startingValue).toBe(100000); // 25,000 * $4.00

    expect(result.rounds.length).toBe(2);
    // Post Series A: Shares expand, employee % decreases, but value increases
    const seriesA = result.rounds[0];
    expect(seriesA.employeeOwnershipPct).toBeLessThan(0.5);
    expect(seriesA.employeeValue).toBeGreaterThan(100000);

    // Final round check
    expect(result.finalOwnershipPct).toBeLessThan(result.startingOwnershipPct);
    expect(result.finalValue).toBeGreaterThan(result.startingValue);
    expect(result.cumulativeDilutionPct).toBeGreaterThan(0);
  });
});

describe('Unclamped Negative Net Proceeds (Bug 3 Fix)', () => {
  it('does not clamp negative net proceeds to zero when underwater or at loss', () => {
    const lossResult = calculateEquityOutcome({
      unitsToExercise: 1000,
      assumedExitPrice: 5.0, // Exit price lower than strike
      currentFmv: 10.0,
      strikePrice: 20.0,
      grantType: 'ISO',
      holdingPeriod: 'LONG_TERM',
      taxSettings: {
        federalTaxRate: 0.32,
        stateTaxRate: 0.093,
        capitalGainsRate: 0.2,
        stateCapitalGainsRate: 0.093,
        ficaRate: 0.0235,
        filingStatus: 'SINGLE',
      },
    });

    expect(lossResult.grossGain).toBe(-15000); // 5000 - 20000
    expect(lossResult.estimatedNetProfit).toBeLessThan(0);
    expect(lossResult.estimatedNetProfit).toBe(-15000);
  });

  it('unclamps negative net proceeds in exercise-and-hold strategy outcome', () => {
    const outcome = modelScenarios(1000, 25.0, 30.0, 10.0, 'ISO', {
      federalTaxRate: 0.32,
      stateTaxRate: 0.093,
      capitalGainsRate: 0.2,
      stateCapitalGainsRate: 0.093,
      ficaRate: 0.0235,
      filingStatus: 'SINGLE',
    });

    const exerciseAndHold = outcome.scenarios.find((s) => s.id === 'exercise_and_hold');
    expect(exerciseAndHold).toBeDefined();
    expect(exerciseAndHold?.netCashReceived).toBeLessThan(0);
  });
});


describe('Tender offer: cost basis and losses', () => {
  const taxSettings = {
    federalTaxRate: 0.32,
    stateTaxRate: 0.093,
    capitalGainsRate: 0.2,
    stateCapitalGainsRate: 0.093,
    ficaRate: 0.0235,
    filingStatus: 'SINGLE' as const,
  };
  const base = {
    vestedUnits: 1000,
    tenderParticipationPct: 100,
    tenderPricePerShare: 50,
    strikePrice: 5,
    transactionFeePct: 0,
    taxSettings,
    projectedIpoPrice: 80,
    holdingPeriodMonths: 18,
  };

  it('RSU with a known vest price taxes only the gain above basis', () => {
    const r = calculateTenderOffer({ ...base, grantType: 'RSU', alreadyExercised: false, costBasisPerShare: 40 });
    expect(r.grossTenderProceeds).toBe(50000);
    expect(r.costBasisTotal).toBe(40000);
    expect(r.netTaxableGain).toBe(10000);
    // long-term: 10,000 x (20% + 9.3%)
    expect(r.estimatedTaxes.totalTax).toBe(2930);
    expect(r.netCashPayout).toBe(50000 - 2930);
    expect(r.costBasisProvided).toBe(true);
    expect(r.warnings).toHaveLength(0);
  });

  it('RSU without a basis taxes the whole sale and warns', () => {
    const r = calculateTenderOffer({ ...base, grantType: 'RSU', alreadyExercised: false });
    expect(r.costBasisProvided).toBe(false);
    expect(r.netTaxableGain).toBe(50000);
    expect(r.warnings.join(' ')).toMatch(/No cost basis/);
  });

  it('shows a loss as negative, charges no tax, and warns', () => {
    const r = calculateTenderOffer({ ...base, grantType: 'RSU', alreadyExercised: false, costBasisPerShare: 60 });
    expect(r.netTaxableGain).toBe(-10000);
    expect(r.isLoss).toBe(true);
    expect(r.lossAmount).toBe(10000);
    expect(r.estimatedTaxes.totalTax).toBe(0);
    expect(r.netCashPayout).toBe(50000);
    expect(r.warnings.join(' ')).toMatch(/loss/);
  });

  it('exercised NSO defaults basis to strike and uses a supplied basis when given', () => {
    const noBasis = calculateTenderOffer({ ...base, grantType: 'NSO', alreadyExercised: true });
    expect(noBasis.costBasisPerShare).toBe(5);
    expect(noBasis.netTaxableGain).toBe(45000);
    const withBasis = calculateTenderOffer({ ...base, grantType: 'NSO', alreadyExercised: true, costBasisPerShare: 30 });
    expect(withBasis.netTaxableGain).toBe(20000);
    expect(withBasis.estimatedTaxes.totalTax).toBeLessThan(noBasis.estimatedTaxes.totalTax);
  });

  it('unexercised options ignore costBasisPerShare and use the strike offset', () => {
    const r = calculateTenderOffer({ ...base, grantType: 'ISO', alreadyExercised: false, costBasisPerShare: 999 });
    expect(r.costBasisTotal).toBe(0);
    expect(r.exerciseStrikeOffset).toBe(5000);
    expect(r.netTaxableGain).toBe(45000);
  });

  it('fees reduce the gain and can turn a small gain into a loss', () => {
    const r = calculateTenderOffer({ ...base, grantType: 'RSU', alreadyExercised: false, costBasisPerShare: 49.5, transactionFeePct: 2 });
    // 50,000 - 49,500 - 1,000 fee
    expect(r.netTaxableGain).toBe(-500);
    expect(r.isLoss).toBe(true);
  });
});
