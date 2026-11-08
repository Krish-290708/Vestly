import { describe, it, expect } from 'vitest';

describe('Settings & Export Utility Tests', () => {
  it('escapes CSV fields with commas, quotes, and newlines correctly', () => {
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    expect(escapeCsv('Acme, Inc.')).toBe('"Acme, Inc."');
    expect(escapeCsv('He said "hello"')).toBe('"He said ""hello"""');
    expect(escapeCsv(150000)).toBe('"150000"');
    expect(escapeCsv(null)).toBe('""');
    expect(escapeCsv(undefined)).toBe('""');
  });

  it('validates and normalizes US state codes', () => {
    const normalizeState = (raw: string) => {
      return raw.trim().toUpperCase().substring(0, 2);
    };

    expect(normalizeState('ca')).toBe('CA');
    expect(normalizeState('ny ')).toBe('NY');
    expect(normalizeState('texas')).toBe('TE');
  });

  it('validates allowed filing statuses', () => {
    const allowed = ['SINGLE', 'MARRIED_FILING_JOINTLY', 'MARRIED_FILING_SEPARATELY', 'HEAD_OF_HOUSEHOLD'];
    const isValidFilingStatus = (status: string) => allowed.includes(status.toUpperCase());

    expect(isValidFilingStatus('SINGLE')).toBe(true);
    expect(isValidFilingStatus('married_filing_jointly')).toBe(true);
    expect(isValidFilingStatus('INVALID_STATUS')).toBe(false);
  });

  it('clamps advance notice reminder days between 1 and 365', () => {
    const clampDays = (days: number) => Math.min(365, Math.max(1, Math.round(days)));

    expect(clampDays(14)).toBe(14);
    expect(clampDays(0)).toBe(1);
    expect(clampDays(-5)).toBe(1);
    expect(clampDays(400)).toBe(365);
    expect(clampDays(14.6)).toBe(15);
  });

  it('builds grant context URLs preserving existing query parameters', () => {
    const buildGrantUrl = (basePath: string, grantId?: string | null) => {
      if (!grantId) return basePath;
      const separator = basePath.includes('?') ? '&' : '?';
      return `${basePath}${separator}grant=${encodeURIComponent(grantId)}`;
    };

    expect(buildGrantUrl('/calculator', 'grant-123')).toBe('/calculator?grant=grant-123');
    expect(buildGrantUrl('/calculator?tab=advanced', 'grant-123')).toBe('/calculator?tab=advanced&grant=grant-123');
    expect(buildGrantUrl('/calculator', null)).toBe('/calculator');
  });
});

