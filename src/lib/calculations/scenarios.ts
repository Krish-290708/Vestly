import { calculateEquityOutcome, COMPLIANCE_DISCLAIMER } from './taxes';
import { GrantType, TaxBracketSettings, TenderOfferInputs, TenderOfferResult } from '@/types';

export interface ScenarioOutcome {
  id: string;
  name: string;
  subtitle: string;
  strategyDescription: string;
  upfrontCashRequired: number; // Exercise cost + upfront exercise tax/AMT
  grossProceedsAtExit: number;
  totalTaxesPaid: number;
  netCashReceived: number;     // Gross proceeds - Total Taxes - Upfront Cash
  roiOnInvestedCapital: number | null; // Net Cash / Upfront Cash
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  taxCharacter: string;
  pros: string[];
  cons: string[];
}

/**
 * Generates side-by-side comparison of standard equity strategies
 */
export function modelScenarios(
  units: number,
  strikePrice: number,
  currentFmv: number,
  assumedExitPrice: number,
  grantType: GrantType,
  taxSettings: TaxBracketSettings
): {
  scenarios: ScenarioOutcome[];
  disclaimer: string;
} {
  // Scenario 1: Exercise Now and Hold (Qualifying / Long-Term)
  const exerciseNowResult = calculateEquityOutcome({
    unitsToExercise: units,
    assumedExitPrice,
    currentFmv,
    strikePrice,
    grantType,
    holdingPeriod: 'LONG_TERM',
    taxSettings,
    yearsFromGrant: 3,
    yearsFromExercise: 2,
  });

  const upfrontCostNow = exerciseNowResult.exerciseCost + exerciseNowResult.exerciseTax.totalTaxAtExercise;
  const netProceedsNow = exerciseNowResult.grossExitValue - exerciseNowResult.exitTax.totalTaxAtExit - upfrontCostNow;
  const roiNow = upfrontCostNow > 0 ? Math.round((netProceedsNow / upfrontCostNow) * 100) : null;

  // Scenario 2: Cashless Exercise at Exit (Same day exercise and sale)
  // At exit, current FMV is assumedExitPrice.
  // There is 0 holding period, so for ISO it's a disqualifying disposition (taxed mostly at ordinary income rates).
  const cashlessExitResult = calculateEquityOutcome({
    unitsToExercise: units,
    assumedExitPrice,
    currentFmv: assumedExitPrice,
    strikePrice,
    grantType,
    holdingPeriod: 'SHORT_TERM',
    taxSettings,
    yearsFromGrant: 0,
    yearsFromExercise: 0,
  });

  const upfrontCostCashless = 0; // Deducted directly from proceeds at exit
  const netProceedsCashless = cashlessExitResult.grossExitValue - cashlessExitResult.exerciseCost - cashlessExitResult.totalEstimatedTax;

  // Scenario 3: Let Expire / Decline Exercise
  const netProceedsExpire = 0;

  const scenarios: ScenarioOutcome[] = [
    {
      id: 'exercise_and_hold',
      name: 'Exercise Now & Hold',
      subtitle: 'Pay exercise cost + potential AMT today; unlock Long-Term Capital Gains at exit',
      strategyDescription: 'You exercise your vested options today while private, paying the strike price and any immediate taxes (AMT for ISO, ordinary income for NSO). You start the 1-year holding clock for long-term capital gains.',
      upfrontCashRequired: upfrontCostNow,
      grossProceedsAtExit: exerciseNowResult.grossExitValue,
      totalTaxesPaid: exerciseNowResult.totalEstimatedTax,
      netCashReceived: Math.max(0, netProceedsNow),
      roiOnInvestedCapital: roiNow,
      riskLevel: 'HIGH',
      taxCharacter: grantType === 'ISO' ? 'Long-Term Capital Gains (Qualifying)' : 'Long-Term Capital Gains on Post-FMV growth',
      pros: [
        'Starts capital gains clock immediately (15-20% rate vs 37% ordinary income)',
        grantType === 'ISO' ? 'Locks in current lower FMV spread for AMT calculation' : 'Establishes higher tax basis early',
        'Maximizes net after-tax payout if company experiences massive exit valuation',
      ],
      cons: [
        'Requires upfront out-of-pocket cash today before liquidity',
        'Capital at risk if company fails or valuation decreases before exit',
        grantType === 'ISO' ? 'May trigger AMT liability without any immediate cash proceeds' : 'Immediate cash tax due on NSO spread',
      ],
    },
    {
      id: 'cashless_at_exit',
      name: 'Wait & Cashless Exercise at Exit',
      subtitle: 'Zero out-of-pocket risk today; higher ordinary income tax rate on total gains',
      strategyDescription: 'You hold unexercised options until the company has a liquidity event (IPO, acquisition, or secondary tender). At exit, you exercise and sell simultaneously, funding the strike price directly from sale proceeds.',
      upfrontCashRequired: 0,
      grossProceedsAtExit: cashlessExitResult.grossExitValue,
      totalTaxesPaid: cashlessExitResult.totalEstimatedTax,
      netCashReceived: Math.max(0, netProceedsCashless),
      roiOnInvestedCapital: null, // Infinite / zero capital invested
      riskLevel: 'LOW',
      taxCharacter: 'Ordinary Income (Disqualifying Disposition / W-2 Wages)',
      pros: [
        'Zero out-of-pocket cash required upfront',
        'Zero financial downside if the company declines or goes bankrupt',
        'Eliminates illiquidity risk and private stock holding risk',
      ],
      cons: [
        'Higher tax bill: Gains taxed at higher ordinary income rates (up to 37% federal + state)',
        'Loss of qualifying ISO capital gains tax preferential rate',
        'Subject to FICA/Medicare payroll taxes for NSOs',
      ],
    },
    {
      id: 'expire_do_not_exercise',
      name: 'Do Not Exercise / Let Expire',
      subtitle: 'Zero cost, zero risk, forfeit all equity upside',
      strategyDescription: 'You decide not to exercise the options and allow them to expire at the 10-year term or post-termination window.',
      upfrontCashRequired: 0,
      grossProceedsAtExit: 0,
      totalTaxesPaid: 0,
      netCashReceived: 0,
      roiOnInvestedCapital: 0,
      riskLevel: 'LOW',
      taxCharacter: 'No Tax Event',
      pros: ['Zero financial cost', 'Zero administrative or tax reporting requirements'],
      cons: ['Completely forfeits all potential financial upside and ownership in the company'],
    },
  ];

  return {
    scenarios,
    disclaimer: COMPLIANCE_DISCLAIMER,
  };
}

