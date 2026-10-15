import { SimulationInputs, SimulationResult, TaxBracketSettings } from '@/types';

export const COMPLIANCE_DISCLAIMER = 
  "DISCLAIMER: This calculation provides high-level educational estimates only and does not constitute financial, legal, or tax advice. Actual tax liability varies substantially based on total household income, deductions, state/local residency, AMT phaseouts, and future legislative changes. Always consult a qualified CPA or licensed tax professional before exercising equity or making financial commitments.";

// 2024-2026 US Federal AMT parameters (approximate statutory baselines)
export const AMT_PARAMETERS = {
  SINGLE: {
    exemptionAmount: 85700,
    phaseoutThreshold: 609350,
  },
  MARRIED_JOINT: {
    exemptionAmount: 133300,
    phaseoutThreshold: 1218700,
  },
  HEAD_OF_HOUSEHOLD: {
    exemptionAmount: 85700,
    phaseoutThreshold: 609350,
  },
  threshold28Percent: 232600,
  rateLower: 0.26,
  rateUpper: 0.28,
};

/**
 * Calculates AMT (Alternative Minimum Tax) exposure for an ISO exercise
 */
export function estimateAmtLiability(
  spreadAtExercise: number,
  filingStatus: 'SINGLE' | 'MARRIED_JOINT' | 'HEAD_OF_HOUSEHOLD' = 'SINGLE',
  assumedBaseIncome: number = 180000,
  regularTaxRate: number = 0.24
): {
  spread: number;
  exemption: number;
  amti: number;
  tentativeMinimumTax: number;
  estimatedRegularTax: number;
  netAmtLiability: number;
  hasAmtExposure: boolean;
} {
  if (spreadAtExercise <= 0) {
    return {
      spread: 0,
      exemption: 0,
      amti: 0,
      tentativeMinimumTax: 0,
      estimatedRegularTax: 0,
      netAmtLiability: 0,
      hasAmtExposure: false,
    };
  }

  const params = AMT_PARAMETERS[filingStatus] || AMT_PARAMETERS.SINGLE;
  const amti = assumedBaseIncome + spreadAtExercise;

  // Calculate exemption phaseout (25 cents on the dollar for income over threshold)
  let phaseoutReduction = 0;
  if (amti > params.phaseoutThreshold) {
    phaseoutReduction = (amti - params.phaseoutThreshold) * 0.25;
  }
  const effectiveExemption = Math.max(0, params.exemptionAmount - phaseoutReduction);
  const amtTaxableBase = Math.max(0, amti - effectiveExemption);

  // AMT rates: 26% on first threshold28Percent, 28% thereafter
  let tentativeMinimumTax = 0;
  if (amtTaxableBase <= AMT_PARAMETERS.threshold28Percent) {
    tentativeMinimumTax = amtTaxableBase * AMT_PARAMETERS.rateLower;
  } else {
    tentativeMinimumTax = 
      (AMT_PARAMETERS.threshold28Percent * AMT_PARAMETERS.rateLower) + 
      ((amtTaxableBase - AMT_PARAMETERS.threshold28Percent) * AMT_PARAMETERS.rateUpper);
  }

  // Estimated regular tax on base income
  const estimatedRegularTax = assumedBaseIncome * regularTaxRate;

  // AMT is paid only to the extent Tentative Minimum Tax exceeds regular tax
  const netAmtLiability = Math.max(0, tentativeMinimumTax - estimatedRegularTax);

  return {
    spread: spreadAtExercise,
    exemption: effectiveExemption,
    amti,
    tentativeMinimumTax: Math.round(tentativeMinimumTax),
    estimatedRegularTax: Math.round(estimatedRegularTax),
    netAmtLiability: Math.round(netAmtLiability),
    hasAmtExposure: netAmtLiability > 0,
  };
}

/**
 * Core Equity Calculator: Models gross returns and tax liability across ISO, NSO, RSU, and ESPP
 */
