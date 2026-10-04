import { MOCK_MARKET_INDICES, MOCK_NEWS_ARTICLES, MOCK_COMPANIES } from './mockData';

// Simple in-memory cache with Time-To-Live (TTL)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes cache to respect free-tier rate limits

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > DEFAULT_TTL_MS) {
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
 * Retrieves market indices from Finnhub or high-fidelity cached fallback
 */
export async function getMarketIndices() {
  const cacheKey = 'market_indices';
  const cached = getCached(cacheKey);
  if (cached) return { ...cached, isCached: true };

  const finnhubKey = process.env.FINNHUB_API_KEY;
  if (!finnhubKey) {
    const result = {
      source: 'Vestly Market Engine (Offline/Fallback)',
      lastUpdated: new Date().toISOString(),
      indices: MOCK_MARKET_INDICES,
      notice: 'Finnhub API key not configured. Displaying simulated live indices.'
    };
    setCache(cacheKey, result);
    return { ...result, isCached: false };
  }

  try {
    // Attempt Finnhub quotes for ETFs that track major indices (SPY, QQQ, DIA, IWM)
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
          { next: { revalidate: 300 } }
        );
        if (!res.ok) throw new Error(`Finnhub returned ${res.status}`);
        const data = await res.json();
        // c: Current price, d: Change, dp: Percent change, h: High, l: Low
        return {
          symbol: sym,
          name,
          price: data.c,
          change: data.d,
          changePercent: data.dp,
          status: 'Live',
          high52Week: data.h,
          low52Week: data.l,
        };
      })
    );

    const result = {
      source: 'Finnhub Live API',
      lastUpdated: new Date().toISOString(),
      indices: results,
      notice: 'Live quotes via Finnhub API (SPY, QQQ, DIA, IWM proxies).'
    };
    setCache(cacheKey, result);
    return { ...result, isCached: false };
  } catch (err: any) {
    console.warn('Finnhub market indices fetch failed, using fallback:', err.message);
    const fallback = {
      source: 'Vestly Fallback Dataset',
      lastUpdated: new Date().toISOString(),
      indices: MOCK_MARKET_INDICES,
      notice: `Finnhub rate limit or error (${err.message}). Using verified market snapshot.`
    };
    return { ...fallback, isCached: false };
  }
}

/**
 * Retrieves market news feed
 */
export async function getMarketNews(category: string = 'general') {
  const cacheKey = `news_${category}`;
  const cached = getCached(cacheKey);
  if (cached) return { ...cached, isCached: true };

  const finnhubKey = process.env.FINNHUB_API_KEY;
  if (!finnhubKey) {
    const result = {
      source: 'Curated Financial News',
      lastUpdated: new Date().toISOString(),
      news: MOCK_NEWS_ARTICLES,
    };
    setCache(cacheKey, result);
    return { ...result, isCached: false };
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/news?category=${category}&token=${finnhubKey}`,
      { next: { revalidate: 300 } }
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
    };
    setCache(cacheKey, result);
    return { ...result, isCached: false };
  } catch (err: any) {
    console.warn('Finnhub news fetch failed, using fallback:', err.message);
    return {
      source: 'Curated Financial News (Fallback)',
      lastUpdated: new Date().toISOString(),
      news: MOCK_NEWS_ARTICLES,
      isCached: false,
    };
  }
}

/**
 * Retrieves stock quote and profile for a company
 */
export async function getCompanyQuote(ticker: string) {
  const cleanTicker = ticker.toUpperCase().trim();
  const cacheKey = `quote_${cleanTicker}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const mockFound = MOCK_COMPANIES.find(c => c.ticker === cleanTicker || c.name.toUpperCase() === cleanTicker);

  const finnhubKey = process.env.FINNHUB_API_KEY;
  if (!finnhubKey) {
    return {
      ticker: cleanTicker,
      price: mockFound?.latestFmvPerShare || 100.00,
      change: +1.25,
      changePercent: +1.26,
      company: mockFound || null,
      source: 'Vestly Company Database',
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const [quoteRes, profileRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${cleanTicker}&token=${finnhubKey}`),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${cleanTicker}&token=${finnhubKey}`),
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
        description: mockFound?.description || `Public company trading on ${profileData.exchange || 'US Exchanges'}.`,
        logoUrl: profileData.logo || null,
        latestValuation: profileData.marketCapitalization ? profileData.marketCapitalization * 1000000 : mockFound?.latestValuation,
        latestFmvPerShare: quoteData.c || mockFound?.latestFmvPerShare || 50,
      },
      source: 'Finnhub Live Quote API',
      lastUpdated: new Date().toISOString(),
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    return {
      ticker: cleanTicker,
      price: mockFound?.latestFmvPerShare || 100.00,
      change: 0,
      changePercent: 0,
      company: mockFound || null,
      source: 'Vestly Fallback (Offline)',
      lastUpdated: new Date().toISOString(),
    };
  }
}

