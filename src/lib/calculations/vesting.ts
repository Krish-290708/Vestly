import { addMonths, isBefore, isAfter, isEqual } from 'date-fns';
import { VestingScheduleType, VestingEventData } from '@/types';

export interface GeneratedVestingEvent {
  vestDate: Date;
  unitsVested: number;
  cumulativeVested: number;
  isVested: boolean;
}

/**
 * Generates exact vesting tranches based on schedule configuration
 */
export function generateVestingSchedule(
  totalUnits: number,
  vestingStartDate: Date | string,
  vestingSchedule: VestingScheduleType = '4_YEAR_1_YEAR_CLIFF',
  cliffMonths: number = 12,
  asOfDate: Date = new Date()
): GeneratedVestingEvent[] {
  const startDate = new Date(vestingStartDate);
  const events: GeneratedVestingEvent[] = [];
  
  if (totalUnits <= 0) return events;

  if (vestingSchedule === '4_YEAR_1_YEAR_CLIFF') {
    const totalMonths = 48;
    const monthlyRate = totalUnits / totalMonths;
    let accumulated = 0;

    // Month 1 to Cliff (e.g., month 12): Nothing vests until cliff
    // At cliff month (month 12), cliffFraction = cliffMonths / 48 (typically 25%) vests all at once!
    const cliffDate = addMonths(startDate, cliffMonths);
    const cliffUnits = Math.round(monthlyRate * cliffMonths);
    accumulated += cliffUnits;

    events.push({
      vestDate: cliffDate,
      unitsVested: cliffUnits,
      cumulativeVested: accumulated,
      isVested: isBefore(cliffDate, asOfDate) || isEqual(cliffDate, asOfDate),
    });

    // Subsequent months after cliff up to totalMonths (e.g., months 13 to 48)
    for (let month = cliffMonths + 1; month <= totalMonths; month++) {
      const trancheDate = addMonths(startDate, month);
      let trancheUnits = Math.round(monthlyRate);
      
      // On the very last month, true-up any rounding discrepancy
      if (month === totalMonths) {
        trancheUnits = totalUnits - accumulated;
      }
      accumulated += trancheUnits;

      events.push({
        vestDate: trancheDate,
        unitsVested: trancheUnits,
        cumulativeVested: accumulated,
        isVested: isBefore(trancheDate, asOfDate) || isEqual(trancheDate, asOfDate),
      });
    }
  } else if (vestingSchedule === '3_YEAR_MONTHLY') {
    const totalMonths = 36;
    const monthlyUnits = totalUnits / totalMonths;
    let accumulated = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const trancheDate = addMonths(startDate, month);
      let units = Math.round(monthlyUnits);
      if (month === totalMonths) {
        units = totalUnits - accumulated;
      }
      accumulated += units;

      events.push({
        vestDate: trancheDate,
        unitsVested: units,
        cumulativeVested: accumulated,
        isVested: isBefore(trancheDate, asOfDate) || isEqual(trancheDate, asOfDate),
      });
    }
  } else {
    // 4-year monthly without cliff
    const totalMonths = 48;
    const monthlyUnits = totalUnits / totalMonths;
    let accumulated = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const trancheDate = addMonths(startDate, month);
      let units = Math.round(monthlyUnits);
      if (month === totalMonths) {
        units = totalUnits - accumulated;
      }
      accumulated += units;

      events.push({
        vestDate: trancheDate,
        unitsVested: units,
        cumulativeVested: accumulated,
        isVested: isBefore(trancheDate, asOfDate) || isEqual(trancheDate, asOfDate),
      });
    }
  }

  return events;
}

/**
 * Calculates current vested units, unvested units, and next vesting event
 */
export function calculateVestingProgress(
  events: GeneratedVestingEvent[] | VestingEventData[],
  totalUnits: number,
  asOfDate: Date = new Date()
) {
  let vestedUnits = 0;
  let nextEvent: { vestDate: Date | string; unitsVested: number } | null = null;

  for (const event of events) {
    const eventDate = new Date(event.vestDate);
    if (isBefore(eventDate, asOfDate) || isEqual(eventDate, asOfDate)) {
      vestedUnits = event.cumulativeVested;
    } else {
      if (!nextEvent) {
        nextEvent = {
          vestDate: event.vestDate,
          unitsVested: event.unitsVested,
        };
      }
    }
  }

  // Cap vested units at totalUnits
  vestedUnits = Math.min(vestedUnits, totalUnits);
  const unvestedUnits = Math.max(0, totalUnits - vestedUnits);
  const percentVested = totalUnits > 0 ? (vestedUnits / totalUnits) * 100 : 0;

  return {
    vestedUnits,
    unvestedUnits,
    percentVested: Math.round(percentVested * 10) / 10,
    nextVestingDate: nextEvent ? nextEvent.vestDate : null,
    nextVestingUnits: nextEvent ? nextEvent.unitsVested : null,
  };
}

/**
 * Generates a normalized monthly cumulative timeline dataset for Recharts
 */
export function buildCombinedTimeline(grants: Array<{
  id: string;
  grantIdentifier: string;
  companyName: string;
  unitsGranted: number;
  vestingEvents: GeneratedVestingEvent[] | VestingEventData[];
}>) {
  const dateMap = new Map<string, { date: string; cumulativeVested: number; totalGranted: number }>();
  let grandTotalGranted = 0;

  grants.forEach(g => {
    grandTotalGranted += g.unitsGranted;
  });

  // Extract all distinct dates in sorted order
  const allEvents = grants.flatMap(g => 
    (g.vestingEvents || []).map(e => ({
      dateStr: new Date(e.vestDate).toISOString().split('T')[0],
      dateObj: new Date(e.vestDate),
    }))
  ).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  // Aggregate monthly or per-event
  const chartPoints: Array<{
    date: string;
    formattedDate: string;
    cumulativeVested: number;
    totalGranted: number;
    percentVested: number;
  }> = [];

  // Group by Month Year
  const monthlyBuckets = new Map<string, number>();

  grants.forEach(grant => {
    (grant.vestingEvents || []).forEach(evt => {
      const d = new Date(evt.vestDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const current = monthlyBuckets.get(key) || 0;
      monthlyBuckets.set(key, current + evt.unitsVested);
    });
  });

  const sortedKeys = Array.from(monthlyBuckets.keys()).sort();
  let rollingVested = 0;

  sortedKeys.forEach(monthKey => {
    const vestedInMonth = monthlyBuckets.get(monthKey) || 0;
    rollingVested += vestedInMonth;
    const dateObj = new Date(monthKey);
    chartPoints.push({
      date: monthKey,
      formattedDate: dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      cumulativeVested: Math.min(rollingVested, grandTotalGranted),
      totalGranted: grandTotalGranted,
      percentVested: grandTotalGranted > 0 ? Math.round((rollingVested / grandTotalGranted) * 100) : 0,
    });
  });

  return chartPoints;
}
