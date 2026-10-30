import { calculateEquityOutcome, estimateAmtLiability, COMPLIANCE_DISCLAIMER } from './taxes';
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
      subtitle: 'Pay exercise cost + potential AMT today; qualify for Long-Term Capital Gains at exit',
      strategyDescription: 'You exercise your vested options today while private, paying the strike price and any immediate taxes (AMT for ISO, ordinary income for NSO). You start the 1-year holding clock for long-term capital gains.',
      upfrontCashRequired: upfrontCostNow,
      grossProceedsAtExit: exerciseNowResult.grossExitValue,
      totalTaxesPaid: exerciseNowResult.totalEstimatedTax,
      netCashReceived: Math.round(netProceedsNow),
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
      netCashReceived: Math.round(netProceedsCashless),
      roiOnInvestedCapital: null,
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
 * Note: IRS Section 83(b) deadline is strictly 30 days after share purchase/transfer (early exercise),
 * NOT 30 days after grant date.
 */
export function calculate83bAnalysis(
  purchaseDate: Date | string,
  unitsPurchased: number,
  strikePrice: number,
  currentFmv: number,
  projectedExitPrice: number,
  ordinaryTaxRate: number = 0.32,
  capitalGainsRate: number = 0.20,
  asOfDate: Date = new Date()
) {
  const pDate = new Date(purchaseDate);
  const deadlineDate = new Date(pDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date(asOfDate);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const daysRemainingRaw = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isDeadlinePassed = daysRemainingRaw < 0;
  const daysRemaining = Math.max(0, daysRemainingRaw);

  const spreadAtPurchase = Math.max(0, unitsPurchased * (currentFmv - strikePrice));
  const taxWith83bToday = spreadAtPurchase * ordinaryTaxRate;
  
  const estimatedFutureVestValue = unitsPurchased * (projectedExitPrice * 0.5);
  const estimatedTaxWithout83b = estimatedFutureVestValue * ordinaryTaxRate;

  const exitGain = Math.max(0, unitsPurchased * (projectedExitPrice - strikePrice));
  const exitTaxWith83b = exitGain * capitalGainsRate;

  const totalTaxWith83b = taxWith83bToday + exitTaxWith83b;
  const totalTaxWithout83b = estimatedTaxWithout83b + (unitsPurchased * (projectedExitPrice - projectedExitPrice * 0.5) * capitalGainsRate);
  const estimatedTaxSavings = Math.max(0, totalTaxWithout83b - totalTaxWith83b);

  return {
    purchaseDate: pDate,
    grantDate: pDate,
    deadlineDate,
    daysRemaining,
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

  const exerciseStrikeOffset = alreadyExercised || grantType === 'RSU' ? 0 : Math.round(unitsOffered * strikePrice);
  const transactionFeeAmount = Math.round(grossTenderProceeds * (transactionFeePct / 100));

  const netTaxableGain = Math.max(0, grossTenderProceeds - exerciseStrikeOffset - transactionFeeAmount);

  let ordinaryIncomeTax = 0;
  let stateTax = 0;
  let ficaTax = 0;
  let capitalGainsTax = 0;
  let stateCapitalGainsTax = 0;
  let taxCharacter = '';

  if (alreadyExercised) {
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
    if (grantType === 'ISO') {
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
  const netCashPayout = Math.round(grossTenderProceeds - exerciseStrikeOffset - transactionFeeAmount - totalTax);
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

/**
 * Break-even exit price analysis
 */
export interface BreakEvenResult {
  breakEvenPrice: number;
  cashlessBreakEven: number;
  strikePrice: number;
  currentFmv: number;
  upfrontCostPerShare: number;
  isUnderwater: boolean;
  requiredGainPct: number;
  explanation: string;
}

export function breakEvenExitPrice(
  strikePrice: number,
  currentFmv: number,
  grantType: GrantType = 'ISO',
  taxSettings?: Partial<TaxBracketSettings>
): BreakEvenResult {
  const isUnderwater = currentFmv < strikePrice;
  const fedRate = taxSettings?.capitalGainsRate ?? 0.20;
  const stateRate = taxSettings?.stateCapitalGainsRate ?? 0.093;
  const combinedCapGainsRate = fedRate + stateRate;

  const cashlessBreakEven = strikePrice;

  let upfrontTaxPerShare = 0;
  if (grantType === 'ISO') {
    const spread = Math.max(0, currentFmv - strikePrice);
    if (spread > 0) {
      const amtProxy = estimateAmtLiability(spread * 1000, taxSettings?.filingStatus || 'SINGLE', 150000);
      upfrontTaxPerShare = amtProxy.netAmtLiability / 1000;
    }
  } else if (grantType === 'NSO') {
    const spread = Math.max(0, currentFmv - strikePrice);
    const ordFed = taxSettings?.federalTaxRate ?? 0.32;
    const ordState = taxSettings?.stateTaxRate ?? 0.093;
    const fica = taxSettings?.ficaRate ?? 0.0235;
    upfrontTaxPerShare = spread * (ordFed + ordState + fica);
  }

  const upfrontCostPerShare = strikePrice + upfrontTaxPerShare;
  const regularBasis = grantType === 'NSO' ? Math.max(strikePrice, currentFmv) : strikePrice;

  let breakEvenPrice: number;
  if (combinedCapGainsRate < 1) {
    const computed = (upfrontCostPerShare - regularBasis * combinedCapGainsRate) / (1 - combinedCapGainsRate);
    breakEvenPrice = Math.max(strikePrice, Math.round(computed * 100) / 100);
  } else {
    breakEvenPrice = upfrontCostPerShare;
  }

  const requiredGainPct = currentFmv > 0 
    ? Math.round(((breakEvenPrice - currentFmv) / currentFmv) * 1000) / 10 
    : 0;

  const explanation = isUnderwater
    ? `Grant is currently underwater ($${strikePrice.toFixed(2)} strike vs $${currentFmv.toFixed(2)} FMV). Share price must rise by ${Math.abs(requiredGainPct)}% to reach break-even.`
    : `To recover your $${upfrontCostPerShare.toFixed(2)} upfront cost per share after long-term capital gains tax (${(combinedCapGainsRate * 100).toFixed(1)}%), exit price must reach $${breakEvenPrice.toFixed(2)}.`;

  return {
    breakEvenPrice,
    cashlessBreakEven,
    strikePrice,
    currentFmv,
    upfrontCostPerShare: Math.round(upfrontCostPerShare * 100) / 100,
    isUnderwater,
    requiredGainPct,
    explanation,
  };
}

/**
 * AMT sensitivity across multiple FMV multiples
 */
export interface AmtSensitivityPoint {
  multiple: number;
  fmv: number;
  spreadPerShare: number;
  totalSpread: number;
  amti: number;
  tentativeMinimumTax: number;
  regularTax: number;
  amtLiability: number;
  effectiveAmtRatePct: number;
}

export function amtSensitivity(
  units: number,
  strikePrice: number,
  baseFmv: number,
  annualIncome: number = 150000,
  filingStatus: 'SINGLE' | 'MARRIED_JOINT' = 'SINGLE'
): AmtSensitivityPoint[] {
  const multiples = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 5.0];

  return multiples.map((multiple) => {
    const fmv = Math.round(baseFmv * multiple * 100) / 100;
    const spreadPerShare = Math.max(0, fmv - strikePrice);
    const totalSpread = Math.round(units * spreadPerShare);

    const amtResult = estimateAmtLiability(totalSpread, filingStatus, annualIncome);
    const effectiveAmtRatePct = totalSpread > 0
      ? Math.round((amtResult.netAmtLiability / totalSpread) * 1000) / 10
      : 0;

    return {
      multiple,
      fmv,
      spreadPerShare,
      totalSpread,
      amti: amtResult.amti,
      tentativeMinimumTax: amtResult.tentativeMinimumTax,
      regularTax: amtResult.estimatedRegularTax,
      amtLiability: amtResult.netAmtLiability,
      effectiveAmtRatePct,
    };
  });
}

/**
 * Departure planning and PTEW runway calculation
 */
export interface DeparturePlanResult {
  departureDate: Date;
  ptewDays: number;
  deadlineDate: Date;
  isoConversionDate: Date | null;
  vestedUnits: number;
  unvestedUnits: number;
  strikePrice: number;
  exerciseCost: number;
  estimatedTaxAtExercise: number;
  totalUpfrontCashRequired: number;
  cashBudget: number;
  affordableUnits: number;
  unfundedUnits: number;
  projectedExitPrice: number;
  grossProceedsAtExit: number;
  projectedNetProceeds: number;
  forfeitedPotentialValue: number;
  isBudgetConstrained: boolean;
  warnings: string[];
  recommendedReminders: {
    title: string;
    dueDate: Date;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
}

export function planDeparture(
  grant: {
    unitsGranted: number;
    vestedUnits?: number;
    strikePrice: number;
    grantType: GrantType;
    companyFmv?: number;
  },
  departureDateInput: Date | string,
  ptewDays: number = 90,
  cashAvailable: number = 10000,
  assumedExitPrice: number = 50,
  taxSettings?: Partial<TaxBracketSettings>
): DeparturePlanResult {
  const departureDate = new Date(departureDateInput);
  const deadlineDate = new Date(departureDate.getTime() + ptewDays * 24 * 60 * 60 * 1000);
  const vestedUnits = grant.vestedUnits ?? grant.unitsGranted;
  const unvestedUnits = Math.max(0, grant.unitsGranted - vestedUnits);
  const strikePrice = grant.strikePrice;
  const fmv = grant.companyFmv ?? strikePrice * 2;

  let taxPerUnit = 0;
  if (grant.grantType === 'ISO') {
    const spread = Math.max(0, fmv - strikePrice);
    if (spread > 0) {
      const amtProxy = estimateAmtLiability(spread * 1000, taxSettings?.filingStatus || 'SINGLE', 150000);
      taxPerUnit = amtProxy.netAmtLiability / 1000;
    }
  } else if (grant.grantType === 'NSO') {
    const spread = Math.max(0, fmv - strikePrice);
    const ordFed = taxSettings?.federalTaxRate ?? 0.32;
    const ordState = taxSettings?.stateTaxRate ?? 0.093;
    const fica = taxSettings?.ficaRate ?? 0.0235;
    taxPerUnit = spread * (ordFed + ordState + fica);
  }

  const costPerUnit = strikePrice + taxPerUnit;
  const totalExerciseCost = Math.round(vestedUnits * strikePrice);
  const estimatedTaxAtExercise = Math.round(vestedUnits * taxPerUnit);
  const totalUpfrontCashRequired = totalExerciseCost + estimatedTaxAtExercise;

  const affordableUnits = costPerUnit > 0
    ? Math.min(vestedUnits, Math.floor(cashAvailable / costPerUnit))
    : vestedUnits;
  const unfundedUnits = Math.max(0, vestedUnits - affordableUnits);
  const isBudgetConstrained = unfundedUnits > 0;

  const grossProceedsAtExit = Math.round(affordableUnits * assumedExitPrice);
  const capGainsRate = (taxSettings?.capitalGainsRate ?? 0.20) + (taxSettings?.stateCapitalGainsRate ?? 0.093);
  const exitGain = Math.max(0, grossProceedsAtExit - Math.round(affordableUnits * strikePrice));
  const exitTax = Math.round(exitGain * capGainsRate);
  const affordableUpfrontCost = Math.round(affordableUnits * costPerUnit);
  const projectedNetProceeds = grossProceedsAtExit - affordableUpfrontCost - exitTax;

  const forfeitedPotentialValue = Math.max(
    0,
    Math.round(unfundedUnits * (assumedExitPrice - strikePrice))
  );

  let isoConversionDate: Date | null = null;
  const warnings: string[] = [];

  if (grant.grantType === 'ISO') {
    isoConversionDate = new Date(departureDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    if (ptewDays > 90) {
      warnings.push(
        `Your PTEW is ${ptewDays} days, but IRS rules state ISOs convert to NSOs after 90 days. If exercised between day 91 and day ${ptewDays}, the spread will be taxed as ordinary income and subject to payroll taxes.`
      );
    }
  }

  if (unvestedUnits > 0) {
    warnings.push(`${unvestedUnits.toLocaleString()} unvested options will be forfeited on your departure date.`);
  }

  if (isBudgetConstrained) {
    warnings.push(
      `Your cash budget of $${cashAvailable.toLocaleString()} only covers ${affordableUnits.toLocaleString()} of your ${vestedUnits.toLocaleString()} vested options. ${unfundedUnits.toLocaleString()} options may lapse unless additional funding is secured.`
    );
  }

  const recommendedReminders = [
    {
      title: 'Post-termination exercise window deadline',
      dueDate: deadlineDate,
      description: `Final day to exercise ${vestedUnits.toLocaleString()} vested options under your ${ptewDays}-day PTEW agreement.`,
      priority: 'HIGH' as const,
    },
  ];

  if (isoConversionDate && ptewDays > 90) {
    recommendedReminders.unshift({
      title: 'ISO statutory 90-day tax conversion deadline',
      dueDate: isoConversionDate,
      description: 'Last day to exercise as an ISO with potential AMT and long-term capital gains treatment before converting to NSO.',
      priority: 'HIGH' as const,
    });
  }

  return {
    departureDate,
    ptewDays,
    deadlineDate,
    isoConversionDate,
    vestedUnits,
    unvestedUnits,
    strikePrice,
    exerciseCost: totalExerciseCost,
    estimatedTaxAtExercise,
    totalUpfrontCashRequired,
    cashBudget: cashAvailable,
    affordableUnits,
    unfundedUnits,
    projectedExitPrice: assumedExitPrice,
    grossProceedsAtExit,
    projectedNetProceeds,
    forfeitedPotentialValue,
    isBudgetConstrained,
    warnings,
    recommendedReminders,
  };
}

/**
 * Multi-round dilution modeling
 */
export interface DilutionRoundInput {
  name: string;
  investmentAmount: number;
  preMoneyValuation: number;
  poolExpansionPct?: number; // e.g. 0.10 for 10%
}

export interface DilutionRoundResult {
  roundName: string;
  investmentAmount: number;
  preMoneyValuation: number;
  postMoneyValuation: number;
  newInvestorOwnershipPct: number;
  poolExpansionPct: number;
  dilutionFactorThisRound: number;
  totalCompanyShares: number;
  sharePrice: number;
  employeeUnits: number;
  employeeOwnershipPct: number;
  employeeValue: number;
  cumulativeDilutionPct: number;
}

export interface DilutionModelResult {
  startingUnits: number;
  startingShares: number;
  startingOwnershipPct: number;
  startingSharePrice: number;
  startingValuation: number;
  startingValue: number;
  rounds: DilutionRoundResult[];
  finalOwnershipPct: number;
  finalValue: number;
  finalSharePrice: number;
  cumulativeDilutionPct: number;
}

export function modelDilution(
  currentUnits: number,
  totalCompanyShares: number,
  currentValuation: number,
  rounds: DilutionRoundInput[]
): DilutionModelResult {
  const startingOwnershipPct = totalCompanyShares > 0 ? (currentUnits / totalCompanyShares) * 100 : 0;
  const startingSharePrice = totalCompanyShares > 0 ? currentValuation / totalCompanyShares : 0;
  const startingValue = currentUnits * startingSharePrice;

  let currentShares = totalCompanyShares;
  let cumulativeDilutionFactor = 1.0;

  const roundResults: DilutionRoundResult[] = [];

  for (const round of rounds) {
    const postMoney = round.preMoneyValuation + round.investmentAmount;
    const investorPct = postMoney > 0 ? round.investmentAmount / postMoney : 0;
    const poolPct = round.poolExpansionPct ?? 0;

    const roundDilutionFactor = (1 - investorPct) * (1 - poolPct);
    cumulativeDilutionFactor *= roundDilutionFactor;

    currentShares = roundDilutionFactor > 0 ? Math.round(currentShares / roundDilutionFactor) : currentShares;
    const sharePrice = currentShares > 0 ? Math.round((postMoney / currentShares) * 100) / 100 : 0;

    const employeeOwnershipPct = currentShares > 0 ? (currentUnits / currentShares) * 100 : 0;
    const employeeValue = Math.round(currentUnits * sharePrice);
    const cumulativeDilutionPct = Math.round((1 - cumulativeDilutionFactor) * 1000) / 10;

    roundResults.push({
      roundName: round.name,
      investmentAmount: round.investmentAmount,
      preMoneyValuation: round.preMoneyValuation,
      postMoneyValuation: postMoney,
      newInvestorOwnershipPct: Math.round(investorPct * 1000) / 10,
      poolExpansionPct: Math.round(poolPct * 1000) / 10,
      dilutionFactorThisRound: Math.round(roundDilutionFactor * 1000) / 1000,
      totalCompanyShares: currentShares,
      sharePrice,
      employeeUnits: currentUnits,
      employeeOwnershipPct: Math.round(employeeOwnershipPct * 1000) / 1000,
      employeeValue,
      cumulativeDilutionPct,
    });
  }

  const finalRound = roundResults[roundResults.length - 1];

  return {
    startingUnits: currentUnits,
    startingShares: totalCompanyShares,
    startingOwnershipPct: Math.round(startingOwnershipPct * 1000) / 1000,
    startingSharePrice: Math.round(startingSharePrice * 100) / 100,
    startingValuation: currentValuation,
    startingValue: Math.round(startingValue),
    rounds: roundResults,
    finalOwnershipPct: finalRound ? finalRound.employeeOwnershipPct : Math.round(startingOwnershipPct * 1000) / 1000,
    finalValue: finalRound ? finalRound.employeeValue : Math.round(startingValue),
    finalSharePrice: finalRound ? finalRound.sharePrice : Math.round(startingSharePrice * 100) / 100,
    cumulativeDilutionPct: finalRound ? finalRound.cumulativeDilutionPct : 0,
  };
}
