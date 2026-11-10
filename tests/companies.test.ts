import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { MOCK_COMPANIES, EXTRA_COMPANIES } from '../src/lib/mockData';
import { searchListedCompanies, lookupListedCompany } from '../src/lib/finnhub';

describe('Company catalog', () => {
  const all = [...MOCK_COMPANIES, ...EXTRA_COMPANIES];

  it('has at least 30 companies with no duplicate names or listed tickers', () => {
    expect(all.length).toBeGreaterThanOrEqual(30);
    const names = all.map((c) => c.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    const tickers = all.filter((c) => c.isPublic && c.ticker).map((c) => c.ticker as string);
    expect(new Set(tickers).size).toBe(tickers.length);
  });

  it('does not invent prices, valuations or tickers for the extra companies', () => {
    for (const c of EXTRA_COMPANIES) {
      expect(c.latestFmvPerShare).toBe(0);
      expect(c.latestValuation).toBeNull();
      expect(c.historicalPrices).toHaveLength(0);
      if (!c.isPublic) expect(c.ticker).toBeNull();
      if (c.isPublic) expect(c.ticker).toMatch(/^[A-Z]{1,5}$/);
    }
  });

  it('labels every extra company as sample data', () => {
    for (const c of EXTRA_COMPANIES) {
      expect(c.description).toMatch(/sample|live quotes/i);
    }
  });
});

describe('Live company search', () => {
  const realKey = process.env.FINNHUB_API_KEY;
  beforeEach(() => {
    process.env.FINNHUB_API_KEY = 'test-key';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    if (realKey === undefined) delete process.env.FINNHUB_API_KEY;
    else process.env.FINNHUB_API_KEY = realKey;
  });

  it('returns nothing and makes no request without a key or for a one-letter query', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    delete process.env.FINNHUB_API_KEY;
    expect(await searchListedCompanies('tesla')).toEqual([]);
    process.env.FINNHUB_API_KEY = 'test-key';
    expect(await searchListedCompanies('t')).toEqual([]);
    expect(f).not.toHaveBeenCalled();
  });

  it('keeps only plain US common stocks and removes duplicates', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          result: [
            { description: 'ACME CORP', symbol: 'ACME', type: 'Common Stock' },
            { description: 'ACME CORP', symbol: 'ACME', type: 'Common Stock' },
            { description: 'ACME LONDON', symbol: 'ACME.L', type: 'Common Stock' },
            { description: 'ACME FUND', symbol: 'ACMF', type: 'ETP' },
            { description: 'GLOBEX INC', symbol: 'GLBX', type: 'Common Stock' },
          ],
        }),
      })
    );
    const hits = await searchListedCompanies('acme-test-1');
    expect(hits).toEqual([
      { symbol: 'ACME', name: 'Acme Corp' },
      { symbol: 'GLBX', name: 'Globex Inc' },
    ]);
  });

  it('returns an empty list when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    expect(await searchListedCompanies('failing-query')).toEqual([]);
  });
});

describe('Listed company lookup', () => {
  const realKey = process.env.FINNHUB_API_KEY;
  beforeEach(() => {
    process.env.FINNHUB_API_KEY = 'test-key';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    if (realKey === undefined) delete process.env.FINNHUB_API_KEY;
    else process.env.FINNHUB_API_KEY = realKey;
  });

  const respond = (quote: object, profile: object) =>
    vi.fn().mockImplementation(async (url: string) => ({
      ok: true,
      json: async () => (url.includes('/quote') ? quote : profile),
    }));

  it('returns null for an unknown ticker (empty profile) instead of inventing a price', async () => {
    vi.stubGlobal('fetch', respond({ c: 0 }, {}));
    expect(await lookupListedCompany('ZZZZ')).toBeNull();
  });

  it('rejects tickers that are not plain US symbols without calling the API', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    expect(await lookupListedCompany('../etc')).toBeNull();
    expect(f).not.toHaveBeenCalled();
  });

  it('returns live price and market cap when the profile exists', async () => {
    vi.stubGlobal(
      'fetch',
      respond(
        { c: 123.45, d: 1.5, dp: 1.23 },
        { name: 'Test Co', finnhubIndustry: 'Software', exchange: 'NASDAQ', marketCapitalization: 2000 }
      )
    );
    const d = await lookupListedCompany('TSTA');
    expect(d?.name).toBe('Test Co');
    expect(d?.price).toBe(123.45);
    expect(d?.marketCap).toBe(2_000_000_000);
    expect(d?.sector).toBe('Software');
  });

  it('reports no price (not a fake one) when the quote is empty', async () => {
    vi.stubGlobal('fetch', respond({ c: 0 }, { name: 'Quiet Co' }));
    const d = await lookupListedCompany('QUIT');
    expect(d?.price).toBeNull();
  });
});