export function calculateEquityOutcome(inputs: SimulationInputs): SimulationResult {
  const {
    unitsToExercise,
    assumedExitPrice,
    currentFmv,
    strikePrice,
    grantType,
    holdingPeriod,
    taxSettings,
    yearsFromGrant = 2,
    yearsFromExercise = 1,
  } = inputs;

  const actualUnits = Math.max(0, unitsToExercise);
  const exerciseCost = grantType === 'RSU' ? 0 : actualUnits * strikePrice;
  const grossExitValue = actualUnits * assumedExitPrice;
  const grossGain = Math.max(0, grossExitValue - exerciseCost);
  const exerciseSpread = Math.max(0, actualUnits * (currentFmv - strikePrice));

  let ordinaryIncomeTax = 0;
  let stateTax = 0;
  let ficaTax = 0;
  let amtSpread = 0;
  let estimatedAmtLiabilityValue = 0;
  let capitalGainsTax = 0;
  let stateCapitalGainsTax = 0;
  let dispositionType: 'QUALIFYING' | 'DISQUALIFYING' | 'N_A' = 'N_A';

  if (grantType === 'ISO') {
    // Check holding period for qualifying disposition:
    // Held >= 2 years from grant AND >= 1 year from exercise
    const isQualifying = holdingPeriod === 'LONG_TERM' && yearsFromGrant >= 2 && yearsFromExercise >= 1;
    dispositionType = isQualifying ? 'QUALIFYING' : 'DISQUALIFYING';

    // At exercise: Spread is an AMT preference item (no regular income tax at exercise)
    amtSpread = exerciseSpread;
    const amtResult = estimateAmtLiability(
      amtSpread,
      taxSettings.filingStatus,
      180000, // estimated median salary for tech option holders
      taxSettings.federalTaxRate
    );
    estimatedAmtLiabilityValue = amtResult.netAmtLiability;

    if (isQualifying) {
      // Qualifying disposition: entire gain (Exit - Strike) is taxed as Long-Term Capital Gains
      const totalGain = Math.max(0, grossExitValue - exerciseCost);
      capitalGainsTax = totalGain * taxSettings.capitalGainsRate;
      stateCapitalGainsTax = totalGain * taxSettings.stateCapitalGainsRate;
    } else {
      // Disqualifying disposition:
      // Ordinary income on lesser of: (Exit - Strike) or (FMV at exercise - Strike)
      const bargainElement = Math.min(
        Math.max(0, grossExitValue - exerciseCost),
        exerciseSpread
      );
      ordinaryIncomeTax = bargainElement * taxSettings.federalTaxRate;
      stateTax = bargainElement * taxSettings.stateTaxRate;

      // Any remaining gain above FMV at exercise is capital gain
      const postExerciseGain = Math.max(0, (assumedExitPrice - currentFmv) * actualUnits);
      const capRate = holdingPeriod === 'LONG_TERM' ? taxSettings.capitalGainsRate : taxSettings.federalTaxRate;
      const stateCapRate = taxSettings.stateCapitalGainsRate;
      capitalGainsTax = postExerciseGain * capRate;
      stateCapitalGainsTax = postExerciseGain * stateCapRate;
    }
  } else if (grantType === 'NSO') {
    dispositionType = 'N_A';
    // NSO Exercise: Spread (FMV - Strike) is taxed immediately as Ordinary Income + FICA/Medicare
    ordinaryIncomeTax = exerciseSpread * taxSettings.federalTaxRate;
    stateTax = exerciseSpread * taxSettings.stateTaxRate;
    ficaTax = exerciseSpread * taxSettings.ficaRate;

    // NSO Exit: Future gain above FMV is taxed as Capital Gains
    const postExerciseGain = Math.max(0, (assumedExitPrice - currentFmv) * actualUnits);
    const capRate = holdingPeriod === 'LONG_TERM' ? taxSettings.capitalGainsRate : taxSettings.federalTaxRate;
    capitalGainsTax = postExerciseGain * capRate;
    stateCapitalGainsTax = postExerciseGain * taxSettings.stateCapitalGainsRate;
  } else if (grantType === 'RSU') {
    dispositionType = 'N_A';
    // RSU Vest: 100% of FMV at vest is taxed as Ordinary Income
    const vestValue = actualUnits * currentFmv;
    ordinaryIncomeTax = vestValue * taxSettings.federalTaxRate;
    stateTax = vestValue * taxSettings.stateTaxRate;
    ficaTax = vestValue * taxSettings.ficaRate;

    // RSU Exit: Gain from vest price to exit price is Capital Gain
    const postVestGain = Math.max(0, (assumedExitPrice - currentFmv) * actualUnits);
    const capRate = holdingPeriod === 'LONG_TERM' ? taxSettings.capitalGainsRate : taxSettings.federalTaxRate;
    capitalGainsTax = postVestGain * capRate;
    stateCapitalGainsTax = postVestGain * taxSettings.stateCapitalGainsRate;
  } else if (grantType === 'ESPP') {
    // Standard ESPP: typically 15% discount
    dispositionType = holdingPeriod === 'LONG_TERM' ? 'QUALIFYING' : 'DISQUALIFYING';
    const discountPortion = exerciseSpread;
    ordinaryIncomeTax = discountPortion * taxSettings.federalTaxRate;
    stateTax = discountPortion * taxSettings.stateTaxRate;

    const remainingGain = Math.max(0, grossGain - discountPortion);
    const capRate = holdingPeriod === 'LONG_TERM' ? taxSettings.capitalGainsRate : taxSettings.federalTaxRate;
    capitalGainsTax = remainingGain * capRate;
    stateCapitalGainsTax = remainingGain * taxSettings.stateCapitalGainsRate;
  }

  const totalTaxAtExercise = ordinaryIncomeTax + stateTax + ficaTax + (grantType === 'ISO' ? estimatedAmtLiabilityValue : 0);
  const totalTaxAtExit = capitalGainsTax + stateCapitalGainsTax;
  const totalEstimatedTax = Math.round(totalTaxAtExercise + totalTaxAtExit);
  const estimatedNetProfit = Math.max(0, Math.round(grossGain - totalEstimatedTax));
  const effectiveTaxRate = grossGain > 0 ? Math.round((totalEstimatedTax / grossGain) * 1000) / 10 : 0;

  return {
    unitsExercised: actualUnits,
    strikePrice,
    exerciseCost: Math.round(exerciseCost),
    currentFmv,
    assumedExitPrice,
    grossExitValue: Math.round(grossExitValue),
    grossGain: Math.round(grossGain),
    exerciseTax: {
      ordinaryIncomeTax: Math.round(ordinaryIncomeTax),
      stateTax: Math.round(stateTax),
      ficaTax: Math.round(ficaTax),
      amtSpread: Math.round(amtSpread),
      estimatedAmtLiability: Math.round(estimatedAmtLiabilityValue),
      totalTaxAtExercise: Math.round(totalTaxAtExercise),
    },
    exitTax: {
      capitalGainsTax: Math.round(capitalGainsTax),
      stateCapitalGainsTax: Math.round(stateCapitalGainsTax),
      totalTaxAtExit: Math.round(totalTaxAtExit),
    },
    totalEstimatedTax,
    estimatedNetProfit,
    effectiveTaxRate,
    dispositionType,
    isEstimate: true,
    disclaimer: COMPLIANCE_DISCLAIMER,
  };
}
