import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  COMPANY_INSIGHTS,
  getCompanyInsight,
  buildPrivateScorecard,
  buildListedScorecard,
  pricedEvents,
} from '../src/lib/companyInsights';
import { getListedInsights } from '../src/lib/finnhub';

const NOW = new Date('2026-11-11T00:00:00Z');
const byKey = (k: string) => COMPANY_INSIGHTS.find((i) => i.key === k)!;
const row = (rows: { indicator: string; value: string }[], re: RegExp) => rows.find((r) => re.test(r.indicator));

describe('Researched company profiles', () => {
  it('have unique keys and a dated, linked source for every claim', () => {
    expect(new Set(COMPANY_INSIGHTS.map((i) => i.key)).size).toBe(COMPANY_INSIGHTS.length);
    for (const i of COMPANY_INSIGHTS) {
      expect(i.sources.length, i.key).toBeGreaterThan(0);
      expect(i.asOf, i.key).toMatch(/^\d{4}-\d{2}$/);
      for (const s of i.sources) expect(s.url, i.key).toMatch(/^https:\/\//);
      for (const e of i.events) {
        expect(e.date, `${i.key} ${e.headline}`).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/);
        expect(i.sources[e.source], `${i.key} event source`).toBeDefined();
      }
      for (const f of i.facts) expect(i.sources[f.source], `${i.key} fact source`).toBeDefined();
    }
  });

  it('only give valuations as positive numbers', () => {
    for (const i of COMPANY_INSIGHTS) for (const e of i.events) if (e.valuationUsd !== undefined) expect(e.valuationUsd).toBeGreaterThan(0);
  });

  it('never use rating or recommendation language of their own', () => {
    const text = JSON.stringify(COMPANY_INSIGHTS);
    expect(text).not.toMatch(/good investment|great investment|should (buy|invest)|we recommend|strong buy/i);
  });

  it('are found by name or ticker', () => {
    expect(getCompanyInsight('Stripe')?.key).toBe('stripe');
    expect(getCompanyInsight('Epic Games')?.key).toBe('epic-games');
    expect(getCompanyInsight('SpaceX Corp', 'SPCX')).toBeNull(); // key is the slug of the name; ticker 'spcx' is not a key
    expect(getCompanyInsight('Nothing Co')).toBeNull();
  });
});

describe('Private scorecard', () => {
  it('uses the latest priced event and computes the change from the one before', () => {
    const plaid = buildPrivateScorecard(byKey('plaid'), NOW);
    expect(row(plaid, /Latest priced/)!.value).toContain('$8B');
    expect(row(plaid, /Change from/)!.value).toMatch(/^\+31% over about 10 months$/);

    const rippling = buildPrivateScorecard(byKey('rippling'), NOW);
    expect(row(rippling, /Change from/)!.value).toMatch(/^\+25%/);

    const ramp = buildPrivateScorecard(byKey('ramp'), NOW);
    expect(row(ramp, /Change from/)!.value).toMatch(/^\+38%/);
  });

  it('counts only employee-sale events from the last 36 months', () => {
    expect(row(buildPrivateScorecard(byKey('anthropic'), NOW), /Employee sale events/)!.value).toBe('1');
    expect(row(buildPrivateScorecard(byKey('canva'), NOW), /Employee sale events/)!.value).toBe('2');
    // Notion's July 2022 tender is more than 36 months old, so only the Dec 2025 sale counts.
    expect(row(buildPrivateScorecard(byKey('notion'), NOW), /Employee sale events/)!.value).toBe('1');
    expect(row(buildPrivateScorecard(byKey('epic-games'), NOW), /Employee sale events/)!.value).toMatch(/None found/);
  });

  it('sorts events by date before deciding which is latest', () => {
    const shuffled = { ...byKey('revolut'), events: [...byKey('revolut').events].reverse() };
    expect(pricedEvents(shuffled).slice(-1)[0].valuationUsd).toBe(115_000_000_000);
  });

  it('flags old data as stale', () => {
    const old = { ...byKey('stripe'), asOf: '2026-01' };
    expect(row(buildPrivateScorecard(old, NOW), /fresh/)!.value).toMatch(/10 months ago/);
    const stale = buildPrivateScorecard(old, NOW).find((r) => /fresh/.test(r.indicator))!;
    expect((stale as any).meaning).toMatch(/more than six months/);
  });

  it('reports a company with no priced events without inventing a valuation', () => {
    const rows = buildPrivateScorecard({ ...byKey('epic-games'), events: [] }, NOW);
    expect(row(rows, /Latest priced/)).toBeUndefined();
  });
});