/**
 * Calculates Section 83(b) Election analysis
 */
export function calculate83bAnalysis(
  grantDate: Date | string,
  unitsGranted: number,
  strikePrice: number,
  currentFmv: number,
  projectedExitPrice: number,
  ordinaryTaxRate: number = 0.32,
  capitalGainsRate: number = 0.20
) {
  const gDate = new Date(grantDate);
  const deadlineDate = new Date(gDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isDeadlinePassed = daysRemaining < 0;

  // Immediate tax if 83(b) filed (spread at grant is usually $0 or minimal)
  const spreadAtGrant = Math.max(0, unitsGranted * (currentFmv - strikePrice));
  const taxWith83bToday = spreadAtGrant * ordinaryTaxRate;
  
  // Tax at future vesting without 83(b)
  const estimatedFutureVestValue = unitsGranted * (projectedExitPrice * 0.5); // assumed mid-point
  const estimatedTaxWithout83b = estimatedFutureVestValue * ordinaryTaxRate;

  // Tax at exit
  const exitGain = Math.max(0, unitsGranted * (projectedExitPrice - strikePrice));
  const exitTaxWith83b = exitGain * capitalGainsRate;

  const totalTaxWith83b = taxWith83bToday + exitTaxWith83b;
  const totalTaxWithout83b = estimatedTaxWithout83b + (unitsGranted * (projectedExitPrice - projectedExitPrice * 0.5) * capitalGainsRate);
  const estimatedTaxSavings = Math.max(0, totalTaxWithout83b - totalTaxWith83b);

  return {
    grantDate: gDate,
    deadlineDate,
    daysRemaining: Math.max(0, daysRemaining),
    isDeadlinePassed,
    taxWith83bToday: Math.round(taxWith83bToday),
    totalTaxWith83b: Math.round(totalTaxWith83b),
    totalTaxWithout83b: Math.round(totalTaxWithout83b),
    estimatedTaxSavings: Math.round(estimatedTaxSavings),
    isUrgent: daysRemaining <= 10 && !isDeadlinePassed,
    disclaimer: COMPLIANCE_DISCLAIMER,
  };
}

/**
 * Calculates Secondary Market / Company Tender Offer financial and tax breakdown
 */
export function calculateTenderOffer(inputs: TenderOfferInputs): TenderOfferResult {
  const {
    vestedUnits,
    tenderParticipationPct,
    tenderPricePerShare,
    strikePrice,
    grantType,
    alreadyExercised,
    holdingPeriodMonths = 18,
    transactionFeePct,
    taxSettings,
    projectedIpoPrice,
  } = inputs;

  const unitsOffered = Math.round(vestedUnits * (Math.max(0, Math.min(100, tenderParticipationPct)) / 100));
  const retainedUnits = Math.max(0, vestedUnits - unitsOffered);
  const grossTenderProceeds = Math.round(unitsOffered * tenderPricePerShare);

  // Exercise Strike Offset: If employee has not exercised yet and it's an option (ISO/NSO),
  // they execute a cashless exercise inside the tender offer where the strike cost is deducted.
  const exerciseStrikeOffset = alreadyExercised || grantType === 'RSU' ? 0 : Math.round(unitsOffered * strikePrice);
  const transactionFeeAmount = Math.round(grossTenderProceeds * (transactionFeePct / 100));

  // Gross Gain before tax
  const netTaxableGain = Math.max(0, grossTenderProceeds - exerciseStrikeOffset - transactionFeeAmount);

  let ordinaryIncomeTax = 0;
  let stateTax = 0;
  let ficaTax = 0;
  let capitalGainsTax = 0;
  let stateCapitalGainsTax = 0;
  let taxCharacter = '';

  if (alreadyExercised) {
    // Selling already owned shares
    const isLongTerm = holdingPeriodMonths >= 12;
    if (isLongTerm) {
      taxCharacter = 'Long-Term Capital Gains (Held > 12 Months)';
      capitalGainsTax = netTaxableGain * taxSettings.capitalGainsRate;
      stateCapitalGainsTax = netTaxableGain * taxSettings.stateCapitalGainsRate;
    } else {
      taxCharacter = 'Short-Term Capital Gains (Ordinary Income Rates)';
      ordinaryIncomeTax = netTaxableGain * taxSettings.federalTaxRate;
      stateTax = netTaxableGain * taxSettings.stateTaxRate;
    }
  } else {
    // Cashless exercise and tender (same-day disposition)
    if (grantType === 'ISO') {
      // Disqualifying disposition: Gain is taxed at ordinary rates; eliminates AMT since sold in same calendar year
      taxCharacter = 'Disqualifying Disposition (Ordinary Income, No AMT)';
      ordinaryIncomeTax = netTaxableGain * taxSettings.federalTaxRate;
      stateTax = netTaxableGain * taxSettings.stateTaxRate;
    } else if (grantType === 'NSO') {
      taxCharacter = 'Ordinary Income (W-2 Wages + FICA/Medicare)';
      ordinaryIncomeTax = netTaxableGain * taxSettings.federalTaxRate;
      stateTax = netTaxableGain * taxSettings.stateTaxRate;
      ficaTax = netTaxableGain * taxSettings.ficaRate;
    } else if (grantType === 'RSU') {
      taxCharacter = 'Capital Gains (RSU Vested Shares)';
      const isLongTerm = holdingPeriodMonths >= 12;
      const capRate = isLongTerm ? taxSettings.capitalGainsRate : taxSettings.federalTaxRate;
      capitalGainsTax = netTaxableGain * capRate;
      stateCapitalGainsTax = netTaxableGain * (isLongTerm ? taxSettings.stateCapitalGainsRate : taxSettings.stateTaxRate);
    } else {
      taxCharacter = 'ESPP Disqualifying Sale';
      ordinaryIncomeTax = netTaxableGain * taxSettings.federalTaxRate;
      stateTax = netTaxableGain * taxSettings.stateTaxRate;
    }
  }

  const totalTax = Math.round(ordinaryIncomeTax + stateTax + ficaTax + capitalGainsTax + stateCapitalGainsTax);
  const netCashPayout = Math.max(0, grossTenderProceeds - exerciseStrikeOffset - transactionFeeAmount - totalTax);
  const retainedValueAtCurrentFmv = Math.round(retainedUnits * tenderPricePerShare);
  const retainedValueAtProjectedIpo = Math.round(retainedUnits * projectedIpoPrice);

  return {
    unitsOffered,
    retainedUnits,
    grossTenderProceeds,
    exerciseStrikeOffset,
    transactionFeeAmount,
    netTaxableGain,
    estimatedTaxes: {
      ordinaryIncomeTax: Math.round(ordinaryIncomeTax),
      stateTax: Math.round(stateTax),
      ficaTax: Math.round(ficaTax),
      capitalGainsTax: Math.round(capitalGainsTax),
      stateCapitalGainsTax: Math.round(stateCapitalGainsTax),
      totalTax,
    },
    netCashPayout,
    retainedValueAtCurrentFmv,
    retainedValueAtProjectedIpo,
    taxCharacter,
  };
}
