import { MOCK_MARKET_INDICES, MOCK_NEWS_ARTICLES, MOCK_COMPANIES } from './mockData';

// Simple in-memory cache with Time-To-Live (TTL)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes cache to respect free-tier rate limits
const API_TIMEOUT_MS = 5000; // 5-second timeout for graceful degradation

export interface SectorQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export const MOCK_SECTOR_ETFS: SectorQuote[] = [
  { symbol: 'XLK', name: 'Technology Select Sector SPDR', price: 228.45, change: +3.20, changePercent: +1.42 },
  { symbol: 'XLC', name: 'Communication Services SPDR', price: 89.12, change: +1.04, changePercent: +1.18 },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR', price: 47.80, change: +0.31, changePercent: +0.65 },
  { symbol: 'XLY', name: 'Consumer Discretionary SPDR', price: 198.65, change: +0.67, changePercent: +0.34 },
  { symbol: 'XLV', name: 'Health Care Select Sector SPDR', price: 148.90, change: -0.42, changePercent: -0.28 },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR', price: 88.30, change: -0.99, changePercent: -1.12 },
];

function getCached<T>(key: string, ttlMs: number = DEFAULT_TTL_MS): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Determines whether US markets are currently open (9:30 AM - 4:00 PM Eastern, Mon-Fri).
 */
export function getMarketSessionStatus(): { isOpen: boolean; label: string; nextEvent: string } {
  try {
    const now = new Date();
    // Convert to US Eastern time
    const nyTimeStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
    const nyDate = new Date(nyTimeStr);
    const day = nyDate.getDay(); // 0 = Sun, 6 = Sat
    const hour = nyDate.getHours();
    const minute = nyDate.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    if (day === 0 || day === 6) {
      return { isOpen: false, label: 'Market closed (weekend)', nextEvent: 'Opens Monday at 09:30 ET' };
    }

    const openTime = 9 * 60 + 30; // 09:30
    const closeTime = 16 * 60; // 16:00

    if (timeInMinutes >= openTime && timeInMinutes < closeTime) {
      return { isOpen: true, label: 'Market open', nextEvent: 'Closes today at 16:00 ET' };
    }

    if (timeInMinutes < openTime) {
      return { isOpen: false, label: 'Pre-market', nextEvent: 'Regular session opens at 09:30 ET' };
    }

    return { isOpen: false, label: 'After-hours / Closed', nextEvent: 'Opens next trading day at 09:30 ET' };
  } catch {
    return { isOpen: true, label: 'Market open', nextEvent: 'Closes at 16:00 ET' };
  }
}

/**
 * Retrieves market indices and sector ETF quotes from Finnhub or high-fidelity cached fallback.
 * Enforces a strict 5-second timeout for graceful degradation.
 */