describe('Listed scorecard', () => {
  const m = { peTtm: 28.46, revenueGrowthTtmYoy: 12.3, netMarginTtm: 24.1, weekHigh52: 200, weekLow52: 100, beta: 1.25, marketCapUsd: 3e12 };
  const consensus = { period: '2026-10', strongBuy: 10, buy: 15, hold: 8, sell: 2, strongSell: 1 };

  it('shows each metric and the analyst split labelled as third-party opinion', () => {
    const rows = buildListedScorecard(m, 150, consensus);
    expect(row(rows, /Price to earnings/)!.value).toBe('28.5');
    expect(row(rows, /Revenue growth/)!.value).toBe('12.3%');
    expect(row(rows, /52-week/)!.value).toMatch(/^50%/);
    expect(row(rows, /Analyst/)!.indicator).toMatch(/third-party opinion/);
    expect(row(rows, /Analyst/)!.value).toBe('25 buy, 8 hold, 3 sell of 36 (2026-10)');
  });

  it('keeps the 52-week position between 0 and 100 when the price is outside the range', () => {
    expect(row(buildListedScorecard(m, 250, null), /52-week/)!.value).toMatch(/^100%/);
    expect(row(buildListedScorecard(m, 50, null), /52-week/)!.value).toMatch(/^0%/);
  });

  it('skips missing metrics instead of showing zero', () => {
    const rows = buildListedScorecard({ ...m, peTtm: null, beta: null }, null, null);
    expect(row(rows, /Price to earnings/)).toBeUndefined();
    expect(row(rows, /Beta/)).toBeUndefined();
    expect(row(rows, /52-week/)).toBeUndefined(); // no live price
  });

  it('falls back to the liquidity row alone with no live data', () => {
    expect(buildListedScorecard(null, null, null)).toHaveLength(1);
  });

  it('omits the analyst row when no analysts are reported', () => {
    expect(row(buildListedScorecard(m, 150, { ...consensus, strongBuy: 0, buy: 0, hold: 0, sell: 0, strongSell: 0 }), /Analyst/)).toBeUndefined();
  });
});

describe('Finnhub listed insights', () => {
  const realKey = process.env.FINNHUB_API_KEY;
  beforeEach(() => {
    process.env.FINNHUB_API_KEY = 'test-key';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    if (realKey === undefined) delete process.env.FINNHUB_API_KEY;
    else process.env.FINNHUB_API_KEY = realKey;
  });

  const respond = (routes: Record<string, any>) =>
    vi.fn().mockImplementation(async (url: string) => {
      const hit = Object.keys(routes).find((k) => url.includes(k));
      return { ok: !!hit, json: async () => (hit ? routes[hit] : {}) };
    });

  it('returns null without a key or for an invalid ticker, with no request', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    expect(await getListedInsights('../x')).toBeNull();
    delete process.env.FINNHUB_API_KEY;
    expect(await getListedInsights('AAA')).toBeNull();
    expect(f).not.toHaveBeenCalled();
  });

  it('combines metrics, analyst ratings and up to 4 valid peers, excluding the company itself', async () => {
    vi.stubGlobal(
      'fetch',
      respond({
        'stock/metric?symbol=ABCD': { metric: { peBasicExclExtraTTM: 20, revenueGrowthTTMYoy: 10, netProfitMarginTTM: 15, '52WeekHigh': 90, '52WeekLow': 60, beta: 1.1, marketCapitalization: 5000 } },
        'stock/recommendation': [{ period: '2026-10-01', strongBuy: 3, buy: 4, hold: 5, sell: 1, strongSell: 0 }, { period: '2026-09-01', strongBuy: 0, buy: 0, hold: 0, sell: 0, strongSell: 0 }],
        'stock/peers': ['ABCD', 'PEERA', 'PEERB', 'bad.sym', 'PEERC', 'PEERD', 'PEERE'],
        'stock/profile2?symbol=PEER': { name: 'Peer Co', marketCapitalization: 100 },
        'stock/metric?symbol=PEER': { metric: { peBasicExclExtraTTM: 30, revenueGrowthTTMYoy: 5, netProfitMarginTTM: 8 } },
      })
    );
    const r = await getListedInsights('ABCD');
    expect(r?.metrics).toMatchObject({ peTtm: 20, revenueGrowthTtmYoy: 10, netMarginTtm: 15, weekHigh52: 90, beta: 1.1, marketCapUsd: 5_000_000_000 });
    expect(r?.analyst).toEqual({ period: '2026-10', strongBuy: 3, buy: 4, hold: 5, sell: 1, strongSell: 0 });
    expect(r?.peers).toHaveLength(4);
    expect(r?.peers.map((p) => p.ticker)).toEqual(['PEERA', 'PEERB', 'PEERC', 'PEERD']);
    expect(r?.peers[0]).toMatchObject({ name: 'Peer Co', marketCapUsd: 100_000_000, peTtm: 30 });
  });

  it('returns null when Finnhub has nothing, rather than empty zeros', async () => {
    vi.stubGlobal('fetch', respond({}));
    expect(await getListedInsights('NOPE')).toBeNull();
  });

  it('survives a failed peer request and still returns the rest', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('stock/profile2')) throw new Error('boom');
        if (url.includes('stock/peers')) return { ok: true, json: async () => ['PART', 'XPEER'] };
        if (url.includes('stock/metric?symbol=PART')) return { ok: true, json: async () => ({ metric: { beta: 0.9 } }) };
        return { ok: true, json: async () => ({}) };
      })
    );
    const r = await getListedInsights('PART');
    expect(r?.metrics?.beta).toBe(0.9);
    expect(r?.peers).toEqual([]);
  });
});
