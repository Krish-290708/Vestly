/**
 * Test script for Vestly financial calculation engines
 * Run with: node tests/run-tests.js
 */

import { generateVestingSchedule, calculateVestingProgress } from '../src/lib/calculations/vesting';
import { calculateEquityOutcome, estimateAmtLiability } from '../src/lib/calculations/taxes';
import { modelScenarios, calculate83bAnalysis } from '../src/lib/calculations/scenarios';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
  console.log(`  ✔ PASS: ${message}`);
}

console.log('\n--- 1. Testing Vesting Calculations ---');
const vestingStart = new Date('2022-01-01');
const totalShares = 4800;
const schedule = generateVestingSchedule(totalShares, vestingStart, '4_YEAR_1_YEAR_CLIFF', 12, new Date('2023-01-01'));

assert(schedule.length === 37, '4-year schedule with 1-year cliff has 37 event tranches (1 cliff + 36 monthly)');
assert(schedule[0].unitsVested === 1200, 'Cliff event vests exactly 25% (1200 units of 4800)');
assert(schedule[schedule.length - 1].cumulativeVested === 4800, 'Final tranche cumulatively vests 100% (4800 units)');

const progress = calculateVestingProgress(schedule, 4800, new Date('2023-01-01'));
assert(progress.vestedUnits === 1200, 'At 1-year anniversary, vested units equals exactly 1200');
assert(progress.percentVested === 25, 'Percent vested is 25% at month 12');

console.log('\n--- 2. Testing ISO Tax Calculations ---');
const isoResult = calculateEquityOutcome({
  unitsToExercise: 1000,
  assumedExitPrice: 50,
  currentFmv: 20,
  strikePrice: 5,
  grantType: 'ISO',
  holdingPeriod: 'LONG_TERM',
  taxSettings: {
    federalTaxRate: 0.32,
    stateTaxRate: 0.093,
    capitalGainsRate: 0.20,
    stateCapitalGainsRate: 0.093,
    ficaRate: 0.0235,
    filingStatus: 'SINGLE',
  },
  yearsFromGrant: 3,
  yearsFromExercise: 2,
});

assert(isoResult.exerciseCost === 5000, 'Exercise cost for 1,000 units @ $5 is $5,000');
assert(isoResult.grossExitValue === 50000, 'Gross exit value for 1,000 units @ $50 is $50,000');
assert(isoResult.grossGain === 45000, 'Gross gain is $45,000');
assert(isoResult.dispositionType === 'QUALIFYING', 'Held >2yr from grant and >1yr from exercise is QUALIFYING');
assert(isoResult.exerciseTax.amtSpread === 15000, 'ISO paper spread for AMT is $15,000 ($20 FMV - $5 strike * 1,000)');

console.log('\n--- 3. Testing NSO Tax Calculations ---');
const nsoResult = calculateEquityOutcome({
  unitsToExercise: 1000,
  assumedExitPrice: 50,
  currentFmv: 20,
  strikePrice: 5,
  grantType: 'NSO',
  holdingPeriod: 'LONG_TERM',
  taxSettings: {
    federalTaxRate: 0.32,
    stateTaxRate: 0.093,
    capitalGainsRate: 0.20,
    stateCapitalGainsRate: 0.093,
    ficaRate: 0.0235,
    filingStatus: 'SINGLE',
  },
});

assert(nsoResult.exerciseTax.ordinaryIncomeTax > 0, 'NSO spread triggers ordinary federal income tax at exercise');
assert(nsoResult.exerciseTax.ficaTax > 0, 'NSO spread triggers FICA/Medicare tax at exercise');

console.log('\n--- 4. Testing Section 83(b) Deadline Calculation ---');
const now = new Date();
const analysis83b = calculate83bAnalysis(now.toISOString(), 1000, 1, 1, 10);
assert(analysis83b.daysRemaining === 30, '83(b) deadline starts with 30 days remaining from grant date');
assert(analysis83b.taxWith83bToday === 0, '83(b) tax is $0 when FMV equals strike price');

console.log('\nAll core financial calculation tests PASSED successfully!\n');

