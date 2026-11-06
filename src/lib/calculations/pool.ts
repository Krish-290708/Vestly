/**
 * Option Pool Runway & Cap Table Calculations
 * "The Ledger" Design System — Pure calculation functions
 */

export interface PoolParameters {
  totalAuthorizedShares: number;
  totalPoolShares: number;
  grantedShares: number;
  burnRatePerQuarter: number; // shares granted per quarter
}

export interface QuarterlyDepletion {
  quarter: number;
  quarterLabel: string;
  startingReserve: number;
  sharesBurned: number;
  endingReserve: number;
  cumulativeBurn: number;
  percentRemaining: number;
}

export interface PoolRunwayResult {
  totalAuthorizedShares: number;
  totalPoolShares: number;
  grantedShares: number;
  unallocatedReserve: number;
  poolPercent: number; // e.g. 15.0 for 15%
  grantedPercentOfPool: number; // e.g. 74.7%
  unallocatedPercentOfPool: number; // e.g. 25.3%
  overhangPercent: number; // grantedShares / totalAuthorizedShares * 100
  burnRatePerQuarter: number;
  runwayQuarters: number;
  runwayMonths: number;
  isRunwayCritical: boolean; // runway < 4 quarters (1 year)
  recommendedExpansionShares: number; // shares needed to reach 8 quarters
  projections: QuarterlyDepletion[];
}

/**
 * Projects option pool runway and quarterly burn trajectory.
 */
export function projectPoolRunway(params: PoolParameters): PoolRunwayResult {
  const {
    totalAuthorizedShares,
    totalPoolShares,
    grantedShares,
    burnRatePerQuarter,
  } = params;

  const validAuthorized = Math.max(1, totalAuthorizedShares || 1);
  const validPool = Math.max(0, totalPoolShares || 0);
  const validGranted = Math.max(0, grantedShares || 0);
  const unallocatedReserve = Math.max(0, validPool - validGranted);

  const poolPercent = (validPool / validAuthorized) * 100;
  const grantedPercentOfPool = validPool > 0 ? (validGranted / validPool) * 100 : 0;
  const unallocatedPercentOfPool = validPool > 0 ? (unallocatedReserve / validPool) * 100 : 0;
  const overhangPercent = (validGranted / validAuthorized) * 100;

  const validBurn = Math.max(0, burnRatePerQuarter || 0);
  const runwayQuarters = validBurn > 0 ? unallocatedReserve / validBurn : 999;
  const runwayMonths = Math.round(runwayQuarters * 3 * 10) / 10;
  const isRunwayCritical = runwayQuarters < 4;

  // Target 8 quarters (2 years) of reserve buffer
  const targetReserve = validBurn * 8;
  const recommendedExpansionShares = unallocatedReserve < targetReserve
    ? Math.max(0, targetReserve - unallocatedReserve)
    : 0;

  // Generate 8-quarter projection
  const projections: QuarterlyDepletion[] = [];
  let currentReserve = unallocatedReserve;
  let cumulativeBurn = 0;

  for (let q = 1; q <= 8; q++) {
    const burn = Math.min(currentReserve, validBurn);
    const ending = Math.max(0, currentReserve - burn);
    cumulativeBurn += burn;
    const pctRemaining = validPool > 0 ? (ending / validPool) * 100 : 0;

    projections.push({
      quarter: q,
      quarterLabel: `Q${q}`,
      startingReserve: Math.round(currentReserve),
      sharesBurned: Math.round(burn),
      endingReserve: Math.round(ending),
      cumulativeBurn: Math.round(cumulativeBurn),
      percentRemaining: Math.round(pctRemaining * 10) / 10,
    });

    currentReserve = ending;
  }

  return {
    totalAuthorizedShares: validAuthorized,
    totalPoolShares: validPool,
    grantedShares: validGranted,
    unallocatedReserve,
    poolPercent: Math.round(poolPercent * 10) / 10,
    grantedPercentOfPool: Math.round(grantedPercentOfPool * 10) / 10,
    unallocatedPercentOfPool: Math.round(unallocatedPercentOfPool * 10) / 10,
    overhangPercent: Math.round(overhangPercent * 10) / 10,
    burnRatePerQuarter: validBurn,
    runwayQuarters: Math.round(runwayQuarters * 10) / 10,
    runwayMonths,
    isRunwayCritical,
    recommendedExpansionShares: Math.round(recommendedExpansionShares),
    projections,
  };
}

export interface CompanyPoolPreset {
  id: string;
  name: string;
  valuationFormatted: string;
  totalAuthorizedShares: number;
  totalPoolShares: number;
  grantedShares: number;
  burnRatePerQuarter: number;
  departments: Array<{ dept: string; units: number; percent: number }>;
}

export const COMPANY_POOL_PRESETS: CompanyPoolPreset[] = [
  {
    id: 'stripe',
    name: 'Stripe, Inc.',
    valuationFormatted: '$65B',
    totalAuthorizedShares: 100000000,
    totalPoolShares: 15000000, // 15%
    grantedShares: 11200000,
    burnRatePerQuarter: 450000,
    departments: [
      { dept: 'Engineering and infrastructure', units: 6160000, percent: 55 },
      { dept: 'Product and design', units: 2240000, percent: 20 },
      { dept: 'Sales and go-to-market', units: 1680000, percent: 15 },
      { dept: 'Operations, legal, and G&A', units: 1120000, percent: 10 },
    ],
  },
  {
    id: 'databricks',
    name: 'Databricks, Inc.',
    valuationFormatted: '$43B',
    totalAuthorizedShares: 80000000,
    totalPoolShares: 10000000, // 12.5%
    grantedShares: 7800000,
    burnRatePerQuarter: 380000,
    departments: [
      { dept: 'Engineering and research', units: 4680000, percent: 60 },
      { dept: 'Enterprise sales and solutions', units: 1872000, percent: 24 },
      { dept: 'Product management', units: 780000, percent: 10 },
      { dept: 'Operations and finance', units: 468000, percent: 6 },
    ],
  },
  {
    id: 'figma',
    name: 'Figma, Inc.',
    valuationFormatted: '$12.5B',
    totalAuthorizedShares: 50000000,
    totalPoolShares: 7000000, // 14%
    grantedShares: 4900000,
    burnRatePerQuarter: 280000,
    departments: [
      { dept: 'Product and design engineering', units: 2695000, percent: 55 },
      { dept: 'Growth and marketing', units: 1127000, percent: 23 },
      { dept: 'Product management', units: 686000, percent: 14 },
      { dept: 'General and administrative', units: 392000, percent: 8 },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic PBC',
    valuationFormatted: '$18.4B',
    totalAuthorizedShares: 60000000,
    totalPoolShares: 9000000, // 15%
    grantedShares: 5400000,
    burnRatePerQuarter: 500000,
    departments: [
      { dept: 'Alignment and model research', units: 3780000, percent: 70 },
      { dept: 'Infrastructure and compute', units: 810000, percent: 15 },
      { dept: 'Product and safety operations', units: 540000, percent: 10 },
      { dept: 'Policy, legal, and operations', units: 270000, percent: 5 },
    ],
  },
];
