export type GrantType = 'ISO' | 'NSO' | 'RSU' | 'ESPP';

export type VestingScheduleType = 
  | '4_YEAR_1_YEAR_CLIFF'   // Standard 25% at 12 mo, then 1/48th per month for 36 months
  | '3_YEAR_MONTHLY'         // Monthly straight line over 36 months
  | '4_YEAR_MONTHLY_NO_CLIFF'// Monthly straight line over 48 months
  | 'CUSTOM';

export type GrantStatus = 
  | 'VESTING' 
  | 'FULLY_VESTED' 
  | 'EXPIRING_SOON' 
  | 'EXPIRED' 
  | 'EXERCISED';

export type ActionStatus = 
  | 'PENDING' 
  | 'EXERCISED' 
  | 'SOLD' 
  | 'DECLINED' 
  | 'SNOOZED' 
  | 'COMPLETED';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CompanyData {
  id: string;
  name: string;
  ticker?: string | null;
  isPublic: boolean;
  sector: string;
  description?: string | null;
  logoUrl?: string | null;
  foundedYear?: number | null;
  keyLeadership?: string | null;
  fundingHistory?: string | null;
  latestValuation?: number | null;
  latestFmvPerShare: number;
  lastFmvUpdateDate: string | Date;
}

export interface VestingEventData {
  id: string;
  grantId: string;
  vestDate: string | Date;
  unitsVested: number;
  isVested: boolean;
  cumulativeVested: number;
}

export interface GrantData {
  id: string;
  userId: string;
  companyId: string;
  company?: CompanyData;
  grantIdentifier: string;
  grantType: GrantType;
  unitsGranted: number;
  strikePrice: number;
  grantDate: string | Date;
  vestingStartDate: string | Date;
  cliffMonths: number;
  vestingSchedule: VestingScheduleType;
  expirationDate: string | Date;
  status: GrantStatus;
  documentName?: string | null;
  documentPath?: string | null;
  earlyExercisable: boolean;
  notes?: string | null;
  vestingEvents?: VestingEventData[];
  
  // Computed portfolio metrics for convenience
  vestedUnits?: number;
  unvestedUnits?: number;
  vestedValue?: number;
  unvestedValue?: number;
  totalExerciseCost?: number;
  vestedExerciseCost?: number;
  nextVestingDate?: string | Date | null;
  nextVestingUnits?: number | null;
}

export interface TaxBracketSettings {
  federalTaxRate: number;      // e.g. 0.24, 0.32, 0.37
  stateTaxRate: number;        // e.g. 0.093 (CA), 0.0685 (NY), 0.00 (WA/TX)
  capitalGainsRate: number;    // Long term capital gains: 0.15 or 0.20
  stateCapitalGainsRate: number;// Usually same as ordinary state rate
  ficaRate: number;            // 0.0145 Medicare + 0.009 Additional Medicare = ~0.0235
  filingStatus: 'SINGLE' | 'MARRIED_JOINT' | 'HEAD_OF_HOUSEHOLD';
}

export interface SimulationInputs {
  unitsToExercise: number;
  assumedExitPrice: number;
  currentFmv: number;
  strikePrice: number;
  grantType: GrantType;
  holdingPeriod: 'SHORT_TERM' | 'LONG_TERM';
  taxSettings: TaxBracketSettings;
  yearsFromGrant?: number;
  yearsFromExercise?: number;
}

export interface SimulationResult {
  unitsExercised: number;
  strikePrice: number;
  exerciseCost: number;
  currentFmv: number;
  assumedExitPrice: number;
  grossExitValue: number;
  grossGain: number; // Gross Exit Value - Exercise Cost
  
  // Tax breakdown
  exerciseTax: {
    ordinaryIncomeTax: number;
    stateTax: number;
    ficaTax: number;
    amtSpread: number;
    estimatedAmtLiability: number;
    totalTaxAtExercise: number;
  };
  
  exitTax: {
    capitalGainsTax: number;
    stateCapitalGainsTax: number;
    totalTaxAtExit: number;
  };

  totalEstimatedTax: number;
  estimatedNetProfit: number; // Gross Gain - Total Estimated Tax
  effectiveTaxRate: number;
  dispositionType: 'QUALIFYING' | 'DISQUALIFYING' | 'N_A';
  isEstimate: boolean;
  disclaimer: string;
}

export interface ActionReminderItem {
  id: string;
  userId: string;
  grantId?: string | null;
  grant?: GrantData | null;
  type: string;
  title: string;
  description?: string | null;
  dueDate: string | Date;
  status: ActionStatus;
  snoozedUntil?: string | Date | null;
  urgency: UrgencyLevel;
  createdAt?: string | Date;
}
