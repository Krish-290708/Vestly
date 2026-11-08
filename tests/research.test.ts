import { describe, it, expect } from 'vitest';
import { projectPoolRunway, COMPANY_POOL_PRESETS } from '../src/lib/calculations/pool';
import { getMarketSessionStatus, MOCK_SECTOR_ETFS } from '../src/lib/finnhub';

describe('Option pool runway modeler (projectPoolRunway)', () => {
  it('correctly calculates reserve, overhang, and runway for standard 15% pool', () => {
    const result = projectPoolRunway({
      totalAuthorizedShares: 100000000,
      totalPoolShares: 15000000,
      grantedShares: 11200000,
      burnRatePerQuarter: 450000,
    });

    expect(result.unallocatedReserve).toBe(3800000);
    expect(result.poolPercent).toBe(15.0);
    expect(result.grantedPercentOfPool).toBe(74.7);
    expect(result.unallocatedPercentOfPool).toBe(25.3);
    expect(result.overhangPercent).toBe(11.2);
    // 3,800,000 / 450,000 = ~8.44 quarters * 3 = 25.3 months
    expect(result.runwayQuarters).toBe(8.4);
    expect(result.runwayMonths).toBe(25.3);
    expect(result.isRunwayCritical).toBe(false);
  });

  it('detects critical runway when under 4 quarters (1 year)', () => {
    const result = projectPoolRunway({
      totalAuthorizedShares: 50000000,
      totalPoolShares: 5000000,
      grantedShares: 4400000,
      burnRatePerQuarter: 300000,
    });

    // 600,000 / 300,000 = 2.0 quarters
    expect(result.unallocatedReserve).toBe(600000);
    expect(result.runwayQuarters).toBe(2.0);
    expect(result.isRunwayCritical).toBe(true);
    // target 8 quarters = 2,400,000; deficit = 1,800,000
    expect(result.recommendedExpansionShares).toBe(1800000);
  });

  it('handles zero burn rate gracefully without division by zero', () => {
    const result = projectPoolRunway({
      totalAuthorizedShares: 10000000,
      totalPoolShares: 1000000,
      grantedShares: 500000,
      burnRatePerQuarter: 0,
    });

    expect(result.unallocatedReserve).toBe(500000);
    expect(result.runwayQuarters).toBe(999);
    expect(result.isRunwayCritical).toBe(false);
    expect(result.recommendedExpansionShares).toBe(0);
  });

  it('generates an 8-quarter projection array with monotonically decreasing reserve', () => {
    const result = projectPoolRunway({
      totalAuthorizedShares: 20000000,
      totalPoolShares: 2000000,
      grantedShares: 1000000,
      burnRatePerQuarter: 250000,
    });

    expect(result.projections).toHaveLength(8);
    expect(result.projections[0].startingReserve).toBe(1000000);
    expect(result.projections[0].endingReserve).toBe(750000);
    expect(result.projections[3].endingReserve).toBe(0);
    // Remaining quarters should stay at 0
    expect(result.projections[4].endingReserve).toBe(0);
    expect(result.projections[7].endingReserve).toBe(0);
  });

  it('contains valid company pool presets', () => {
    expect(COMPANY_POOL_PRESETS.length).toBeGreaterThanOrEqual(3);
    const stripe = COMPANY_POOL_PRESETS.find((p) => p.id === 'stripe');
    expect(stripe).toBeDefined();
    expect(stripe?.totalAuthorizedShares).toBe(100000000);
    expect(stripe?.departments.length).toBe(4);
  });
});

describe('Market data utilities', () => {
  it('returns valid session status with label and nextEvent', () => {
    const status = getMarketSessionStatus();
    expect(status).toHaveProperty('isOpen');
    expect(typeof status.isOpen).toBe('boolean');
    expect(status).toHaveProperty('label');
    expect(status).toHaveProperty('nextEvent');
  });

  it('exports verified mock sector ETFs', () => {
    expect(MOCK_SECTOR_ETFS.length).toBe(6);
    const xlk = MOCK_SECTOR_ETFS.find((s) => s.symbol === 'XLK');
    expect(xlk).toBeDefined();
    expect(xlk?.name).toContain('Technology');
  });
});