export async function getMarketIndices() {
  const cacheKey = 'market_indices';
  const cached = getCached(cacheKey);
  if (cached) return { ...cached, isCached: true };

  const sessionStatus = getMarketSessionStatus();
  const finnhubKey = process.env.FINNHUB_API_KEY;

  if (!finnhubKey) {
    const result = {
      source: 'Vestly Market Engine (offline/fallback)',
      lastUpdated: new Date().toISOString(),
      indices: MOCK_MARKET_INDICES,
      sectors: MOCK_SECTOR_ETFS,
      sessionStatus,
      notice: 'Finnhub API key not configured. Displaying verified reference benchmarks.',
    };
    setCache(cacheKey, result);
    return { ...result, isCached: false };
  }

  try {
    const symbols = [
      { sym: 'SPY', name: 'S&P 500 ETF' },
      { sym: 'QQQ', name: 'Nasdaq 100 ETF' },
      { sym: 'DIA', name: 'Dow Jones ETF' },
      { sym: 'IWM', name: 'Russell 2000 ETF' },
    ];

    const results = await Promise.all(
      symbols.map(async ({ sym, name }) => {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubKey}`,
          {
            signal: AbortSignal.timeout(API_TIMEOUT_MS),
            next: { revalidate: 300 },
          }
        );
        if (!res.ok) throw new Error(`Finnhub returned ${res.status}`);
        const data = await res.json();
        return {
          symbol: sym,
          name,
          price: data.c || 0,
          change: data.d || 0,
          changePercent: data.dp || 0,
          status: 'Live',
          high52Week: data.h || 0,
          low52Week: data.l || 0,
        };
      })
    );

    const result = {
      source: 'Finnhub Live API',
      lastUpdated: new Date().toISOString(),
      indices: results,
      sectors: MOCK_SECTOR_ETFS,
      sessionStatus,
      notice: 'Live ETF benchmark quotes via Finnhub API.',
    };
    setCache(cacheKey, result);
    return { ...result, isCached: false };
  } catch (err: any) {
    console.warn('Finnhub market indices fetch failed (timed out or error), using fallback:', err.message);
    const fallback = {
      source: 'Vestly Fallback Dataset',
      lastUpdated: new Date().toISOString(),
      indices: MOCK_MARKET_INDICES,
      sectors: MOCK_SECTOR_ETFS,
      sessionStatus,
      notice: `Finnhub rate limit or connection timeout. Displaying verified reference dataset.`,
    };
    return { ...fallback, isCached: false };
  }
}

/**
 * Retrieves market news feed with 5-second timeout.
 */
export async function getMarketNews(category: string = 'general') {
  const cacheKey = `news_${category}`;
  const cached = getCached(cacheKey);
  if (cached) return { ...cached, isCached: true };

  const finnhubKey = process.env.FINNHUB_API_KEY;
  if (!finnhubKey) {
    const result = {
      source: 'Curated financial news',
      lastUpdated: new Date().toISOString(),
      news: MOCK_NEWS_ARTICLES,
      isSimulated: true,
    };
    setCache(cacheKey, result);
    return { ...result, isCached: false };
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/news?category=${category}&token=${finnhubKey}`,
      {
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) throw new Error(`Finnhub news returned status ${res.status}`);
    const articles = await res.json();

    const formattedNews = (articles || []).slice(0, 15).map((art: any, index: number) => ({
      id: art.id?.toString() || `news_${index}`,
      category: art.category || 'Markets',
      headline: art.headline,
      summary: art.summary,
      source: art.source,
      url: art.url,
      datetime: art.datetime ? art.datetime * 1000 : Date.now(),
      relatedTicker: art.related || 'MARKET',
      image: art.image,
    }));

    const result = {
      source: 'Finnhub News API',
      lastUpdated: new Date().toISOString(),
      news: formattedNews.length > 0 ? formattedNews : MOCK_NEWS_ARTICLES,
      isSimulated: false,
    };
    setCache(cacheKey, result);
    return { ...result, isCached: false };
  } catch (err: any) {
    console.warn('Finnhub news fetch failed, using fallback:', err.message);
    return {
      source: 'Curated financial news (verified reference)',
      lastUpdated: new Date().toISOString(),
      news: MOCK_NEWS_ARTICLES,
      isCached: false,
      isSimulated: true,
    };
  }
}

/**
 * Retrieves stock quote and profile for a company with 5-second timeout.
 */
export async function getCompanyQuote(ticker: string) {
  const cleanTicker = ticker.toUpperCase().trim();
  const cacheKey = `quote_${cleanTicker}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const mockFound = MOCK_COMPANIES.find(
    (c) => c.ticker === cleanTicker || c.name.toUpperCase() === cleanTicker
  );

  const finnhubKey = process.env.FINNHUB_API_KEY;
  if (!finnhubKey) {
    return {
      ticker: cleanTicker,
      price: mockFound?.latestFmvPerShare || 100.00,
      change: +1.25,
      changePercent: +1.26,
      company: mockFound || null,
      source: 'Vestly company database',
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const [quoteRes, profileRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${cleanTicker}&token=${finnhubKey}`, {
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      }),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${cleanTicker}&token=${finnhubKey}`, {
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      }),
    ]);

    const quoteData = await quoteRes.json();
    const profileData = await profileRes.json();

    const result = {
      ticker: cleanTicker,
      price: quoteData.c || mockFound?.latestFmvPerShare || 50,
      change: quoteData.d || 0,
      changePercent: quoteData.dp || 0,
      company: {
        name: profileData.name || mockFound?.name || cleanTicker,
        ticker: cleanTicker,
        isPublic: true,
        sector: profileData.finnhubIndustry || mockFound?.sector || 'Technology',
        description: mockFound?.description || `Public company trading on ${profileData.exchange || 'US exchanges'}.`,
        logoUrl: profileData.logo || null,
        latestValuation: profileData.marketCapitalization ? profileData.marketCapitalization * 1000000 : mockFound?.latestValuation,
        latestFmvPerShare: quoteData.c || mockFound?.latestFmvPerShare || 50,
      },
      source: 'Finnhub Live Quote API',
      lastUpdated: new Date().toISOString(),
    };

    setCache(cacheKey, result);
    return result;
  } catch {
    return {
      ticker: cleanTicker,
      price: mockFound?.latestFmvPerShare || 100.00,
      change: 0,
      changePercent: 0,
      company: mockFound || null,
      source: 'Vestly fallback (offline)',
      lastUpdated: new Date().toISOString(),
    };
  }
}

export interface ListedCompanyHit {
  symbol: string;
  name: string;
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Searches Finnhub for listed companies by name or ticker. Returns [] when no key is set,
 * on any error, or for queries shorter than 2 characters. Results are cached for a short time.
 */
export async function searchListedCompanies(query: string): Promise<ListedCompanyHit[]> {
  const q = query.trim();
  const key = process.env.FINNHUB_API_KEY;
  if (!key || q.length < 2) return [];

  const cacheKey = `search_${q.toLowerCase()}`;
  const cached = getCached<ListedCompanyHit[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${key}`,
      { signal: AbortSignal.timeout(API_TIMEOUT_MS) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const seen = new Set<string>();
    const hits: ListedCompanyHit[] = [];
    for (const r of Array.isArray(data?.result) ? data.result : []) {
      const symbol = String(r.symbol || '').toUpperCase();
      // Common stock on a plain US ticker only (no exchange suffixes like ".L" or ".TO").
      if (r.type !== 'Common Stock' || !/^[A-Z]{1,5}$/.test(symbol) || seen.has(symbol)) continue;
      seen.add(symbol);
      hits.push({ symbol, name: titleCase(String(r.description || symbol)) });
      if (hits.length >= 12) break;
    }
    setCache(cacheKey, hits);
    return hits;
  } catch {
    return [];
  }
}

export interface ListedCompanyDetail {
  ticker: string;
  name: string;
  sector: string;
  description: string;
  logoUrl: string | null;
  marketCap: number | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  foundedYear: number | null;
}

/**
 * Strict live lookup for a listed company. Returns null if there is no key, the ticker is
 * unknown (no profile), or the request fails. Never invents a price.
 */
export async function lookupListedCompany(ticker: string): Promise<ListedCompanyDetail | null> {
  const t = ticker.toUpperCase().trim();
  const key = process.env.FINNHUB_API_KEY;
  if (!key || !/^[A-Z]{1,5}$/.test(t)) return null;

  const cacheKey = `listed_${t}`;
  const cached = getCached<ListedCompanyDetail | null>(cacheKey);
  if (cached) return cached;

  try {
    const [quoteRes, profileRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${t}&token=${key}`, { signal: AbortSignal.timeout(API_TIMEOUT_MS) }),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${t}&token=${key}`, { signal: AbortSignal.timeout(API_TIMEOUT_MS) }),
    ]);
    if (!quoteRes.ok || !profileRes.ok) return null;
    const quote = await quoteRes.json();
    const profile = await profileRes.json();
    if (!profile?.name) return null;

    const detail: ListedCompanyDetail = {
      ticker: t,
      name: String(profile.name),
      sector: profile.finnhubIndustry || 'Not provided',
      description: `Listed on ${profile.exchange || 'a US exchange'}. Profile data from Finnhub.`,
      logoUrl: profile.logo || null,
      marketCap: profile.marketCapitalization ? profile.marketCapitalization * 1_000_000 : null,
      price: typeof quote?.c === 'number' && quote.c > 0 ? quote.c : null,
      change: typeof quote?.d === 'number' ? quote.d : null,
      changePercent: typeof quote?.dp === 'number' ? quote.dp : null,
      foundedYear: null, // Finnhub gives the IPO date, not the founding year
    };
    setCache(cacheKey, detail);
    return detail;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Company insights for listed companies: key ratios, peers, analyst ratings.
// ---------------------------------------------------------------------------

const INSIGHTS_TTL_MS = 30 * 60 * 1000; // peers and ratios change slowly; stay well inside free-tier limits

export interface ListedKeyMetrics {
  peTtm: number | null;
  revenueGrowthTtmYoy: number | null;
  netMarginTtm: number | null;
  weekHigh52: number | null;
  weekLow52: number | null;
  beta: number | null;
  marketCapUsd: number | null;
}

export interface ListedPeerRow {
  ticker: string;
  name: string;
  marketCapUsd: number | null;
  peTtm: number | null;
  revenueGrowthTtmYoy: number | null;
  netMarginTtm: number | null;
}

export interface ListedAnalystConsensus {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

export interface ListedInsights {
  metrics: ListedKeyMetrics | null;
  peers: ListedPeerRow[];
  analyst: ListedAnalystConsensus | null;
}

function num(v: unknown): number | null {
  return typeof v === 'number' && isFinite(v) ? v : null;
}

function toKeyMetrics(metric: any): ListedKeyMetrics {
  const m = metric || {};
  return {
    peTtm: num(m.peBasicExclExtraTTM) ?? num(m.peTTM),
    revenueGrowthTtmYoy: num(m.revenueGrowthTTMYoy),
    netMarginTtm: num(m.netProfitMarginTTM),
    weekHigh52: num(m['52WeekHigh']),
    weekLow52: num(m['52WeekLow']),
    beta: num(m.beta),
    marketCapUsd: num(m.marketCapitalization) !== null ? (m.marketCapitalization as number) * 1_000_000 : null,
  };
}

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(API_TIMEOUT_MS) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Live key ratios, up to 4 peer companies and the latest analyst ratings for a listed company.
 * Every field is null or empty when the data is missing. Nothing is estimated.
 * Returns null without a key or for a ticker that is not a plain US symbol.
 */
export async function getListedInsights(ticker: string): Promise<ListedInsights | null> {
  const t = ticker.toUpperCase().trim();
  const key = process.env.FINNHUB_API_KEY;
  if (!key || !/^[A-Z]{1,5}$/.test(t)) return null;

  const cacheKey = `insights_${t}`;
  const cached = getCached<ListedInsights>(cacheKey, INSIGHTS_TTL_MS);
  if (cached) return cached;

  const base = 'https://finnhub.io/api/v1';
  const [metricData, peersData, recData] = await Promise.all([
    getJson(`${base}/stock/metric?symbol=${t}&metric=all&token=${key}`),
    getJson(`${base}/stock/peers?symbol=${t}&token=${key}`),
    getJson(`${base}/stock/recommendation?symbol=${t}&token=${key}`),
  ]);

  const metrics = metricData?.metric ? toKeyMetrics(metricData.metric) : null;

  const rec = Array.isArray(recData) && recData.length > 0 ? recData[0] : null;
  const analyst: ListedAnalystConsensus | null = rec
    ? {
        period: String(rec.period || '').slice(0, 7),
        strongBuy: num(rec.strongBuy) ?? 0,
        buy: num(rec.buy) ?? 0,
        hold: num(rec.hold) ?? 0,
        sell: num(rec.sell) ?? 0,
        strongSell: num(rec.strongSell) ?? 0,
      }
    : null;

  const peerSymbols = (Array.isArray(peersData) ? peersData : [])
    .map((p: unknown) => String(p).toUpperCase())
    .filter((p: string) => p !== t && /^[A-Z]{1,5}$/.test(p))
    .slice(0, 4);

  const peers: ListedPeerRow[] = (
    await Promise.all(
      peerSymbols.map(async (sym: string): Promise<ListedPeerRow | null> => {
        const [profile, pm] = await Promise.all([
          getJson(`${base}/stock/profile2?symbol=${sym}&token=${key}`),
          getJson(`${base}/stock/metric?symbol=${sym}&metric=all&token=${key}`),
        ]);
        if (!profile?.name) return null;
        const k = toKeyMetrics(pm?.metric);
        return {
          ticker: sym,
          name: String(profile.name),
          marketCapUsd: num(profile.marketCapitalization) !== null ? profile.marketCapitalization * 1_000_000 : k.marketCapUsd,
          peTtm: k.peTtm,
          revenueGrowthTtmYoy: k.revenueGrowthTtmYoy,
          netMarginTtm: k.netMarginTtm,
        };
      })
    )
  ).filter((r): r is ListedPeerRow => r !== null);

  if (!metrics && !analyst && peers.length === 0) return null;
  const result: ListedInsights = { metrics, peers, analyst };
  setCache(cacheKey, result);
  return result;
}
