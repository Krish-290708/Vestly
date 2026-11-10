import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const dbCompanies = [
  { id: 'db_apple', name: 'Apple Inc.', ticker: 'AAPL', isPublic: true, sector: 'Consumer Electronics', description: 'x', latestValuation: 1, latestFmvPerShare: 190, lastFmvUpdateDate: new Date(), keyLeadership: null, fundingHistory: null, foundedYear: 1976, grants: [] },
  { id: 'db_notion', name: 'Notion', ticker: null, isPublic: false, sector: 'Productivity', description: 'y', latestValuation: 1, latestFmvPerShare: 18, lastFmvUpdateDate: new Date(), keyLeadership: null, fundingHistory: null, foundedYear: 2013, grants: [] },
];

vi.mock('../src/lib/db', () => ({
  prisma: {
    company: { findMany: vi.fn(async () => dbCompanies) },
    grant: { findMany: vi.fn(async () => []) },
    watchlistItem: { findMany: vi.fn(async () => []), findFirst: vi.fn(async () => null) },
  },
}));
vi.mock('../src/lib/auth', () => ({ getCurrentUser: vi.fn(async () => null) }));

import { GET as listGET } from '../src/app/api/market/companies/route';
import { GET as detailGET } from '../src/app/api/market/companies/[slug]/route';

const req = (url: string) => new Request(url) as any;
const realKey = process.env.FINNHUB_API_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  if (realKey === undefined) delete process.env.FINNHUB_API_KEY;
  else process.env.FINNHUB_API_KEY = realKey;
});

describe('GET /api/market/companies', () => {
  beforeEach(() => {
    delete process.env.FINNHUB_API_KEY;
  });

  it('lists 30+ companies with each listed company once', async () => {
    const { companies } = await (await listGET(req('http://x/api/market/companies?q='))).json();
    expect(companies.length).toBeGreaterThanOrEqual(30);
    const tickers = companies.filter((c: any) => c.isPublic && c.ticker).map((c: any) => c.ticker);
    expect(new Set(tickers).size).toBe(tickers.length);
    expect(companies.filter((c: any) => c.ticker === 'AAPL')).toHaveLength(1);
  });

  it('flags only database companies as followable', async () => {
    const { companies } = await (await listGET(req('http://x/api/market/companies?q='))).json();
    expect(companies.find((c: any) => c.ticker === 'AAPL').inDatabase).toBe(true);
    expect(companies.find((c: any) => c.name === 'OpenAI').inDatabase).toBe(false);
  });

  it('reports live search as inactive without a key and adds nothing from outside', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    const body = await (await listGET(req('http://x/api/market/companies?q=zzqx'))).json();
    expect(body.liveSearchActive).toBe(false);
    expect(body.companies).toHaveLength(0);
    expect(f).not.toHaveBeenCalled();
  });

  it('adds live listed-company matches with a ticker slug when a key is set, without duplicating catalog entries', async () => {
    process.env.FINNHUB_API_KEY = 'k';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: [
        { description: 'TESLA INC', symbol: 'TSLA', type: 'Common Stock' },
        { description: 'TESTCO HOLDINGS', symbol: 'TSTC', type: 'Common Stock' },
      ] }),
    }));
    const body = await (await listGET(req('http://x/api/market/companies?q=tes-route-1'))).json();
    expect(body.liveSearchActive).toBe(true);
    // Tesla is in the catalog: it appears once, with its full catalog record rather than a thin live one.
    const tsla = body.companies.filter((c: any) => c.ticker === 'TSLA');
    expect(tsla).toHaveLength(1);
    expect(tsla[0].keyLeadership).toMatch(/Musk/);
    const live = body.companies.find((c: any) => c.ticker === 'TSTC');
    expect(live).toMatchObject({ slug: 'tstc', isPublic: true, latestFmvPerShare: 0, inDatabase: false });
  });
});

describe('GET /api/market/companies/[slug]', () => {
  beforeEach(() => {
    delete process.env.FINNHUB_API_KEY;
  });
  const call = (slug: string) => detailGET(req('http://x/'), { params: { slug } });

  it('404s for an unknown company when there is no live data source', async () => {
    expect((await call('nonexistent-co')).status).toBe(404);
  });

  it('never returns generated funding rounds or a fabricated price history', async () => {
    const { company } = await (await call('openai')).json();
    expect(company.fundingRounds).toEqual([]);
    expect(company.historicalPrices).toEqual([]);
    expect(company.priceSource).toBe('none');
  });

  it('marks catalog or database prices as sample when no live quote is available', async () => {
    const { company } = await (await call('notion')).json();
    expect(company.priceSource).toBe('sample');
  });

  it('uses a live quote for a listed company found only through search', async () => {
    process.env.FINNHUB_API_KEY = 'k';
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => ({
      ok: true,
      json: async () => (url.includes('/quote') ? { c: 55.5, d: 1, dp: 1.8 } : { name: 'Detail Co', finnhubIndustry: 'Software', exchange: 'NYSE', marketCapitalization: 1000 }),
    })));
    const { company } = await (await call('dtl')).json();
    expect(company).toMatchObject({ name: 'Detail Co', ticker: 'DTL', priceSource: 'live', latestFmvPerShare: 55.5, isPublic: true });
  });

  it('404s when the live lookup finds no profile for the ticker', async () => {
    process.env.FINNHUB_API_KEY = 'k';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    expect((await call('nope')).status).toBe(404);
  });
});
